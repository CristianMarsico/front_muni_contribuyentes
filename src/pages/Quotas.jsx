import axios from 'axios';
import { io } from 'socket.io-client';
import React, { useEffect, useState } from 'react'
import ErrorNotification from '../components/ErrorNotification';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import { useAuth } from '../context/AuthProvider';
import useFetch from '../helpers/hooks/useFetch';
import { handleError } from '../helpers/hooks/handleError';

const Quotas = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { data, refetch } = useFetch(`${URL}/api/expirationDates`);
    const { user, logout } = useAuth();
    const [editingCell, setEditingCell] = useState(null);
    const [editedValue, setEditedValue] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [dates, setDates] = useState([]);
    const [pendingDate, setPendingDate] = useState(''); // Nuevo estado temporal para la fecha seleccionada
    const cuotas = data?.response;

    useEffect(() => {
        if (data?.response) {
            setDates(data?.response);
        } else {
            setDates([]);
        }
    }, [data]);

    const getMonthName = (month, year) => {
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'short' });
    };

    // Configuración del socket
    useEffect(() => {
        const socket = io(URL);
        socket.on('fecha-nueva', (nuevaFecha) => {
            setDates((prev) => [...prev, nuevaFecha]);
            refetch();
        });
        return () => socket.disconnect();
    }, [URL, refetch]);

    const handleCellClick = (rowIndex, id_vencimiento, currentValue) => {
        if (user?.rol === 'admin' || user?.rol === 'super_admin') {
            setEditingCell({ rowIndex, id_vencimiento });
            setEditedValue(currentValue);
            setIsEditing(true);
        }
    };

    const handleDateChange = (e) => {
        setEditedValue(e.target.value);
        setPendingDate(e.target.value);
    };

    const handleBlur = () => {
        if (pendingDate !== '') {
            setShowConfirmModal(true); // Muestra el modal de confirmación después de seleccionar la fecha
        }
    };

    const setError = (message) => {
        setErrorMessage(message); // Establece el mensaje de error en el estado
    };

    const handleConfirmChange = async () => {
        try {
            // Datos a enviar en la solicitud POST
            const data = {
                id_vencimiento: editingCell?.id_vencimiento,
                fecha: editedValue,
            };
            // Realizar la solicitud POST
            const response = await axios.put(`${URL}/api/expirationDates/${data.id_vencimiento}/${data.fecha}`, null, { withCredentials: true });
            if (response.status === 200) {
                setShowSuccessModal(false);
                setTimeout(() => setShowSuccessModal(true), 100); // Delay corto para re-renderizar
                setEditingCell(null);
                setShowConfirmModal(false);
                setPendingDate(''); // Limpia la fecha pendiente
                setIsEditing(false);
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
            setShowConfirmModal(false);
            setIsEditing(false);
            setIsEditing(false);
        }
    };

    const handleCancelChange = () => {
        setShowConfirmModal(false);
        setPendingDate(''); // Limpia la fecha pendiente si se cancela
        setIsEditing(false);
    };

    return (
        <>
            <div className="container mt-3">
                <div className="text-center bg-light p-2 mb-2 border">
                    <strong>TASA POR SERVICIOS A LA ACTIVIDAD COMERCIAL, INDUSTRIAL, PROFESIONAL Y DE SERVICIOS</strong>
                </div>
                <div className="table-responsive">
                    <table className="table table-bordered text-center">
                        <thead>
                            <tr>
                                {cuotas?.map((c, index) => (
                                    <th key={index}>
                                        {c.id_vencimiento === 1 && "1° Cuota + 1° Cuota A.V"}
                                        {c.id_vencimiento === 2 && "2° Cuota + 2° Cuota A.V"}
                                        {c.id_vencimiento >= 3 && `${c.id_vencimiento}° Cuota`}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {cuotas?.map((c, index) => {
                                    const mes = getMonthName(c.mes, c.anio);
                                    const cellValue = c.id_vencimiento < 12 ? `${c.dia}-${mes}` : `${c.dia}-${mes}/${c.anio}`;
                                    const isEditingCell = editingCell?.rowIndex === index;

                                    return (
                                        <td
                                            key={index}
                                            onClick={() => handleCellClick(index, c.id_vencimiento, cellValue)}
                                        >
                                            {isEditingCell && isEditing ? (
                                                <input
                                                    type="date"
                                                    value={editedValue}
                                                    onChange={handleDateChange}
                                                    onBlur={handleBlur}
                                                    autoFocus
                                                />
                                            ) : (
                                                cellValue
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de confirmación */}
            {showConfirmModal && (
                <ConfirmModal
                    msj="Seguro desea cambiar la fecha ?"
                    handleEstadoChange={handleConfirmChange}
                    setShowConfirmModal={handleCancelChange}
                />
            )}

            <SuccessModal
                show={showSuccessModal}
                message="Fecha modificada con éxito."
                duration={3000}
            />

            <ErrorNotification
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />
        </>
    );
};

export default Quotas;




