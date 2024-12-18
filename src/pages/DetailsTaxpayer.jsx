import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import ConfirmAddTradeModal from '../components/modalsComponents/ConfirmAddTradeModal';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import useFetch from '../helpers/hooks/useFetch';
import axios from 'axios';

const DetailsTaxpayer = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { id } = useParams();
    const { data, refetch } = useFetch(`${URL}/api/taxpayer/${id}`)
    
    // Estados locales
    const [modals, setModals] = useState({
        confirmTrade: false,
        confirmTaxpayer: false,
        success: false,
    });
    const [selectedEstado, setSelectedEstado] = useState(null);
    const [trades, setTrades] = useState([]);
    const taxpayerInfo = data?.response[0];
    const [isTaxpayerEnabled, setIsTaxpayerEnabled] = useState(false);

    useEffect(() => {
        if (data?.response) {
            setTrades(data.response);
            setIsTaxpayerEnabled(data.response[0]?.estado_contri);
        }
    }, [data]);

    // Configuración del socket
    useEffect(() => {
        const socket = io(URL);
        socket.on('comercio-nuevo', (nuevoComercio) => {
            setTrades((prev) => [...prev, nuevoComercio]);
            refetch();
        });
        return () => socket.disconnect();
    }, [URL, refetch]);

    const toggleModal = (type, state) => {
        setModals((prev) => ({ ...prev, [type]: state }));
    };

    const handleTradeStateChange = async () => {
        try {
            const response = await axios.put(`${URL}/api/trade/${selectedEstado.id_comercio}`, null, {
                withCredentials: true,
            });
            if (response.status === 200) {
                toggleModal('success', true);
                refetch();
            }
        } catch (error) {
            console.error('Error actualizando estado del comercio:', error);
        } finally {
            toggleModal('confirmTrade', false);
        }
    };

    const handleTaxpayerStateChange = async () => {
        try {
            const response = await axios.put(`${URL}/api/taxpayer/${id}`, null, {
                withCredentials: true,
            });
            if (response.status === 200) {
                toggleModal('success', true);
                refetch();
                setIsTaxpayerEnabled(true);
            }
        } catch (error) {
            console.error('Error actualizando estado del contribuyente:', error);
        } finally {
            toggleModal('confirmTaxpayer', false);
        }
    };

    const allComerciosHabilitados = trades.every((comercio) => comercio.estado);

    return (
        <div className="container mt-4">
            {/* Información del contribuyente */}
            <TaxpayerCard
                info={taxpayerInfo}
                allComerciosHabilitados={allComerciosHabilitados}
                onTaxpayerStateChange={() => {
                    setSelectedEstado(taxpayerInfo);
                    toggleModal('confirmTaxpayer', true);
                }}
                isTaxpayerEnabled={isTaxpayerEnabled}
            />

            {/* Lista de Comercios */}
            <TradesTable
                trades={trades}
                onTradeStateChange={(comercio) => {
                    setSelectedEstado(comercio);
                    toggleModal('confirmTrade', true);
                }}
               
            />

            {/* Modales */}
            {modals.confirmTrade && (
                <ConfirmAddTradeModal
                    selectedEstado={selectedEstado}
                    handleEstadoChange={handleTradeStateChange}
                    setShowConfirmModal={() => toggleModal('confirmTrade', false)}
                />
            )}

            {modals.confirmTaxpayer && (
                <ConfirmModal
                    msj="¿Desea dar de alta al contribuyente?"
                    handleEstadoChange={handleTaxpayerStateChange}
                    setShowConfirmModal={() => toggleModal('confirmTaxpayer', false)}
                />
            )}

            <SuccessModal
                show={modals.success}
                message="Dado de alta exitosamente."
                duration={3000}
            />
        </div>
    );
};

const TaxpayerCard = ({ info, allComerciosHabilitados, onTaxpayerStateChange, isTaxpayerEnabled }) => (
    <div className="card shadow-lg border-0 rounded-3 mb-4">
        <div className="card-header bg-primary text-white rounded-3">
            <h4 className="mb-0 text-center">Información del Contribuyente</h4>
        </div>
        <div className="card-body p-4 text-center">
            <div className="row">
                <InfoField label="Nombre Completo" value={`${info?.nombre} ${info?.apellido}`} />
                <InfoField label="CUIT" value={info?.cuit} />
                <InfoField label="Email" value={info?.email} />
                <InfoField label="Razón Social" value={info?.razon_social} />
                <InfoField label="Dirección" value={info?.direccion} />
                <InfoField label="Teléfono" value={info?.telefono} />
            </div>
            <div className="d-flex justify-content-center gap-5 align-items-center">
                <p className="mb-0">
                    <strong className="text-muted">Estado:</strong>{' '}
                    <span
                        className={`badge ${allComerciosHabilitados ? 'bg-success' : 'bg-danger'} rounded-pill px-4 py-2 fs-6`}
                    >
                        {allComerciosHabilitados ? 'Habilitado' : 'Inhabilitado'}
                    </span>
                </p>
                {allComerciosHabilitados && !isTaxpayerEnabled && (
                    <button className="btn btn-primary px-4 py-2" onClick={onTaxpayerStateChange}>
                        <i className="bi bi-check-circle me-2"></i>
                        Dar de alta
                    </button>
                )}
            </div>
        </div>
    </div>
);

const InfoField = ({ label, value }) => (
    <div className="col-12 col-md-6 mb-3">
        <strong className="text-muted">{label}</strong>
        <p className="text-dark fs-5">{value}</p>
    </div>
);

const TradesTable = ({ trades, onTradeStateChange }) => (
    <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-secondary text-white rounded-top-4">
            <h5 className="mb-0">Comercios Asociados</h5>
        </div>
        <div className="card-body">
            {trades.length > 0 ? (
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
                        {trades.map((comercio) => (
                            <tr key={comercio.id_comercio}>
                                <td>{comercio.cod_comercio}</td>
                                <td>{comercio.nombre_comercio}</td>
                                <td>{comercio.direccion_comercio}</td>
                                <td className="d-flex align-items-center justify-content-center">
                                    {comercio.estado ? (
                                        <span className="badge bg-success text-white" style={{ fontSize: '16px' }}>
                                            Habilitado
                                        </span>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => onTradeStateChange(comercio)}
                                        >
                                            Dar de alta
                                        </button>
                                    )}
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
);

export default DetailsTaxpayer;