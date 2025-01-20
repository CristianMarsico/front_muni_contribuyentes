import React from 'react'
import { useAuth } from '../../context/AuthProvider'

const WarningModal = ({ msj }) => {
    const { user } = useAuth();
    return (
        <div className="container mt-4">
            <div className="alert alert-warning shadow-lg p-3 text-center" role="alert">
                <div className="d-flex align-items-center justify-content-center mb-3">
                    <i className="bi bi-exclamation-triangle-fill text-warning me-2 fs-4"></i>
                    <h4 className="alert-heading mb-0">
                        ¡Atención {user?.rol === 'user' && "Contribuyente!"}
                    </h4>
                </div>
                <p className="text-muted" dangerouslySetInnerHTML={{ __html: msj }}></p>

                {user?.rol === 'user' && (
                    <>
                        <div className="text-center mb-2">
                            <h6 className="mb-1">
                                <i className="bi bi-info-circle text-primary me-2"></i>
                                <strong>¿Dudas? Contáctenos:                                     
                                    <a href="#footer-contact" className="text-decoration-none text-primary"> VER INFORMACIÓN </a>
                                </strong>
                            </h6>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default WarningModal