import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import InputDecimal from '../components/auth/InputDecimal';
import InputField from '../components/auth/InputField';
import ErrorNotification from '../components/ErrorNotification';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import RectificacionModal from '../components/modalsComponents/RectificacionModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import WarningModal from '../components/modalsComponents/WarningModal';
import { useAuth } from '../context/AuthProvider';
import { handleError } from '../helpers/hooks/handleError';
import useFetch from '../helpers/hooks/useFetch';

const FormAddDdjj = () => {
  const URL = import.meta.env.VITE_API_URL;
  const { user, logout } = useAuth();
  const { data, loading, error, refetch } = useFetch(`${URL}/api/trade/${user?.id}`);

  const { data: config } = useFetch(`${URL}/api/configuration`);
  const res = config?.response[0]
  const [selectedComercio, setSelectedComercio] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [registroDDJJ, setRegistroDDJJ] = useState({
    monto: '',
    descripcion: ''
  });

  const [errorsDDJJ, setErrorsDDJJ] = useState({
    monto: null,
    descripcion: null
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
    let montoError = null;
    let mesError = null;

    // Validación del monto
    if (registroDDJJ.monto.trim() === "") {
      montoError = "*El monto es obligatorio.";
    } else if (!decimalRegex.test(registroDDJJ.monto)) {
      montoError = "*El monto debe ser un número decimal válido con hasta 2 decimales.";
    }

    // Validación del mes
    if (!registroDDJJ.descripcion || registroDDJJ.descripcion.trim() === "") {
      mesError = "*Debe seleccionar un mes.";
    }

    // Si hay errores, actualiza los estados y detén el envío
    if (montoError || mesError) {
      setErrorsDDJJ({
        monto: montoError,
        descripcion: mesError,
      });
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
      descripcion: `ddjj perteneciente al mes de ${registroDDJJ?.descripcion}` || null
    };   
    try {
      const response = await axios.post(`${URL}/api/ddjj`, data, { withCredentials: true });
      if (response?.status === 200) {
        setShowSuccessModal(false);
        setTimeout(() => setShowSuccessModal(true), 100);
        refetch();
        setRegistroDDJJ({ monto: '', descripcion: '' });
        setErrorsDDJJ({ monto: null });
        setShowConfirmModal(false); // Cierra el modal de confirmación después del envío
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
      setShowSuccessModal(false);
      setShowConfirmModal(false);
    }
  };

  let msjWarning = `Recuerde cargar las declaraciones juradas (DDJJ) antes del <strong>dia ${res?.fecha_limite_ddjj} de cada mes</strong> para evitar inconvenientes o sanciones.`;
  const today = new Date().getDate();   

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo",
    "Junio", "Julio", "Agosto", "Septiembre",
    "Octubre", "Noviembre", "Diciembre"
  ];
  const mesActual = meses[new Date().getMonth()];

  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          {today < res?.fecha_limite_ddjj ?
            <WarningModal
              msj={msjWarning}
            />
            : <RectificacionModal 
              fecha={res?.fecha_limite_ddjj - 1}
            />
          }
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
                    <InputDecimal
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
                    <div className="mb-3 position-relative">
                      <label className="form-label">Mes Correspondiente</label>
                      <select
                        name="descripcion"
                        value={registroDDJJ.descripcion}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRegistroDDJJ({ ...registroDDJJ, descripcion: value });

                          // Si selecciona un mes válido, eliminar el error
                          setErrorsDDJJ(prevErrors => ({
                            ...prevErrors,
                            descripcion: value ? null : "*Debe seleccionar un mes."
                          }));
                        }}
                        className={`form-select text-center ${errorsDDJJ.descripcion ? "is-invalid" : ""}`}
                      >
                        <option value="">Seleccione el mes actual</option>
                        <option value={mesActual}>{mesActual}</option>
                      </select>
                      {errorsDDJJ?.descripcion && (
                        <div className="invalid-feedback">{errorsDDJJ?.descripcion}</div>
                      )}
                    </div>
                  </div>


                  <button type="submit"
                    className="btn btn-primary w-100"
                    disabled={today >= res?.fecha_limite_ddjj}>
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