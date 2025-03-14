import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import { useLocation, useParams } from 'react-router-dom';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import useFetch from '../helpers/hooks/useFetch';
import axios from 'axios';
import TaxpayerCard from '../components/detailsTaxpayerComponents/TaxpayerCard';
import TradesTable from '../components/detailsTaxpayerComponents/TradesTable';
import ErrorNotification from '../components/ErrorNotification';
import { useAuth } from '../context/AuthProvider';
import { handleError } from '../helpers/hooks/handleError';

const DetailsTaxpayer = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { id } = useParams();
    const location = useLocation();
    const contribuyente = location.state?.contribuyente;
    
    const { data, refetch } = useFetch(`${URL}/api/taxpayer/${id}`);
    const { logout } = useAuth();

    const [errorMessage, setErrorMessage] = useState(null);
    const [modals, setModals] = useState({
        confirmTrade: false,
        confirmTaxpayer: false,
        success: false,
    });

    const [disabled, setDisabled] = useState({
        confirmDisabled: false,
        confirmTaxpayer: false,
        success: false,
    });
    const [selectedEstado, setSelectedEstado] = useState(null);
    const [trades, setTrades] = useState([]);
   
    const [isTaxpayerEnabled, setIsTaxpayerEnabled] = useState(false);   

    const existeHabilitado = data?.response.some(comercio => comercio.estado);

    useEffect(() => {
        if (data?.response) {
            setTrades(data?.response);
        }
    }, [data]);

    // Configuración del socket
    useEffect(() => {
        const socket = io(URL);
        socket.on('comercio-nuevo', (nuevoComercio) => {
            setTrades((prev) => [...prev, nuevoComercio]);
            refetch();
        });

        socket.on('estado-inactivo', (nuevoComercio) => {
            setTrades((prev) => [...prev, nuevoComercio]);
            refetch();
        });

        socket.on('estado-actualizado', (habilitado) => {
            setTrades((prev) => prev.map(trade =>
                trade.id_comercio === habilitado.id_comercio
                    ? { ...trade, estado: habilitado.estado }
                    : trade
            ));
            refetch();
        });
        return () => socket.disconnect();
    }, [URL, refetch]);

    const toggleModal = (type, state) => {
        setModals((prev) => ({ ...prev, [type]: state }));
    };

    const toggleDisabled = (type, state) => {
        setDisabled((prev) => ({ ...prev, [type]: state }));
    };


    const setError = (message) => {
        setErrorMessage(message); // Establece el mensaje de error en el estado
    };

    const handleTradeDisabled = async () =>{
        toggleDisabled('success', false);
        try {
            const response = await axios.put(`${URL}/api/trades/${selectedEstado.id_comercio}`, null, {
                withCredentials: true,
            });
            if (response.status === 200) {
                toggleDisabled('success', true);
                // Actualiza el estado local de los comercios
                const updatedTrades = trades.map((trade) =>
                    trade.id_comercio === selectedEstado.id_comercio ? { ...trade, estado: true } : trade
                );
                setTrades(updatedTrades);

                // Verificar si este es el primer comercio habilitado
                const algunComercioHabilitado = updatedTrades.some((trade) => trade.estado);
                if (algunComercioHabilitado && !isTaxpayerEnabled) {
                    // Habilita al contribuyente si es necesario
                    await handleTaxpayerStateChange();
                }

                refetch();
            }
        } catch (error) {
            handleError(error, {
                on401: (message) => {
                    setError(message);
                    setTimeout(() => logout(), 3000);
                },
                on404: (message) => setError(message), // Puedes pasar cualquier función específica
                onOtherServerError: (message) => setError(message),
                onConnectionError: (message) => setError(message),
            });
        } finally {
            toggleDisabled('confirmDisabled', false);
        }
    }

    const handleTradeStateChange = async () => {       
        toggleModal('success', false);
        try {
            const response = await axios.put(`${URL}/api/trade/${selectedEstado.id_comercio}`, null, {
                withCredentials: true,
            });
            if (response.status === 200) {
                toggleModal('success', true);
                // Actualiza el estado local de los comercios
                const updatedTrades = trades.map((trade) =>
                    trade.id_comercio === selectedEstado.id_comercio ? { ...trade, estado: true } : trade
                );
                setTrades(updatedTrades);

                // Verificar si este es el primer comercio habilitado
                const algunComercioHabilitado = updatedTrades.some((trade) => trade.estado);
                if (algunComercioHabilitado && !isTaxpayerEnabled) {
                    // Habilita al contribuyente si es necesario
                    await handleTaxpayerStateChange();
                }

                refetch();
            }
        } catch (error) {
            handleError(error, {
                on401: (message) => {
                    setError(message);
                    setTimeout(() => logout(), 3000);
                },
                on404: (message) => setError(message), // Puedes pasar cualquier función específica
                onOtherServerError: (message) => setError(message),
                onConnectionError: (message) => setError(message),
            });
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
                setIsTaxpayerEnabled(true);
                refetch();
            }
        } catch (error) {
            handleError(error, {
                on401: (message) => {
                    setError(message);
                    setTimeout(() => logout(), 3000);
                },
                on404: (message) => setError(message), // Puedes pasar cualquier función específica
                onOtherServerError: (message) => setError(message),
                onConnectionError: (message) => setError(message),
            });
        } finally {
            toggleModal('confirmTaxpayer', false);
        }
    };

    return (
        <div className="container mt-4">
            {/* Información del contribuyente */}
            <TaxpayerCard
                info={contribuyente}
                existeHabilitado={existeHabilitado}
            />
            {/* Lista de Comercios */}
            <TradesTable
                id_contribuyente={id}
                trades={trades}
                onTradeStateChange={(comercio) => {
                    setSelectedEstado(comercio);
                    toggleModal('confirmTrade', true);
                }}
                disabledTrade={(comercio) => {
                    setSelectedEstado(comercio);
                    toggleDisabled('confirmDisabled', true);
                }}
                refetch={refetch}
                setTrades={setTrades}
                URL={URL}
                logout={logout}
            />
            {/* Modales */}
            {modals.confirmTrade && (
                <ConfirmModal
                    msj={`¿Desea dar de alta al comercio n° ${selectedEstado?.cod_comercio} ?`}
                    handleEstadoChange={handleTradeStateChange}
                    setShowConfirmModal={() => toggleModal('confirmTrade', false)}
                />
            )}

            {disabled.confirmDisabled && (
                <ConfirmModal
                    msj={`Desea dejar inactivo al comercio n° ${selectedEstado?.cod_comercio} ?`}
                    handleEstadoChange={handleTradeDisabled}
                    setShowConfirmModal={() => toggleDisabled('confirmDisabled', false)}
                />
            )}
            {modals.success &&(
                <SuccessModal
                    show={modals.success}
                    message="Dado de alta exitosamente."
                    duration={3000}
                />
            )}

            {disabled.success && (
                <SuccessModal
                    show={disabled.success}
                    message="Ha sido inhablitado exitosamente."
                    duration={3000}
                />
            )}

            <ErrorNotification
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />
        </div>
    );
};

export default DetailsTaxpayer;