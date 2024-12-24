import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import ConfirmAddTradeModal from '../components/modalsComponents/ConfirmAddTradeModal';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import useFetch from '../helpers/hooks/useFetch';
import axios from 'axios';
import TaxpayerCard from '../components/detailsTaxpayerComponents/TaxpayerCard';
import TradesTable from '../components/detailsTaxpayerComponents/TradesTable';
import ErrorNotification from '../components/ErrorNotification';

const DetailsTaxpayer = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { id } = useParams();
    const { data, refetch } = useFetch(`${URL}/api/taxpayer/${id}`)
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    const [modals, setModals] = useState({
        confirmTrade: false,
        confirmTaxpayer: false,
        success: false,
    });
    const [selectedEstado, setSelectedEstado] = useState(null);
    const [trades, setTrades] = useState([]);
    const [taxpayer, setTaxpayer] = useState([]);
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

        socket.on('estado-actualizado', (habilitado) => {
            setTaxpayer((prev) => [...prev, habilitado]);
            refetch();
        });
        return () => socket.disconnect();
    }, [URL, refetch]);

    const toggleModal = (type, state) => {
        setModals((prev) => ({ ...prev, [type]: state }));
    };

    const setError = (message) => {
        setErrorMessage(message); // Establece el mensaje de error en el estado
    };

    const handleTradeStateChange = async () => {
        toggleModal('success', false);
        try {
            const response = await axios.put(`${URL}/api/trade/${selectedEstado.id_comercio}`, null, {
                withCredentials: true,
            });           
            if (response.status === 200) {
                toggleModal('success', true);
                refetch();
            }
        } catch (error) {         
            if (error.response) {
                if (error.response.status === 401) {
                    setError(error.response.data.error);
                    setTimeout(() => {
                        navigate("/");
                    }, 3000); 
                }
                else if (error.response.status === 404) {
                    setError(error.response.data.error);
                } else {
                    setError(error.response.data.error);
                }
            } else {
                setError("Error de conexión. Verifique su red e intente nuevamente.");
            }
        } finally {
            toggleModal('confirmTrade', false);
        }
    };

    const handleTaxpayerStateChange = async () => {
        toggleModal('success', false);
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
            if (error.response) {
                if (error.response.status === 401) {
                    setError(error.response.data.error);
                    setTimeout(() => {
                        navigate("/");
                    }, 3000);
                }
                else if (error.response.status === 404) {
                    setError(error.response.data.error);
                } else {
                    setError(error.response.data.error);
                }
            } else {
                setError("Error de conexión. Verifique su red e intente nuevamente.");
            }
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
                id_contribuyente = {id}
                trades={trades}
                onTradeStateChange={(comercio) => {
                    setSelectedEstado(comercio);
                    toggleModal('confirmTrade', true);
                }}
                isTaxpayerEnabled={isTaxpayerEnabled}
               
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
            <ErrorNotification
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />
        </div>
    );
};
export default DetailsTaxpayer;