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
        <>
            {visible && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ zIndex: 1050, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div
                        className="bg-white rounded shadow p-4 text-center"
                        style={{ maxWidth: "400px", width: "90%" }}
                    >
                        <div className="mb-3">
                            <i
                                className="bi bi-check-circle-fill text-success"
                                style={{ fontSize: "3rem" }}
                            ></i>
                        </div>
                        <h5 className="fw-bold text-success">¡Éxito!</h5>
                        <p className="mb-0">{message}</p>
                    </div>
                </div>
            )}
        </>
    );
};
export default SuccessModal