import React from 'react'
import { useNavigate } from 'react-router-dom';

const TradesTable = ({ id_contribuyente, trades, onTradeStateChange, existeHabilitado }) => {

    const navigate = useNavigate();
    return (
        <div className="container mt-4 col-12">
            <div className="card shadow">
                <div className="card-header bg-secondary text-white text-center">
                    <h5 className="mb-0">Comercios declarados</h5>
                </div>
                <div className="row justify-content-center">
                    <div className="card-body">
                        <div className="table-responsive">
                            {trades.length > 0 ? (
                                <table className="table table-striped table-bordered text-center w-100" style={{ textAlign: "center", verticalAlign: "middle" }}>
                                    <thead className="thead-dark">
                                        <tr>
                                            <th>Código de Comercio</th>
                                            <th>Nombre de Comercio</th>
                                            <th>Dirección de Comercio</th>
                                            <th>Acciones</th>
                                            <th>DDJJs</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trades?.map((comercio, index) => (
                                            <tr key={index}>
                                                <td>N° {comercio?.cod_comercio}</td>
                                                <td>{comercio?.nombre_comercio}</td>
                                                <td>{comercio?.direccion_comercio}</td>
                                                <td className="text-center">
                                                    {comercio?.estado ? (
                                                        <strong className="bi bi-check-circle text-success"> Validado</strong>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary fw-bold"
                                                            onClick={() => onTradeStateChange(comercio)}
                                                        >
                                                            Validar Comercio
                                                        </button>
                                                    )}
                                                </td>

                                                <td className="text-center">
                                                    {
                                                        comercio?.estado ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-warning fw-bold"
                                                                onClick={() => navigate(`/ddjjContribuyente/${id_contribuyente}/${comercio?.id_comercio}/${comercio?.cod_comercio}`)}
                                                            >
                                                                Ver DDJJs
                                                            </button>
                                                        ) : (
                                                            <strong className="bi bi-x-circle text-danger"> Sin habilitar</strong>
                                                        )
                                                    }
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
                </div>
            </div>
        </div>
    )
}

export default TradesTable


