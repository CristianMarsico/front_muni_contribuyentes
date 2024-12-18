import axios from 'axios';
import React, { useEffect, useState } from 'react'
import InputField from '../components/auth/InputField';
import ErrorNotification from '../components/ErrorNotification';
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

  useEffect(() => {
    if (data?.response?.length > 0) {
      setSelectedComercio(data.response[0].id_comercio);
    }
  }, [data]);

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
      // Validación del monto
      const decimalRegex = /^\d+(\.\d{1,2})?$/; // Número con hasta 2 decimales
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

    // Validación final antes de enviar
    const decimalRegex = /^\d+(\.\d{1,2})?$/;
    let errorMessage = null;

    if (registroDDJJ.monto.trim() === "") {
      errorMessage = "*El monto es obligatorio.";
    } else if (!decimalRegex.test(registroDDJJ.monto)) {
      errorMessage = "*El monto debe ser un número decimal válido con hasta 2 decimales.";
    }

    if (errorMessage) {
      setErrorsDDJJ({ ...errorsDDJJ, monto: errorMessage });
      return; // Evita continuar si hay errores
    }

    const data = {
      id_contribuyente: user.id,
      id_comercio: selectedComercio,
      monto: parseFloat(registroDDJJ?.monto).toFixed(2), // Asegura que sea decimal de 2 cifras
      descripcion: registroDDJJ?.descripcion || null
    };

    try {
      const response = await axios.post(`${URL}/api/ddjj`, data, { withCredentials: true });
      if (response.status === 200) {
        setShowSuccessModal(false); // Reinicia el estado
        setTimeout(() => setShowSuccessModal(true), 0);
        refetch();
        setRegistroDDJJ({ monto: '', descripcion: '' }); // Limpia los campos después del éxito
        setErrorsDDJJ({ monto: null }); // Limpia los errores
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setError(error.response.data.error);
        } else {
          setError("Ocurrió un error en el servidor. Por favor, intente más tarde.");
        }
      } else {
        setError("Error de conexión. Verifique su red e intente nuevamente.");
      }
    }
  };

  return (
    <>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="text-center mb-4">Cargar DDJJ</h2>

                <form onSubmit={handleSubmit}>
                  <div>
                    <div className="col-md-12 mb-3">
                      <label htmlFor="comercio" className="form-label">Seleccione Comercio:</label>
                      <select
                        id="comercio"
                        className="form-select"
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
                          data?.response.map((c) => (
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