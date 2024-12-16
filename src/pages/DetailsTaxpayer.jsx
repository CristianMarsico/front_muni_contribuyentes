import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import SuccessModal from '../components/SuccessModal';
import ConfirmAddTradeModal from '../components/ConfirmAddTradeModal';
import ConfirmAddTaxpayerModal from '../components/ConfirmAddTaxpayerModal';
import useFetch from '../helpers/hooks/UseFetch';

const DetailsTaxpayer = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { id } = useParams();
    const { data, refetch } = useFetch(`${URL}/api/taxpayer/${id}`);
    const [showConfirmTradeModal, setShowConfirmTradeModal] = useState(false);
    const [showConfirmTaxpayerModal, setShowConfirmTaxpayerModal] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState(null); // Datos del contribuyente seleccionado
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [trades, setTrades] = useState(data?.response || []);
    let info = data?.response[0];

    useEffect(() => {
        const socket = io(URL);
        socket.on('comercio-nuevo', (nuevoComercio) => {
            refetch();
            setTrades((prevTrades) => [...prevTrades, nuevoComercio]);
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    console.log(info)

    const handleTradeState = (c) => {
        setSelectedEstado(c);
        setShowConfirmTradeModal(true);
    };

    const handleTaxpayerState = (c) => {
        setSelectedEstado(c);
        setShowConfirmTaxpayerModal(true);
    };

    const handleTradeStateChange = async () => {
        try {
            const response = await axios.put(`${URL}/api/trade/${selectedEstado.id_comercio}`, {
                withCredentials: true,
            });
            if (response.status === 200) {
                setShowSuccessModal(false); // Reinicia el estado
                setTimeout(() => setShowSuccessModal(true), 0);
                refetch();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setShowConfirmTradeModal(false);
        }
    };

    const handleTaxpayerStateChange = async () => {
        try {
            const response = await axios.put(`${URL}/api/taxpayer/${id}`, {
                withCredentials: true,
            });
            if (response.status === 200) {
                setShowSuccessModal(false); // Reinicia el estado
                setTimeout(() => setShowSuccessModal(true), 0);
                refetch();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setShowConfirmTaxpayerModal(false);
        }
    };

    const allComerciosHabilitados = data?.response?.every((comercio) => comercio.estado);
    return (
        <>
            <div className="container mt-4">
                <div className="card shadow-lg border-0 rounded-3 mb-4">
                    <div className="card-header bg-primary text-white rounded-3">
                        <h4 className="mb-0 text-center">Información del Contribuyente</h4>
                    </div>
                    <div className="card-body p-4 text-center">
                        <div className="row">
                            <div className="col-12 col-md-6 mb-3">
                                <strong className="text-muted">Nombre Completo</strong>
                                <p className="text-dark fs-5">{info?.nombre} {info?.apellido}</p>
                            </div>
                            <div className="col-12 col-md-6 mb-3">
                                <strong className="text-muted">CUIT</strong>
                                <p className="text-dark fs-5">{info?.cuit}</p>
                            </div>
                            <div className="col-12 col-md-6 mb-3">
                                <strong className="text-muted">Email</strong>
                                <p className="text-dark fs-5">{info?.email}</p>
                            </div>
                            <div className="col-12 col-md-6 mb-3">
                                <strong className="text-muted">Razón Social</strong>
                                <p className="text-dark fs-5">{info?.razon_social}</p>
                            </div>
                            <div className="col-12 col-md-6 mb-3">
                                <strong className="text-muted">Dirección</strong>
                                <p className="text-dark fs-5">{info?.direccion}</p>
                            </div>
                            <div className="col-12 col-md-6 mb-3">
                                <strong className="text-muted">Teléfono</strong>
                                <p className="text-dark fs-5">{info?.telefono}</p>
                            </div>
                        </div>






                        {/* <div className="d-flex justify-content-center gap-5 align-items-center">
                            <p className="mb-0">
                                <strong className="text-muted">Estado:</strong>{" "}
                                <span
                                    className={`badge ${info?.estado ? "bg-success" : "bg-danger"} rounded-pill px-4 py-2 fs-6`}
                                >
                                    {info?.estado ? "Habilitado" : "Inhabilitado"}
                                </span>
                            </p>

                            {info?.estado && (
                                <button
                                    className="btn btn-primary px-4 py-2"
                                    onClick={() => handleTaxpayerState(info)}
                                >
                                    <i className="bi bi-check-circle me-2"></i>
                                    Dar de alta
                                </button>
                            )}
                        </div> */}


                        <div className="d-flex justify-content-center gap-5 align-items-center">
                            <p className="mb-0">
                                <strong className="text-muted">Estado:</strong>{" "}
                                <span
                                    className={`badge ${allComerciosHabilitados ? "bg-success" : "bg-danger"} rounded-pill px-4 py-2 fs-6`}
                                >
                                    {allComerciosHabilitados ? "Habilitado" : "Inhabilitado"}
                                </span>
                            </p>
                            {allComerciosHabilitados && (
                                <button
                                    className="btn btn-primary px-4 py-2"
                                    onClick={() => handleTaxpayerState(info)}
                                >
                                    <i className="bi bi-check-circle me-2"></i>
                                    Dar de alta
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {/* Lista de Comercios */}
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="card-header bg-secondary text-white rounded-top-4">
                        <h5 className="mb-0">Comercios Asociados</h5>
                    </div>
                    <div className="card-body">
                        {data?.response.length > 0 ? (
                            <table className="table table-bordered table-striped text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Código</th>
                                        <th>Nombre</th>
                                        <th>Dirección</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.response.map((comercio) => (
                                        <tr key={comercio?.id_comercio}>
                                            <td>{comercio?.cod_comercio}</td>
                                            <td>{comercio?.nombre_comercio}</td>
                                            <td>{comercio?.direccion_comercio}</td>
                                            {comercio.estado === false ? (
                                                <td className="d-flex align-items-center justify-content-center">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleTradeState(comercio)}
                                                    >
                                                        Dar de alta
                                                    </button>
                                                </td>
                                            ) : (
                                                <td className="d-flex mt-1 align-items-center justify-content-center badge bg-success text-white" style={{ fontSize: '16px' }}>
                                                    Habilitado
                                                </td>
                                            )}
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

            {/* Confirmación Modal */}
            {showConfirmTradeModal && (
                <ConfirmAddTradeModal
                    selectedEstado={selectedEstado}
                    handleEstadoChange={handleTradeStateChange}
                    setShowConfirmModal={setShowConfirmTradeModal}
                />
             )}

            {showConfirmTaxpayerModal && (
                <ConfirmAddTaxpayerModal
                    selectedEstado={selectedEstado}
                    handleEstadoChange={handleTaxpayerStateChange}
                    setShowConfirmModal={setShowConfirmTaxpayerModal}
                />
            )}
            <SuccessModal
                show={showSuccessModal}
                message="Dado de alta exitosamente."
                duration={3000} // Duración en milisegundos           
            />
        </>
    );
}
export default DetailsTaxpayer