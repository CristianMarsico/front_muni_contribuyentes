import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';

const WelcomeModal = ({ show, onAutoHide, duration, type }) => {
    const [progress, setProgress] = useState(100);

    const modalContent = type === 'register'
        ? {
            icon: 'bi bi-check-circle',
            bgColor: 'bg-success',
            title: '¡Registro Exitoso!',
            message: 'Tu cuenta ha sido creada con éxito. ¡Bienvenido! 🎉',
        }
        : {
            icon: 'bi bi-info-circle',
            bgColor: 'bg-info',
            title: '¡Información!',
            message: 'Este es un mensaje informativo. 🚀',
        };

    useEffect(() => {
        if (show) {
            let interval;
            const step = 100 / (duration / 100);

            const timer = setTimeout(() => {
                onAutoHide();
            }, duration);

            interval = setInterval(() => {
                setProgress((prev) => Math.max(prev - step, 0));
            }, 100);

            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
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
            <Modal.Body className={`text-center p-4 rounded-3 ${modalContent.bgColor} text-white`}>
                <div className="mb-3">
                    <i className={`${modalContent.icon} display-3`} />
                </div>
                <h4 className="fw-bold mb-3">{modalContent.title}</h4>
                <p className="fs-6">{modalContent.message}</p>

                {/* Barra de progreso */}
                <div className="progress mt-3" style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                            width: `${progress}%`,
                            transition: 'width 0.1s linear',
                            backgroundColor: '#ffffff',
                        }}
                    />
                </div>
            </Modal.Body>
        </Modal>
    );
};
export default WelcomeModal;
