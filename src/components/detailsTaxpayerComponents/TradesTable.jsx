import React from 'react'
import { useNavigate } from 'react-router-dom';

const TradesTable = ({ id_contribuyente ,trades, onTradeStateChange }) => {
   
const navigate = useNavigate();

  return (
      <div className="card shadow-lg border-0 rounded-4">
          <div className="card-header bg-secondary text-white rounded-top-4">
              <h5 className="mb-0">Comercios Asociados</h5>
          </div>
          <div className="card-body">
              {trades.length > 0 ? (
                  <table className="table table-bordered table-striped text-center">
                      <thead className="table-dark">
                          <tr>
                              <th>Código de Comercio</th>
                              <th>Nombre de Comercio</th>
                              <th>Dirección de Comercio</th>
                              <th>Acciones</th>
                              <th>DDJJs</th>
                          </tr>
                      </thead>
                      <tbody>
                          {trades.map((comercio) => (
                              <tr key={comercio.id_comercio}>
                                  <td>{comercio.cod_comercio}</td>
                                  <td>{comercio.nombre_comercio}</td>
                                  <td>{comercio.direccion_comercio}</td>
                                  <td className="d-flex align-items-center justify-content-center">
                                      {comercio.estado ? (
                                          <span className="badge bg-success text-white" style={{ fontSize: '16px' }}>
                                              Comercio Validado
                                          </span>
                                      ) : (
                                          <button
                                              className="btn btn-primary"
                                              onClick={() => onTradeStateChange(comercio)}
                                          >
                                              Validar Comercio
                                          </button>
                                      )}
                                  </td>
                                  <td>
                                      <button
                                          type="button"
                                          className="btn btn-warning btn-sm fw-bold"
                                          onClick={() => navigate(`/ddjjContribuyente/${id_contribuyente}/${comercio?.id_comercio}/${comercio?.cod_comercio}`)}
                                      >
                                          Ver DDJJs
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              ) : (
                  <p className="text-muted text-center">No hay comercios asociados a este contribuyente.</p>
              )}
          </div>
      </div>
  )
}

export default TradesTable