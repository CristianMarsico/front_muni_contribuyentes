import React from 'react'

const ConfirmAddTradeModal = ({ selectedEstado, handleEstadoChange, setShowConfirmModal }) => {
  return (
       <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50"
                    style={{ zIndex: 1050 }}
                >
                    <div className="shadow-lg rounded bg-white p-4" style={{ maxWidth: "500px", width: "90%" }}>
                        <h5 className="text-primary mb-3 text-center">Confirmar Cambio</h5>
                        <p className="text-center">
                            ¿Estás seguro de que deseas dar de alta al comercio
                            <strong> {selectedEstado?.cod_comercio} {selectedEstado?.nombre_comercio}</strong>?
                        </p>
                        <div className="d-flex justify-content-end gap-2">
                            <button
                                className="btn btn-primary"
                                onClick={handleEstadoChange}
                            >
                                Sí, dar de alta
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
  )
}

export default ConfirmAddTradeModal