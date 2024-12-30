import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';

const WelcomeModal = ({ show, onAutoHide, duration, type }) => {
    const modalContent = type === 'register'
        && {
        icon: 'bi bi-check-circle',
        bgColor: 'bg-success',
        title: '¡Registro Exitoso!',
        message: 'Tu cuenta ha sido creada con éxito. ¡Bienvenido! 🎉',
    };

    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onAutoHide();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onAutoHide]);

    return (
        <Modal
            show={show}
            centered
            backdrop="static"
            keyboard={false}
            dialogClassName="custom-modal"
            animation={true}
        >
            <Modal.Body className={`text-center p-4 ${modalContent.bgColor} text-white`}>
                <div className="mb-3">
                    <i className={`${modalContent.icon} display-4`} />
                </div>
                <h4 className="fw-bold mb-2">{modalContent.title}</h4>
                <p>{modalContent.message}</p>
            </Modal.Body>
        </Modal>
    );
};

export default WelcomeModal;
