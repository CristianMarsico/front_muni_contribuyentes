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
    // Estados locales
    const [buscarCuit, setBuscarCuit] = useState('');
    const [buscarApellido, setBuscarApellido] = useState('');
    const [taxpayers, setTaxpayers] = useState([]);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [msjModalExito, setMsjModalExito] = useState("");
    const [selectedTaxpayer, setSelectedTaxpayer] = useState({ id: "", nombre: "" });

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

        // Cleanup al desmontar el componente
        return () => {
            socket.disconnect();
        };
    }, [URL, refetch]);

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

    const handleSubmit = (e, id, nombre, apellido) => {
        e.preventDefault();
        setSelectedTaxpayer({ id, nombre: nombre + " " + apellido })
        setShowConfirmModal(true)
    }

    const handleConfirmChange = (confirm) => {
        if (confirm) {
            daleteTaxpayer();
        } else {
            setShowConfirmModal(false); // Cierra el modal si el usuario cancela
        }
    };

    const daleteTaxpayer = async () => {
        try {
            const response = await axios.delete(`${URL}/api/taxpayer/${selectedTaxpayer.id}`, { withCredentials: true });
            if (response?.status === 200) {
                setShowSuccessModal(false);
                setMsjModalExito(response?.data.message)
                setTimeout(() => setShowSuccessModal(true), 100);
                refetch();
                setSelectedTaxpayer({ id: '', nombre: '' });

                setShowConfirmModal(false); // Cierra el modal de confirmación después del envío
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
            setShowConfirmModal(false);
        }

    }

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
                                                <th scope="col">Nombre y Apellido</th>
                                                <th scope="col">CUIT</th>
                                                <th scope="col">Email</th>
                                                <th scope="col">Estado</th>
                                                <th scope="col">Información</th>
                                                {user?.rol === 'super_admin' &&
                                                    <th scope="col">Eliminar</th>
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={user?.rol === 'super_admin' ? 6 : 5}>
                                                        <div className="d-flex justify-content-center">
                                                            <Loading />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : error || filtros?.length === 0 ? (
                                                <tr>
                                                    <td colSpan={user?.rol === 'super_admin' ? 6 : 5}>
                                                        <div className="text-danger">
                                                            <ErrorResponse
                                                                message={error?.message || 'No hay coincidencias'}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filtros.map((c) => (
                                                    <tr key={c?.id_contribuyente || Math.random()}>
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
                                                        <td className="text-center">
                                                            <button
                                                                type="button"
                                                                className="btn btn-warning fw-bold"
                                                                onClick={() => navigate(`/contribuyente/${c.id_contribuyente}`, { state: { contribuyente: c } })}
                                                            >
                                                                Ver Detalles
                                                            </button>
                                                        </td>
                                                        {user?.rol === 'super_admin' &&
                                                            <td className="text-center">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger fw-bold"
                                                                    onClick={(e) => handleSubmit(e, c?.id_contribuyente, c?.nombre, c?.apellido)}
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </td>
                                                        }
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

            {showConfirmModal && (
                <ConfirmModal
                    msj={`¿Deseas eliminar al contribuyente ${selectedTaxpayer.nombre} y sus comercios ?\nÉsta acción no se podrá realizar si posee DDJJ cargadas.`}
                    setShowConfirmModal={setShowConfirmModal}
                    handleEstadoChange={handleConfirmChange}
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