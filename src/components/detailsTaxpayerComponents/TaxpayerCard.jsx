import React from 'react'
import InfoField from './InfoField'

const TaxpayerCard = ({ info, allComerciosHabilitados, onTaxpayerStateChange, isTaxpayerEnabled }) => {
  return (
      <div className="d-flex justify-content-center">
          <div className="card col-12 col-sm-12 col-md-9 col-lg-7 shadow-lg border-0 rounded-3 mb-4">
              <div className="card-header bg-primary text-white rounded-3">
                  <h4 className="mb-0 text-center">Información del Contribuyente</h4>
              </div>
              <div className="card-body p-4 text-center">
                  <div className="row">
                      <InfoField label="NOMBRE Y APELLIDO" value={`${info?.nombre} ${info?.apellido}`} />
                      <InfoField label="CUIT" value={info?.cuit} />
                      <InfoField label="EMAIL" value={info?.email} />
                      <InfoField label="RAZÓN SOCIAL" value={info?.razon_social} />
                      <InfoField label="DIRECCIÓN" value={info?.direccion} />
                      <InfoField label="TELÉFONO" value={info?.telefono} />
                  </div>
                  <div className="d-flex flex-column flex-sm-row flex-wrap justify-content-center gap-3 align-items-center">
                      <p className="mb-0 text-center text-sm-start text-wrap fs-5">
                          <strong className="text-muted">ESTADO :</strong>
                          <span
                              className={`badge ${allComerciosHabilitados
                                  ? isTaxpayerEnabled
                                      ? 'bi bi-check-circle text-success' // Contribuyente habilitado
                                      : 'bi bi-clock text-warning' // Esperando dar de alta
                                  : 'bi bi-x-circle text-danger' // Comercios inhabilitados
                                  } fs-5`}
                          >
                              {allComerciosHabilitados
                                  ? isTaxpayerEnabled
                                      ? ' Habilitado' // Contribuyente habilitado
                                      : ' En espera de alta' // Esperando dar de alta
                                  : ' Inhabilitado' // Comercios inhabilitados
                              }
                          </span>
                      </p>
                      {allComerciosHabilitados && !isTaxpayerEnabled && (
                          <button className="btn btn-primary px-4 py-2 mt-2 mt-sm-0 w-100 w-sm-auto" onClick={onTaxpayerStateChange}>
                              <i className="bi bi-check-circle me-2"></i>
                              Habilitar Contribuyente
                          </button>
                      )}
                  </div>

              </div>
          </div>
      </div>
  )
}

export default TaxpayerCard