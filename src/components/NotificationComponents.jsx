import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import useFetch from '../helpers/hooks/useFetch';
import axios from 'axios';
import { handleError } from '../helpers/hooks/handleError';

const NotificationComponents = () => {

    const URL = import.meta.env.VITE_API_URL;// URL de la API desde las variables de entorno
    const { data, refetch } = useFetch(`${URL}/api/notification`);
    const [notificaciones, setNotificaciones] = useState([]);
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const [errorNotificacion, setErrorNotificacion] = useState(null);

    useEffect(() => {
        if (data?.response) {
            setNotificaciones(data?.response);
        } else {
            setNotificaciones([]);
        }
    }, [data]);

    // WebSocket para recibir actualizaciones en tiempo real
    useEffect(() => {
        const socket = io(URL);

        socket.on('nuevaNotificacion', (notificacion) => {
            setNotificaciones((prev) => [notificacion, ...prev]);
            refetch(); // opcional si tu backend devuelve cambios en "leídas"
        });

        socket.on('notificacionLeida', ({ id }) => {
            // Marcar como leída en el frontend (opcional, si no hacés refetch)
            setNotificaciones((prev) =>
                prev.map((n) =>
                    n.id_notificacion === id ? { ...n, leida: true } : n
                )
            );
        });
        return () => socket.disconnect();
    }, [URL, refetch]);

    // Contar no leídas
    const noLeidas = notificaciones.filter(n => !n.leida).length;

    // Marcar una notificación como leída
    const marcarComoLeida = async (id) => {       
        try {
            const res = await axios.put(
                `${URL}/api/notification/leida/${id}`, null,              
                { withCredentials: true }
            );

            if (res?.status === 200) {
                setNotificaciones(prev =>
                    prev.map(n => n.id === id ? { ...n, leida: true } : n)
                );
                refetch();
            }
        } catch (err) {
            handleError(err, {
                on401: (message) => {
                    setErrorNotificacion(message);
                    setTimeout(() => logout(), 3000);
                },
                on404: (message) => setErrorNotificacion(message), // Puedes pasar cualquier función específica
                onOtherServerError: (message) => setErrorNotificacion(message),
                onConnectionError: (message) => setErrorNotificacion(message),
            });
        }
    };

    return (
        <div className="dropdown position-relative">
            <button
                className="btn btn-dark position-relative p-1 rounded-circle"
                onClick={() => setMostrarDropdown(!mostrarDropdown)}
                style={{ width: 40, height: 40 }}
            >
                <i className="bi bi-bell fs-5 text-white"></i> {/* campana blanca */}
                {noLeidas > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {noLeidas}
                    </span>
                )}
            </button>

            {mostrarDropdown && (
                <ul
                    className="dropdown-menu show shadow mt-2 p-2"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        top: '100%',
                        width: 'min(90vw, 320px)',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        borderRadius: '10px',
                        zIndex: 1000,
                    }}
                >
                    {errorNotificacion && (
                        <li className="dropdown-item text-danger text-center" style={{ whiteSpace: 'normal' }}>
                            {errorNotificacion}
                        </li>
                    )}
                    {notificaciones?.length === 0 ? (
                        <li className="dropdown-item text-muted text-center">Sin notificaciones</li>
                    ) : (
                            notificaciones?.map((n, index) => (
                                <li
                                    key={index}
                                    className={`dropdown-item d-flex flex-column ${n.leida ? 'text-muted bg-light' : 'bg-warning-subtle'} border rounded mb-1 w-100`}
                                    style={{cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1.3, whiteSpace: 'normal'}}
                                    onClick={() => marcarComoLeida(n.id_notificacion)}
                                >
                                    <strong>{n.leida ? 'Leída:' : 'Nueva rectificación:'}</strong>
                                    <span>
                                        El contribuyente CUIT: {n.cuit} código RAFAM {n.codigo_comercio}
                                    </span>
                                    <span>
                                        Rectificó {n.mes} por un total de ${n.monto}
                                    </span>
                                    <small className="text-muted">
                                        Fecha realizada: {new Date(n.fecha).toLocaleDateString()}
                                    </small>
                                </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default NotificationComponents