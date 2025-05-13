import axios from 'axios';
import React from 'react'
import { handleError } from '../helpers/hooks/handleError';

const CheckboxRectificar = ({
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

    const handleCheckRectificar = async (id_contribuyente, id_comercio, fecha, id_rectificacion) => {
        try {
            const res = await axios.put(`${URL}/api/rectificar/${id_contribuyente}/${id_comercio}/${fecha}/${id_rectificacion}`, null, {
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
                            item.fecha === fecha &&
                            item.id_rectificacion === id_rectificacion
                            ? { ...item, enviada: true }
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
          checked={ddjj?.cargada_rafam || selectedCheckbox === `${ddjj?.id_contribuyente}-${ddjj?.id_comercio}-${ddjj?.fecha}`}
          onChange={() =>
              handleShowModal(
                  `Al marcarla como procesada recuerde cargarla en RAFAM !`,
                  () => handleCheckRectificar(ddjj?.id_contribuyente, ddjj?.id_comercio, ddjj?.fecha, ddjj?.id_rectificacion)
              )
          }
      />
  )
}

export default CheckboxRectificar