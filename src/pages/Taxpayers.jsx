/**
 * Componente para gestionar y visualizar contribuyentes en espera de aprobación.
 *
 * Características principales:
 * - Obtiene la lista de contribuyentes desde una API.
 * - Escucha eventos en tiempo real mediante Socket.IO para:
 *   - Agregar nuevos contribuyentes.
 *   - Actualizar el estado de contribuyentes existentes.
 * - Permite filtrar contribuyentes por CUIT y apellido.
 * - Muestra una tabla interactiva con la información y un botón para acceder a los detalles.
 *
 * @component
 * @returns {JSX.Element} Tabla de contribuyentes con filtros y eventos en tiempo real.
 */
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import ErrorResponse from '../components/ErrorResponse';
import Filter from '../components/Filter';
import Loading from '../components/Loading';
import { useNavigate } from 'react-router-dom';
import useFetch from '../helpers/hooks/useFetch';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import ErrorNotification from '../components/ErrorNotification';
import { handleError } from '../helpers/hooks/handleError';
import axios from 'axios';
import { useAuth } from '../context/AuthProvider';

const Taxpayers = () => {
    const URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    // Hook personalizado para obtener los datos iniciales
    const { data, loading, error, refetch } = useFetch(`${URL}/api/taxpayer`);
    const { data: config, refetch: refetchConfig } = useFetch(`${URL}/api/configuration`);

    // Estados locales
    const [buscarCuit, setBuscarCuit] = useState('');
    const [buscarApellido, setBuscarApellido] = useState('');
    const [taxpayers, setTaxpayers] = useState([]);

    // const [showConfirmModal, setShowConfirmModal] = useState(false);
    // const [showConfirmModalGoodTaxpayer, setShowConfirmModalGoodTaxpayer] = useState(false);  
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [msjModalExito, setMsjModalExito] = useState("");
    const [selectedTaxpayer, setSelectedTaxpayer] = useState(null);

    const [selectedGoodTaxpayer, setSelectedGoodTaxpayer] = useState(null);
    const [newEstado, setNewEstado] = useState('');
    // const [buscarEstado, setBuscarEstado] = useState('');


    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [showConfirmEstadoModal, setShowConfirmEstadoModal] = useState(false);

    // Guardo el valor del porcentaje de buen contribuyente
    const res = config?.response[0]  

    const [values, setValues] = useState([]);

    // Actualizar la lista cuando se reciben nuevos datos de la API
    useEffect(() => {
        if (data?.response) {
            setTaxpayers(data.response);
        } else {
            setTaxpayers([]);
        }
    }, [data]);

    // Configurar eventos del socket
    useEffect(() => {
        const socket = io(URL);
        // Evento: agregar nuevo contribuyente
        socket.on('nuevo-contribuyente', (nuevoContribuyente) => {
            setTaxpayers((prevTaxpayers) => [...prevTaxpayers, nuevoContribuyente]);
            refetch();
        });

        // Evento: elimina un contribuyente
        socket.on('borrado', (eliminado) => {
            setTaxpayers((prevTaxpayers) =>
                prevTaxpayers.filter((t) => t.id_contribuyente !== eliminado.id_contribuyente)
            );
            refetch();
        });

        socket.on('goodTaxpayer-actualizado', (actualizado) => {
            setTaxpayers((prevTaxpayers) =>
                prevTaxpayers.map((t) =>
                    t.id_contribuyente === actualizado.id_contribuyente
                        ? { ...t, es_buen_contribuyente: actualizado.es_buen_contribuyente }
                        : t
                )
            );
            refetch();
        });

        // Evento: actualizar estado de un contribuyente
        socket.on('estado-actualizado', (contribuyenteActualizado) => {
            if (contribuyenteActualizado && contribuyenteActualizado.id_contribuyente) {
                setTaxpayers((prevTaxpayers) =>
                    prevTaxpayers.map((c) =>
                        c.id_contribuyente === contribuyenteActualizado.id_contribuyente
                            ? { ...c, estado: contribuyenteActualizado.estado }
                            : c
                    )
                );
            } else {
                console.error('Estado actualizado inválido:', contribuyenteActualizado);
            }
        });

        socket.on('nuevos-valores', (nuevoValor) => {// Escucha el evento 'nuevos-valores' desde el servidor
            setValues((prev) => [...prev, nuevoValor]);// Actualiza el estado 'values' con el nuevo valor recibido
            refetchConfig();// Vuelve a hacer la solicitud para obtener los datos actualizados
        });    

        // Cleanup al desmontar el componente
        return () => {
            socket.disconnect();
        };
    }, [URL, refetch, refetchConfig]);

    // Aplicar filtros dinámicos
    const filtros = taxpayers.filter((c) => {
        if (!c?.cuit || !c?.apellido) return false; // Excluir datos incompletos
        const cuit = c.cuit.toString().includes(buscarCuit);
        const apellido = c.apellido.toLowerCase().includes(buscarApellido.toLowerCase());
        return cuit && apellido;
    });   

    const setError = (message) => {
        setErrorMessage(message);
    };

    const confirmDelete = (e, taxpayer) => {
        e.preventDefault();
        setSelectedTaxpayer(taxpayer);
        setShowConfirmDeleteModal(true);
    };

    const confirmEstadoChange = (e) => {
        e.preventDefault();
        setShowConfirmEstadoModal(true);
    };

    const daleteTaxpayer = async () => {
        try {
            const response = await axios.delete(`${URL}/api/taxpayer/${selectedTaxpayer.id}`, { withCredentials: true });
            if (response?.status === 200) {
                setShowSuccessModal(false);
                setMsjModalExito(response?.data.message)
                setTimeout(() => setShowSuccessModal(true), 100);
                refetch();
                setSelectedTaxpayer(null);

                setShowConfirmDeleteModal(false); // Cierra el modal de confirmación después del envío
            }
        } catch (error) {
            handleError(error, {
                on401: (message) => {
                    setError(message);
                    setTimeout(() => logout(), 3000);
                },
                on404: (message) => setError(message), // Puedes pasar cualquier función específica
                onOtherServerError: (message) => setError(message),
                onConnectionError: (message) => setError(message),
            });
        } finally {
            setShowSuccessModal(false);
            setShowConfirmDeleteModal(false);
        }
    }

    const changeEstado = async () => {
       
        try {
            // Aquí deberías hacer una petición para cambiar el estado para el buen contribuyente
            // Ejemplo:
            const response = await axios.put(`${URL}/api/taxpayer/${selectedGoodTaxpayer.id_contribuyente}/goodTaxpayer`, {
                newEstado
            }, { withCredentials: true });

            if (response?.status === 200) {
                setShowSuccessModal(false);
                setMsjModalExito(response?.data.message);
                setTimeout(() => setShowSuccessModal(true), 100);
                refetch();
                setSelectedGoodTaxpayer(null);
            }
        } catch (err) {
            handleError(error, {
                on401: (message) => {
                    setError(message);
                    setTimeout(() => logout(), 3000);
                },
                on404: (message) => setError(message), // Puedes pasar cualquier función específica
                onOtherServerError: (message) => setError(message),
                onConnectionError: (message) => setError(message),
            });
        } finally {
            setShowSuccessModal(false);
            setShowConfirmEstadoModal(false);
        }
    };
    

    const getEstadoTexto = (estado) => estado ? `Accede al ${res?.porcentaje_buen_contribuyente * 100}%` : "No accede al descuento";
    const getEstadoClass = (estado) => estado ? "btn btn-success btn-sm p-2" : "btn btn-secondary btn-sm p-2";

    const handleEditEstado = (contribuyente) => {
        setSelectedGoodTaxpayer(contribuyente);
        setNewEstado(contribuyente?.es_buen_contribuyente);       
    };

    return (
        <>
            {/* Sección de filtros */}
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card shadow-lg rounded-4 border-0">
                            <div className="card-body p-4">
                                <h5 className="card-title text-center text-primary mb-4">Filtros</h5>
                                <Filter search={buscarApellido} setSearch={setBuscarApellido} name="Apellido" type="text" placeholder="Ingrese apellido" />
                                <Filter search={buscarCuit} setSearch={setBuscarCuit} name="CUIT" type="number" placeholder="Ingrese CUIT" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de contribuyentes */}
            <div className="container mt-4 col-12">
                <div className="mt-4">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white text-center">
                            <h5 className="mb-0">Contribuyentes en espera para ser aprobados</h5>
                        </div>
                        <div className="row justify-content-center">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered text-center w-100" style={{ textAlign: "center", verticalAlign: "middle" }}>
                                        <thead className="thead-dark">
                                            <tr className="text-center align-middle">
                                                <th scope="col">#</th>
                                                <th scope="col">Nombre y Apellido</th>
                                                <th scope="col">CUIT</th>
                                                <th scope="col">Email</th>
                                                <th scope="col">Estado</th>
                                                {user?.rol === 'super_admin' &&
                                                    <th scope="col">Buen Contribuyente</th>
                                                }
                                                <th scope="col">Información</th>
                                                {user?.rol === 'super_admin' &&
                                                    <th scope="col">Eliminar</th>
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={user?.rol === 'super_admin' ? 8 : 6}>
                                                        <div className="d-flex justify-content-center">
                                                            <Loading />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : error || filtros?.length === 0 ? (
                                                <tr>
                                                    <td colSpan={user?.rol === 'super_admin' ? 8 : 6}>
                                                        <div className="text-danger">
                                                            <ErrorResponse
                                                                message={error?.message || 'No hay coincidencias'}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                    filtros.map((c, index) => (
                                                    <tr key={c?.id_contribuyente || Math.random()}>
                                                        <th>{index + 1}</th>
                                                        <td>{c?.nombre} {c?.apellido}</td>
                                                        <td>{c?.cuit}</td>
                                                        <td>{c?.email}</td>
                                                        <td>
                                                            {c?.estado ? (
                                                                <strong className="bi bi-check-circle text-success"> Habilitado</strong>
                                                            ) : (
                                                                <strong className="bi bi-x-circle text-danger"> Sin habilitar</strong>
                                                            )}
                                                        </td>
                                                            {user?.rol === 'super_admin' && (
                                                                <td>
                                                                    <span
                                                                        className={`badge ${getEstadoClass(c?.es_buen_contribuyente)}  btn-sm p-2`}
                                                                        onClick={() => handleEditEstado(c)}
                                                                        style={{ cursor: 'pointer', fontSize:'14px' }}
                                                                    >
                                                                        {getEstadoTexto(c?.es_buen_contribuyente)}
                                                                    </span>
                                                                </td>
                                                            )}
                                                        <td className="text-center">
                                                            <button
                                                                type="button"
                                                                    className="btn btn-warning text-dark btn-sm p-2 py-1"
                                                                onClick={() => navigate(`/contribuyente/${c?.id_contribuyente}`, { state: { contribuyente: c } })}
                                                            >
                                                                Ver Detalles
                                                            </button>
                                                        </td>
                                                            {user?.rol === 'super_admin' && (
                                                                <td>
                                                                    <button
                                                                        className="btn btn-danger btn-sm p-2 py-1"
                                                                        onClick={(e) => confirmDelete(e, {
                                                                            id: c?.id_contribuyente,
                                                                            nombre: `${c?.nombre} ${c?.apellido}`
                                                                        })}
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </td>
                                                            )}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedGoodTaxpayer && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
                    style={{ zIndex: 1050 }}
                >
                    <div className="bg-light rounded shadow-lg p-4" style={{ maxWidth: '400px', width: '90%' }}>
                        <form>
                            <h5 className="text-center text-primary mb-4">Determine si accede al descuento</h5>
                            <div className="mb-3">
                                <label htmlFor="estadoSelect" className="form-label fw-bold">
                                    Determine si es buen contribuyente
                                </label>
                                <select
                                    id="estadoSelect"
                                    className="form-select text-center"
                                    value={newEstado}
                                    onChange={(e) => setNewEstado(e.target.value)}
                                >
                                    {res && (
                                        <>
                                            <option value="true">
                                                Accede al {res.porcentaje_buen_contribuyente * 100}% de descuento
                                            </option>
                                            <option value="false">
                                                No accede al descuento
                                            </option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-primary flex-fill"
                                    onClick = { confirmEstadoChange }
                                >
                                    Cambiar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary flex-fill"
                                    onClick={() => setSelectedGoodTaxpayer(null)}
                                >
                                    Cancelar
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showConfirmDeleteModal && (
                <ConfirmModal
                    msj={`¿Deseas eliminar al contribuyente ${selectedTaxpayer?.nombre} y sus comercios? Esta acción no se podrá realizar si posee DDJJ cargadas.`}
                    setShowConfirmModal={setShowConfirmDeleteModal}
                    handleEstadoChange={(confirm) => confirm ? daleteTaxpayer() : setShowConfirmModal(false)}
                />
            )}

            {showConfirmEstadoModal && (
                <ConfirmModal
                    msj={(newEstado === true || newEstado === 'true') ?
                        `¿Deseas pasar a ${selectedGoodTaxpayer?.nombre} ${selectedGoodTaxpayer?.apellido} como buen contribuyente?`
                        :
                        "Deseas quitar los privilegios de buen contribuyente ?"}
                    setShowConfirmModal={setShowConfirmEstadoModal}
                    handleEstadoChange={(confirm) => confirm ? changeEstado() : setShowConfirmEstadoModal(false)}
                />
            )}

            <SuccessModal
                show={showSuccessModal}
                message={msjModalExito}
                duration={3000}
            />

            <ErrorNotification
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />
        </>
    );
};

export default Taxpayers;