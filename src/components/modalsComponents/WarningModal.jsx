import React from 'react'
import useFetch from '../../helpers/hooks/useFetch';

const WarningModal = ({ msj, mostrarDetalles = false }) => {

    const URL = import.meta.env.VITE_API_URL;// URL de la API desde las variables de entorno
    const { data } = useFetch(`${URL}/api/configuration`);

    let res = data?.response[0];

    return (
        <div className="container mt-4">
            <div className="alert position-relative bg-white border-2 border-warning-subtle rounded-4 shadow p-4 text-start">
                <div className="d-flex align-items-center mb-3 gap-3">
                    <i className="bi bi-exclamation-triangle-fill text-warning fs-1"></i>
                    <h4 className="mb-0 text-dark fw-bold">¡Atención Contribuyente!</h4>
                </div>

                <div className="mb-3 text-secondary" style={{ lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: msj }}></div>

                {mostrarDetalles && (
                    <div className="mb-3">
                        <p className="text-muted mb-2">
                            La tasa a abonar no podrá ser inferior a lo que establezca ARCA para la categoría G de monotributo considerando el impuesto por la venta de cosas muebles.
                        </p>
                        <p className="text-muted">
                            En caso de ser BUEN CONTRIBUYENTE, Ud. accede a un descuento del {(res?.porcentaje_buen_contribuyente * 100)}%.
                        </p>
                    </div>
                )}

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
    )
}

export default WarningModal