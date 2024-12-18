import axios from 'axios';
import React, { useEffect, useState } from 'react'
import useFetch from '../../helpers/hooks/useFetch';
import InputField from '../auth/InputField';
import ErrorNotification from '../ErrorNotification';
import SuccessModal from '../modalsComponents/SuccessModal';

const DataTableConfig = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { data, refetch } = useFetch(`${URL}/api/configuration`);

    // Estado de configuraciones
    const [configuracionGeneral, setConfiguracionGeneral] = useState({
        fecha_limite_ddjj: '',
        monto_ddjj_defecto: '',
        tasa_actual: '',
        tasa_default: '',
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorsConfig, setErrorsConfig] = useState({});

    // Mensajes de error personalizados para cada campo
    const errorMessages = {
        fecha_limite_ddjj: "*Especifique el día límite para cargar DDJJ.",
        tasa_actual: "*La tasa actual es obligatoria y debe ser un número decimal válido.",
        monto_ddjj_defecto: "*El monto por defecto es obligatorio y debe ser un número decimal válido.",
        tasa_default: "*La tasa por defecto es obligatoria y debe ser un número decimal válido."
    };

    // Usar useEffect para inicializar el estado con los datos de la API
    useEffect(() => {
        if (data?.response[0]) {
            setConfiguracionGeneral({
                fecha_limite_ddjj: data.response[0].fecha_limite_ddjj || '',
                tasa_actual: data.response[0].tasa_actual || '',
                monto_ddjj_defecto: data.response[0].monto_defecto || '',
                tasa_default: data.response[0].tasa_default || '',
            });
        }
    }, [data]);

    const setError = (message) => {
        setErrorMessage(message);
    };

    // Función de validación común para todos los campos
    const validateField = (name, value) => {
        const decimalRegex = /^\d+(\.\d{1,2})?$/; // Número con hasta 2 decimales
        let errorMessage = null;

        // Validación si el campo está vacío
        if (value.trim() === "") {
            errorMessage = errorMessages[name] || "*Este campo es obligatorio.";
        }
        // Validación de formato decimal
        else if (!decimalRegex.test(value)) {
            errorMessage = "*El valor debe ser un número decimal válido con hasta 2 decimales.";
        }

        return errorMessage;
    };

    // Manejo de cambios en los campos del formulario
    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfiguracionGeneral({ ...configuracionGeneral, [name]: value });

        // Validamos el campo
        const errorMessage = validateField(name, value);

        // Actualizamos los errores en el estado
        setErrorsConfig((prevErrors) => ({
            ...prevErrors,
            [name]: errorMessage,
        }));
    };

    // Verificamos si hay algún error en el formulario
    const isFormValid = Object.values(errorsConfig).every((error) => error === null);

    const handleConfigData = async () => {
        let id = data?.response[0].id_configuracion;
        try {
            const response = await axios.put(`${URL}/api/configuration/${id}`, configuracionGeneral, {
                withCredentials: true,
            });          
            if (response.status === 200) {              
                setShowSuccessModal(false);
                setTimeout(() => setShowSuccessModal(true), 100); // Delay corto para re-renderizar
                refetch();
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
            <div>
                <h3 className="card-title">Configuración General</h3>
                <form>
                    <InputField
                        label="Tasa actual"
                        name="tasa_actual"
                        value={configuracionGeneral.tasa_actual}
                        type="number"
                        onChange={handleConfigChange}
                        error={errorsConfig.tasa_actual}
                        step="0.01"
                        min="0"
                    />
                    <InputField
                        label="N° de dia limite para cargar DDJJ"
                        name="fecha_limite_ddjj"
                        value={configuracionGeneral.fecha_limite_ddjj}
                        type="number"
                        onChange={handleConfigChange}
                        error={errorsConfig.fecha_limite_ddjj}
                    />
                    <InputField
                        label="Monto DDJJ por Defecto"
                        name="monto_ddjj_defecto"
                        value={configuracionGeneral.monto_ddjj_defecto}
                        type="number"
                        onChange={handleConfigChange}
                        error={errorsConfig.monto_ddjj_defecto}
                        step="0.01"
                        min="0"
                    />
                    <InputField
                        label="Tasa Default (%)"
                        name="tasa_default"
                        value={configuracionGeneral.tasa_default}
                        type="number"
                        onChange={handleConfigChange}
                        error={errorsConfig.tasa_default}
                        step="0.01"
                        min="0"
                    />
                </form>
                <button
                    className="btn btn-success mt-3"
                    onClick={handleConfigData}
                    disabled={!isFormValid}  // El botón se desactiva si hay errores
                >
                    Mostrar Datos en Consola
                </button>
            </div>

            <SuccessModal
                show={showSuccessModal}
                message="Configuracíon modificada."
                duration={3000}
            />

            <ErrorNotification
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />
        </>
    );
};
export default DataTableConfig;