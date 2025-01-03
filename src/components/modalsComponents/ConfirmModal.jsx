import React from 'react'

const ConfirmModal = ({ msj, handleEstadoChange, setShowConfirmModal }) => {
    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
            style={{ zIndex: 1050 }}
        >
            <div
                className="bg-white rounded-4 shadow-lg p-4 text-center"
                style={{ maxWidth: "350px", width: "90%" }}
            >
                <div className="mb-3">
                    <i
                        className="bi bi-question-circle text-primary"
                        style={{ fontSize: "2.5rem" }}
                    ></i>
                </div>
                <h5 className="fw-bold mb-3 text-dark">{msj}</h5>
                <div className="d-flex justify-content-between gap-2">
                    <button
                        className="btn btn-success flex-grow-1"
                        onClick={handleEstadoChange}
                    >
                        Aceptar
                    </button>
                    <button
                        className="btn btn-outline-danger flex-grow-1"
                        onClick={() => setShowConfirmModal(false)}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal