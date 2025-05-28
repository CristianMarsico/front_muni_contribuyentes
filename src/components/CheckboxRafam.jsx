import axios from 'axios';
import React from 'react'
import { handleError } from '../helpers/hooks/handleError';

const CheckboxRafam = ({
    ddjj,
    selectedCheckbox,
    setSelectedCheckbox,
    setDdjj,
    refetch,
    handleShowModal,
    setMsjModalExito,
    setShowModal,    
    setErrorMessage,
    logout,
    URL,
}) => {

    const handleCheckSendToRafam = async (id_contribuyente, id_comercio, fecha) => {
        try {
            const res = await axios.put(`${URL}/api/ddjj/${id_contribuyente}/${id_comercio}/${fecha}`, null, {
                withCredentials: true,
            });
            if (res?.status === 200) {
                setMsjModalExito(res?.data.message);
                setShowModal(false);
                setTimeout(() => setShowModal(true), 100);
                setDdjj((prev) =>
                    prev.map((item) =>
                        item.id_contribuyente === id_contribuyente &&
                            item.id_comercio === id_comercio &&
                            item.fecha === fecha
                            ? { ...item, cargada_rafam: true }
                            : item
                    )
                );
                refetch();
            }
        } catch (error) {
            handleError(error, {
                on401: (message) => {
                    setErrorMessage(message);
                    setTimeout(() => logout(), 3000);
                },
                on404: (message) => setErrorMessage(message),
                onOtherServerError: (message) => setErrorMessage(message),
                onConnectionError: (message) => setErrorMessage(message),
            });
        } finally {
            setSelectedCheckbox(null);
        }
    };

    return (        
        <input
            type="checkbox"
            className="form-check-input border-dark"
            checked={
                ddjj?.cargada_rafam ||
                selectedCheckbox === `${ddjj?.id_contribuyente}-${ddjj?.id_comercio}-${ddjj?.fecha}`
            }
            onChange={() =>
                handleShowModal(
                    `¿Deseas enviar a RAFAM la DDJJ del comercio n° ${ddjj?.cod_comercio}?`,
                    () => handleCheckSendToRafam(ddjj?.id_contribuyente, ddjj?.id_comercio, ddjj?.fecha)
                )
            }
        />
        
    );
};

export default CheckboxRafam