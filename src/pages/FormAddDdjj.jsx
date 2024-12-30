import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import InputField from '../components/auth/InputField';
import ErrorNotification from '../components/ErrorNotification';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import { useAuth } from '../context/AuthProvider';
import useFetch from '../helpers/hooks/useFetch';

const FormAddDdjj = () => {
  const URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch(`${URL}/api/trade/${user?.id}`);
  const [selectedComercio, setSelectedComercio] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [registroDDJJ, setRegistroDDJJ] = useState({
    monto: '',
    descripcion: ''
  });

  const [errorsDDJJ, setErrorsDDJJ] = useState({
    monto: null
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Cambié el valor inicial a false

  useEffect(() => {
    if (data?.response?.length > 0) {
      setSelectedComercio(data.response[0].id_comercio);
    }
  }, [data]);

  useEffect(() => {
    const socket = io(URL);
    socket.on('comercio-nuevo', (nuevoComercio) => {
      const id_comercio = nuevoComercio;
      setSelectedComercio(id_comercio); // Actualiza el estado con un valor único
      refetch();
    });

    return () => socket.disconnect();
  }, [URL], refetch);

  const setError = (message) => {
    setErrorMessage(message);
  };

  const handleComercioChange = (e) => {
    setSelectedComercio(e.target.value);
  };

  const handleAddDDJJChange = (e) => {
    const { name, value } = e.target;
    setRegistroDDJJ({ ...registroDDJJ, [name]: value });

    if (name === "monto") {
      const decimalRegex = /^\d+(\.\d{1,2})?$/;
      let errorMessage = null;

      if (value.trim() === "") {
        errorMessage = "*El monto es obligatorio.";
      } else if (!decimalRegex.test(value)) {
        errorMessage = "*El monto debe ser un número decimal válido con hasta 2 decimales.";
      }

      setErrorsDDJJ({
        ...errorsDDJJ,
        monto: errorMessage
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const decimalRegex = /^\d+(\.\d{1,2})?$/;
    let errorMessage = null;

    if (registroDDJJ.monto.trim() === "") {
      errorMessage = "*El monto es obligatorio.";
    } else if (!decimalRegex.test(registroDDJJ.monto)) {
      errorMessage = "*El monto debe ser un número decimal válido con hasta 2 decimales.";
    }

    if (errorMessage) {
      setErrorsDDJJ({ ...errorsDDJJ, monto: errorMessage });
      return;
    }

    setShowConfirmModal(true); // Muestra el modal de confirmación solo al enviar
  };

  const handleConfirmChange = (confirm) => {
    if (confirm) {
      submitForm();
    } else {
      setShowConfirmModal(false); // Cierra el modal si el usuario cancela
    }
  };

  const submitForm = async () => {
    const data = {
      id_contribuyente: user.id,
      id_comercio: selectedComercio,
      monto: parseFloat(registroDDJJ?.monto).toFixed(2),
      descripcion: registroDDJJ?.descripcion || null
    };

    try {
      const response = await axios.post(`${URL}/api/ddjj`, data, { withCredentials: true });
      if (response.status === 200) {
        setShowSuccessModal(true); // Muestra el modal de éxito
        refetch();
        setRegistroDDJJ({ monto: '', descripcion: '' });
        setErrorsDDJJ({ monto: null });
        setShowConfirmModal(false); // Cierra el modal de confirmación después del envío
      }
    } catch (error) {
      setShowConfirmModal(false);
      if (error.response) {
        if (error.response.status === 401) {
          setError(error.response.data.error);
          setTimeout(() => {
            logout();
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
    }
  };

  return (
    <>
      <div className="container mt-4 mb-4">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-8 col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="text-center mb-4">Cargar DDJJ</h2>

                <form onSubmit={handleSubmit}>
                  <div>
                    <div className="col-md-12 mb-3">
                      <label htmlFor="comercio" className="form-label">Seleccione Comercio:</label>
                      <select
                        id="comercio"
                        className="form-select text-center"
                        value={selectedComercio}
                        onChange={handleComercioChange}
                      >
                        {loading ? (
                          <option>Cargando...</option>
                        ) : error ? (
                          <option>{error?.message || "Error al cargar los datos"}</option>
                        ) : data?.response?.length === 0 ? (
                          <option>No hay comercios disponibles</option>
                        ) : (
                          data?.response
                            .filter(c => c.estado) // Filtra solo los comercios con estado true
                            .map(c => (
                              <option key={c.cod_comercio} value={c.id_comercio}>
                                {c.nombre_comercio} (N° {c.cod_comercio})
                              </option>
                            ))
                        )}
                      </select>
                    </div>

                    <InputField
                      label="Monto"
                      name="monto"
                      value={registroDDJJ.monto}
                      type="number"
                      onChange={handleAddDDJJChange}
                      error={errorsDDJJ.monto}
                      placeholder="Ingrese Monto"
                      step="0.01"
                      min="0"
                    />

                    <InputField
                      label="Descripción"
                      name="descripcion"
                      value={registroDDJJ.descripcion}
                      type="text"
                      onChange={handleAddDDJJChange}
                      error={errorsDDJJ.descripcion}
                      placeholder="Ingrese descripción"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Cargar DDJJ
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmModal
          msj="¿Continuar con la carga de la DDJJ?"
          setShowConfirmModal={setShowConfirmModal}
          handleEstadoChange={handleConfirmChange}
        />
      )}

      <SuccessModal
        show={showSuccessModal}
        message="La DDJJ se ha cargado con éxito."
        duration={3000}
      />

      <ErrorNotification
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
    </>
  );
}

export default FormAddDdjj;