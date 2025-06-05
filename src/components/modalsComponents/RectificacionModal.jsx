import React from 'react'

const RectificacionModal = ({fecha}) => {
    return (
            // <div className="container mt-4">
            //     <div className="alert alert-danger shadow-lg p-3 text-center" role="alert">
            //         <div className="d-flex align-items-center justify-content-center mb-3">
            //             <i className="bi bi-exclamation-circle-fill text-danger me-2 fs-4"></i>
            //             <h4 className="alert-heading mb-0">
            //                 Plazo Vencido para Declaración Jurada
            //             </h4>
            //         </div>
            //         <p className="text-muted">
            //         Ha superado el plazo para la carga de su Declaración Jurada <strong>( día {fecha} de cada mes )</strong>.
            //             Si desea rectificar, por favor diríjase a
            //             nuestras oficinas o póngase en contacto con un asesor.
            //         </p>
            //         <div className="text-center mb-2">
            //             <h6 className="mb-1">
            //                 <i className="bi bi-info-circle text-primary me-2"></i>
            //                 <strong>¿Dudas? Contáctenos:
            //                     <a href="#footer-contact" className="text-decoration-none text-primary"> VER INFORMACIÓN </a>
            //                 </strong>
            //             </h6>
            //         </div>
            //     </div>
            // </div>        
        <div className="container mt-4">
            <div className="alert position-relative bg-white border-2 border-danger-subtle rounded-4 shadow p-4 text-start">
                <div className="d-flex align-items-center mb-3 gap-3">
                    <i className="bi bi-exclamation-circle-fill text-danger fs-1"></i>
                    <h4 className="mb-0 text-dark fw-bold">¡ Plazo Vencido para Declaración Jurada!</h4>
                </div>

                <div className="mb-3 text-secondary" style={{ lineHeight: '1.6' }}></div>

                
                    <div className="mb-3">
                        <p className="text-muted mb-2">
                        Ha superado el plazo para la carga de su Declaración Jurada <strong>(anteúltimo día hábil de cada mes )</strong>.
                        </p>
                        <p className="text-muted">
                            Si desea rectificar puede hacerlo ud mismo siguiendo los pasos indicados en el tutorial
                            <a href="tutorial" className="text-decoration-none text-primary ms-1">
                                Haga clic para ver
                            </a>
                           
                        </p>
                        <p className="text-muted">
                            O bien diríjase a nuestras oficinas.
                        </p>
                    </div>
               

                <div className="text-start mt-4">
                    <h6 className="mb-0">
                        <i className="bi bi-info-circle text-primary me-2"></i>
                        <strong>
                            ¿Dudas? Contáctenos:
                            <a href="#footer-contact" className="text-decoration-none text-primary ms-1">
                                VER INFORMACIÓN
                            </a>
                        </strong>
                    </h6>
                </div>

                {/* Botón cerrar (opcional) */}
                {/* <button type="button" className="btn-close position-absolute top-0 end-0 m-3" aria-label="Cerrar"></button> */}
            </div>
        </div>
    );
};

export default RectificacionModal