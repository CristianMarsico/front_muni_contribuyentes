import React from 'react'
import InfoField from './InfoField'

const TaxpayerCard = ({ info, existeHabilitado }) => {
    // Desestructuración de las propiedades de info
    const { nombre, apellido, cuit, email, razon_social, direccion, telefono } = info || {}

    // Determinar la clase de estado y el texto basado en existeHabilitado
    const estadoClass = existeHabilitado ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'
    const estadoText = existeHabilitado ? 'Habilitado' : 'Inhabilitado'

    return (
        <div className="d-flex justify-content-center">
            <div className="card col-12 col-sm-12 col-md-9 col-lg-7 shadow-lg border-0 rounded-3 mb-4">
                <div className="card-header bg-primary text-white rounded-3">
                    <h4 className="mb-0 text-center">Información del Contribuyente</h4>
                </div>
                <div className="card-body p-4 text-center">
                    <div className="row">
                        <InfoField label="NOMBRE Y APELLIDO" value={`${nombre} ${apellido}`} />
                        <InfoField label="CUIT" value={cuit} />
                        <InfoField label="EMAIL" value={email} />
                        <InfoField label="RAZÓN SOCIAL" value={razon_social} />
                        <InfoField label="DIRECCIÓN" value={direccion} />
                        <InfoField label="TELÉFONO" value={telefono} />
                    </div>
                    <div className="d-flex flex-column flex-sm-row flex-wrap justify-content-center gap-3 align-items-center">
                        <p className="mb-0 text-center text-sm-start text-wrap fs-5">
                            <strong className="text-muted">ESTADO :</strong>
                            <span
                                className={`badge ${estadoClass} fs-5`}
                                aria-label={`Estado del contribuyente: ${estadoText}`}
                            >
                                {estadoText}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaxpayerCard