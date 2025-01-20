import React from 'react'

const RectificacionModal = () => {
    return (
            <div className="container mt-4">
                <div className="alert alert-danger shadow-lg p-3 text-center" role="alert">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                        <i className="bi bi-exclamation-circle-fill text-danger me-2 fs-4"></i>
                        <h4 className="alert-heading mb-0">
                            Plazo Vencido para Declaración Jurada
                        </h4>
                    </div>
                    <p className="text-muted">
                        Ha superado el plazo para la carga de su Declaración Jurada.
                        Si necesita realizar una rectificación, por favor diríjase a
                        nuestras oficinas o póngase en contacto con un asesor.
                    </p>
                    <div className="text-center mb-2">
                        <h6 className="mb-1">
                            <i className="bi bi-info-circle text-primary me-2"></i>
                            <strong>¿Dudas? Contáctenos:
                                <a href="#footer-contact" className="text-decoration-none text-primary"> VER INFORMACIÓN </a>
                            </strong>
                        </h6>
                    </div>
                </div>
            </div>        
    );
};

export default RectificacionModal