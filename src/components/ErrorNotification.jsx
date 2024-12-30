import React from 'react';

// Función que se usa en los formularios para mostrar el error
const ErrorNotification = ({ message, onClose }) => {   

    return (
        <div
            className={`position-fixed top-50 start-50 translate-middle-x bg-danger text-light border-0 shadow-lg rounded-4 z-index-1050`}
            style={{
                minWidth: '300px',
                maxWidth: '90%',
                padding: '16px',
                display: message ? 'block' : 'none',
                opacity: 1,
                transition: 'opacity 0.5s',
            }}
        >
            <div className="d-flex align-items-center">
                {/* Icon */}
                <div className="me-3">
                    <i
                        className="bi bi-exclamation-triangle-fill text-warning"
                        style={{ fontSize: '36px' }}
                    ></i>
                </div>
                {/* Message */}
                <div style={{ flex: 1 }}>
                    <span className="fs-6 fw-bold d-block">
                        {message || 'Ha ocurrido un error.'}
                    </span>
                    {/* <small className="text-light d-block mt-2">
                        Por favor, verifica tu conexión o contacta al soporte técnico.
                    </small> */}
                </div>
                {/* Close button */}
                <button
                    className="btn-close btn-close-white ms-3"
                    onClick={onClose}
                    aria-label="Cerrar"
                ></button>
            </div>
        </div>
    );


};

export default ErrorNotification;
