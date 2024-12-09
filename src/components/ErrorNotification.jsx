import React from 'react';
import { Toast } from 'react-bootstrap';

// Función que se usa en los formularios para mostrar el error
const ErrorNotification = ({ message, onClose }) => {
    return (
        <Toast
            onClose={onClose}
            show={message !== null}
            delay={5000}
            autohide
            className="position-fixed top-50 start-50 translate-middle-x z-index-1050"
        >
            <Toast.Body className="bg-danger text-light text-center p-3 fs-5">
                {message}
            </Toast.Body>
        </Toast>
    );
};

export default ErrorNotification;
