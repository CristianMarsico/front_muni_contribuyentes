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

    const handleCheckRectificar = async (id_rectificacion) => {
        try {
            const res = await axios.put(`${URL}/api/rectificar/${id_rectificacion}`, null, {
                withCredentials: true,
            });
            if (res?.status === 200) {
                setMsjModalExito(res?.data.message);
                setShowModal(false);
                setTimeout(() => setShowModal(true), 100);
                setDdjj((prev) =>
                    prev.map((item) => {
                        if (item.rectificaciones) {
                            return {
                                ...item,
                                rectificaciones: item.rectificaciones.map((rect) =>
                                    rect.id_rectificacion === id_rectificacion
                                        ? { ...rect, enviada: true }
                                        : rect
                                ),
                            };
                        }
                        return item;
                    })
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
          checked={ddjj?.enviada || selectedCheckbox === `${ddjj?.id_rectificacion}`}
          onChange={() =>
              handleShowModal(
                  `Al marcarla como procesada recuerde cargarla en RAFAM !`,
                  () => handleCheckRectificar(ddjj?.id_rectificacion)
              )
          }
      />
  )
}

export default CheckboxRectificar