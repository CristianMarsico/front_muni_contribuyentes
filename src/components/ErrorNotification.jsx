import React from 'react';

// Función que se usa en los formularios para mostrar el error
const ErrorNotification = ({ message, onClose }) => {

    const isError = message?.toLowerCase().includes('error'); // Verifica si el mensaje contiene 'error'

    return (
        <div
            className="toast position-fixed top-50 start-50 translate-middle-x bg-danger text-light border-0 shadow-lg rounded-4 z-index-1050"
            style={{ minWidth: '350px', display: message ? 'block' : 'none', opacity: 1, transition: 'opacity 0.5s' }}
        >
            <div className="toast-body d-flex align-items-center p-4">
                <i
                    className="bi bi-x-circle-fill me-3"
                    style={{ fontSize: '24px' }}
                ></i>
                <div className="d-flex flex-column">
                    <span className="fs-5 fw-bold">{message}</span>
                </div>
                <button
                    className="btn-close btn-close-white ms-auto"
                    onClick={onClose}
                    aria-label="Close"
                ></button>
            </div>
        </div>
    );


};

export default ErrorNotification;
