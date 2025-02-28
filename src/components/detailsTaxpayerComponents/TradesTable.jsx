import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { handleError } from '../../helpers/hooks/handleError';
import InputDecimal from '../auth/InputDecimal';
import InputField from '../auth/InputField';
import ErrorNotification from '../ErrorNotification';
import ConfirmModal from '../modalsComponents/ConfirmModal';
import SuccessModal from '../modalsComponents/SuccessModal';

const TradesTable = ({ id_contribuyente, trades, onTradeStateChange, disabledTrade, refetch, setTrades, URL, logout }) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [editedTrade, setEditedTrade] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [errorsTrade, setErrorsTrade] = useState({});

    // Manejar errores
    const setError = (message) => {
        setErrorMessage(message);
    };

    // Conexión de socket para escuchar nuevos comercios
    useEffect(() => {
        const socket = io(URL);
        socket.on('new-trade', (nuevoComercio) => {
            setTrades((prev) => [...prev, nuevoComercio]);
            refetch();
        });
        socket.on('comercio-editado', (comercioEditado) => {
            setTrades((prev) => [...prev, comercioEditado]);
            refetch();
        });

        return () => socket.disconnect();
    }, [URL, refetch]);

    // Manejar la edición
    const handleEditClick = (comercio) => {
        setSelectedTrade(comercio);
        setEditedTrade({ ...comercio });
        setShowModal(true);
    };

    // Validar datos del comercio
    const validateTrade = (trade) => {
        const errors = {};
        if (!trade.cod_comercio?.trim()) errors.cod_comercio = '*Código de comercio obligatorio.';
        if (!trade.nombre_comercio?.trim()) errors.nombre_comercio = '*Nombre de comercio obligatorio.';
        if (!trade.direccion_comercio?.trim()) errors.direccion_comercio = '*Dirección de comercio obligatoria.';
        return errors;
    };

    // Mostrar el modal de confirmación
    const handleConfirmChanges = () => {
        const validationErrors = validateTrade(editedTrade);
        if (Object.keys(validationErrors).length > 0) {
            setErrorsTrade(validationErrors);
            return;
        }
        setShowConfirmModal(true); // Mostrar modal de confirmación
    };

    // Guardar cambios del comercio
    const handleSaveChanges = async () => {
        const data = {
            codigo_comercio: editedTrade.cod_comercio,
            nombre_comercio: editedTrade.nombre_comercio,
            direccion_comercio: editedTrade.direccion_comercio,
            id_contribuyente : id_contribuyente
        };

        try {
            const response = await axios.put(`${URL}/api/trade/${editedTrade.id_comercio}/${id_contribuyente}`, data, { withCredentials: true });
            if (response?.status === 200) {
                setShowModal(false)
                setShowSuccessModal(false);
                setTimeout(() => setShowSuccessModal(true), 100);
                setErrorsTrade({
                    codigo_comercio: null,
                    nombre_comercio: null,
                    direccion_comercio: null
                });
                setShowConfirmModal(false); // Cierra el modal de confirmación después del envío
                refetch();
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
            setShowModal(false)
            setShowSuccessModal(false);
            setShowConfirmModal(false);
        }
    };

    // Manejar cambios en los campos
    const handleTradeChange = (e) => {
        const { name, value } = e.target;

        // Actualizar el comercio editado
        setEditedTrade((prev) => ({ ...prev, [name]: value }));

        // Limpiar el error del campo modificado
        setErrorsTrade((prevErrors) => {
            const { [name]: _, ...remainingErrors } = prevErrors; // Elimina el error del campo actual
            return remainingErrors;
        });
    };

    return (
        <>
            <div className="container mt-4 col-12">
                <div className="card shadow">
                    <div className="card-header bg-secondary text-white text-center">
                        <h5 className="mb-0">Comercios declarados</h5>
                    </div>
                    <div className="row justify-content-center">
                        <div className="card-body">
                            <div className="table-responsive">
                                {trades?.length > 0 ? (
                                    <table className="table table-striped table-bordered text-center w-100" style={{ textAlign: "center", verticalAlign: "middle" }}>
                                        <thead className="thead-dark">
                                            <tr className="text-center align-middle">
                                                <th>Modificar</th>
                                                <th>Código de Comercio (RAFAM)</th>
                                                <th>Nombre de Comercio / Fantasía</th>
                                                <th>Dirección Comercial</th>
                                                <th>Estado</th>
                                                <th>DDJJs</th>
                                                <th>Inhabilitar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trades?.map((comercio, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <i
                                                            className="bi bi-pencil text-primary ms-2"
                                                            role="button"
                                                            onClick={() => handleEditClick(comercio)}
                                                        ></i>
                                                    </td>
                                                    <td>{comercio?.cod_comercio}</td>
                                                    <td>{comercio?.nombre_comercio}</td>
                                                    <td>{comercio?.direccion_comercio}</td>
                                                    <td>
                                                        {comercio?.estado ? (
                                                            <strong className="bi bi-check-circle text-success"> Validado</strong>
                                                        ) : (
                                                            <button
                                                                className="btn btn-primary fw-bold"
                                                                onClick={() => onTradeStateChange(comercio)}
                                                            >
                                                                Validar
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning fw-bold"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/ddjjContribuyente/${id_contribuyente}/${comercio?.id_comercio}/${comercio?.cod_comercio}`
                                                                )
                                                            }
                                                        >
                                                            Ver
                                                        </button>
                                                    </td>
                                                    <td>
                                                        {comercio?.estado ? (
                                                            <button
                                                                className="btn btn-outline-danger flex-grow-1 fw-bold"
                                                                onClick={() => disabledTrade(comercio)}
                                                            >
                                                                inhabilitar
                                                            </button>
                                                        ) : (
                                                            <strong className="bi bi-x-circle text-danger"> Inactivo</strong>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-muted text-center">No hay comercios asociados a este contribuyente.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal para editar */}
                {showModal && !showConfirmModal && (
                    <div className="modal fade show d-block" role="dialog">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg rounded-4">
                                <div className="modal-header bg-primary text-white rounded-top-4">
                                    <h5 className="modal-title">Editar Comercio</h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form>
                                        <InputDecimal
                                            label="Código de comercio (RAFAM)"
                                            name="cod_comercio"
                                            value={editedTrade.cod_comercio || ''}
                                            type="number"
                                            onChange={handleTradeChange}
                                            error={errorsTrade.cod_comercio}
                                            placeholder="Ingrese código de comercio"
                                        />
                                        <InputField
                                            label="Nombre de comercio | Nombre de fantasía"
                                            name="nombre_comercio"
                                            value={editedTrade.nombre_comercio || ''}
                                            type="text"
                                            onChange={handleTradeChange}
                                            error={errorsTrade.nombre_comercio}
                                            placeholder="Ingrese nombre"
                                        />
                                        <InputField
                                            label="Dirección de comercio"
                                            name="direccion_comercio"
                                            value={editedTrade.direccion_comercio || ''}
                                            type="text"
                                            onChange={handleTradeChange}
                                            error={errorsTrade.direccion_comercio}
                                            placeholder="Ingrese dirección"
                                        />
                                    </form>
                                </div>
                                <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-end gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleConfirmChanges}
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de confirmación */}
                {showConfirmModal && (
                    <ConfirmModal
                        msj="¿Deseas confirmar los cambios realizados en el comercio?"
                        setShowConfirmModal={setShowConfirmModal}
                        handleEstadoChange={handleSaveChanges}
                    />
                )}

                {showSuccessModal && (
                    <SuccessModal
                        show={showSuccessModal}
                        message="El comercio se ha actualizado con éxito."
                        duration={3000}
                    />
                )}

                <ErrorNotification
                    message={errorMessage}
                    onClose={() => setErrorMessage(null)}
                />
            </div>
        </>
    );
};

export default TradesTable;
