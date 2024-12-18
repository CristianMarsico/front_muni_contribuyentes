import React, { useEffect, useState } from 'react'

    const SuccessModal = ({ show, message, duration }) => {
        const [visible, setVisible] = useState(false);

        useEffect(() => {
            if (show) {
                setVisible(true);
                const timer = setTimeout(() => setVisible(false), duration);
                return () => clearTimeout(timer);
            }
        }, [show, duration]);

        return (
            <div
                className={`position-fixed top-0 start-50 translate-middle-x p-3 ${visible ? "d-block" : "d-none"
                    }`}
                style={{ zIndex: 1050 }}
            >
                <div className="alert alert-success shadow d-flex align-items-center" role="alert">
                    <i className="bi bi-check-circle-fill me-2" style={{ fontSize: "1.5rem" }}></i>
                    <div>
                        <strong>¡Éxito!</strong> {message}
                    </div>
                </div>
            </div>
        );
    };

export default SuccessModal