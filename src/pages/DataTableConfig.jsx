import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthProvider';
import useFetch from '../helpers/hooks/useFetch';
import InputField from '../components/auth/InputField';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import ErrorNotification from '../components/ErrorNotification';


const DataTableConfig = () => {
    const URL = import.meta.env.VITE_API_URL;// URL de la API desde las variables de entorno
    const { data, refetch } = useFetch(`${URL}/api/configuration`);// Hook personalizado para obtener los datos de configuración
    const { logout } = useAuth();

    // Estado que almacena la configuración general
    const [configuracionGeneral, setConfiguracionGeneral] = useState({
        fecha_limite_ddjj: '',
        monto_ddjj_defecto: '',
        tasa_actual: '',
        tasa_default: '',
    });
    // Estado que almacena los valores iniciales de configuración para comparar con los actuales
    const [initialConfig, setInitialConfig] = useState(null);

    // Estado para controlar si los valores han sido modificados
    const [isModified, setIsModified] = useState(false);

    // Estados para los modales de confirmación y éxito
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Estado para manejar los errores
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorsConfig, setErrorsConfig] = useState({});

    // Estado para almacenar los valores obtenidos desde la API
    const [values, setValues] = useState([]);

    // Este useEffect obtiene los datos de configuración desde la API y los guarda en el estado 'values'
    useEffect(() => {
        if (data?.response) {
            setValues(data?.response);
        } else {
            setValues([]);
        }
    }, [data]);

    // Este useEffect maneja la conexión con el servidor usando WebSockets (socket.io)
    useEffect(() => {
        const socket = io(URL);// Establece la conexión con el servidor WebSocket
        socket.on('nuevos-valores', (nuevoValor) => {// Escucha el evento 'nuevos-valores' desde el servidor
            setValues((prev) => [...prev, nuevoValor]);// Actualiza el estado 'values' con el nuevo valor recibido
            refetch();// Vuelve a hacer la solicitud para obtener los datos actualizados
        });
        return () => socket.disconnect();// Desconecta el WebSocket cuando el componente se desmonta
    }, [URL, refetch]);

    // Mensajes de error para cada campo
    const errorMessages = {
        fecha_limite_ddjj: "*Especifique el día límite para cargar DDJJ.",
        tasa_actual: "*La tasa actual es obligatoria y debe ser un número decimal válido.",
        monto_ddjj_defecto: "*El monto por defecto es obligatorio y debe ser un número decimal válido.",
        tasa_default: "*La tasa por defecto es obligatoria y debe ser un número decimal válido."
    };

    // Este useEffect establece la configuración inicial cuando los datos de la API se cargan
    useEffect(() => {
        if (data?.response[0]) {
            const initialData = {
                fecha_limite_ddjj: data.response[0].fecha_limite_ddjj || '',
                tasa_actual: data.response[0].tasa_actual || '',
                monto_ddjj_defecto: data.response[0].monto_defecto || '',
                tasa_default: data.response[0].tasa_default || '',
            };
            setConfiguracionGeneral(initialData);// Actualiza el estado con la configuración obtenida
            setInitialConfig(initialData); // Guarda los valores iniciales para comparar más tarde
        }
    }, [data]);

    // Función para validar los campos de configuración
    const validateField = (name, value) => {
        const decimalRegex = /^\d+(\.\d{1,2})?$/;// Expresión regular para validar números decimales con hasta 2 decimales
        let errorMessage = null;

        // Verifica si el campo está vacío
        if (value.trim() === "") {
            errorMessage = errorMessages[name] || "*Este campo es obligatorio.";
        } else if (!decimalRegex.test(value)) {
            errorMessage = "*El valor debe ser un número decimal válido con hasta 2 decimales.";
        }

        return errorMessage;
    };

    // Compara valores iniciales y actuales para determinar si se modificó algo
    const handleConfigChange = (e) => {
        const { name, value } = e.target;// Obtiene el nombre y valor del campo modificado
        setConfiguracionGeneral({ ...configuracionGeneral, [name]: value });// Actualiza el estado con el nuevo valor

        const errorMessage = validateField(name, value);// Valida el nuevo valor

        // Actualiza los errores con el nuevo mensaje de error (si existe)
        setErrorsConfig((prevErrors) => ({
            ...prevErrors,
            [name]: errorMessage,
        }));

        // Compara los valores actuales con los iniciales para verificar si algo ha cambiado
        setIsModified(
            JSON.stringify({ ...configuracionGeneral, [name]: value }) !== JSON.stringify(initialConfig)
        );
    };

    // Verifica si el formulario es válido, es decir, si no hay errores
    const isFormValid = Object.values(errorsConfig).every((error) => error === null);

    // Función para enviar los datos modificados a la API
    const handleConfigData = async () => {
        let id = data?.response[0].id_configuracion;// Obtiene el ID de la configuración actual
        try {
            const response = await axios.put(`${URL}/api/configuration/${id}`, configuracionGeneral, {
                withCredentials: true,
            });
            if (response.status === 200) {
                setShowSuccessModal(false);// Cierra el modal de éxito
                setTimeout(() => setShowSuccessModal(true), 100);// Muestra el modal de éxito después de un pequeño retraso
                setShowConfirmModal(false);// Cierra el modal de confirmación
                refetch();// Refresca los datos de configuración
                setIsModified(false)
            }
            // Maneja errores de la solicitud
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    setErrorMessage(error.response.data.error);// Muestra el error de autenticación
                    // Redirige al usuario a la página de inicio si está no autorizado
                    setTimeout(() => {
                        logout();
                    }, 3000);
                }
                else if (error.response.status === 404) {
                    setErrorMessage(error.response.data.error);
                } else {
                    setErrorMessage("Ocurrió un error en el servidor. Por favor, intente más tarde.");
                }
            } else {
                setErrorMessage("Error de conexión. Verifique su red e intente nuevamente.");
            }
        } finally {
            setShowConfirmModal(false);// Cierra el modal de confirmación independientemente del resultado
        }
    };

    return (
        <>
            <div className="container mt-2">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-5">
                        <div className="card shadow p-3">
                            <div className="card-body">
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
                                        label="N° de día límite para cargar DDJJ"
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
                                        label="Tasa POST vencimiento"
                                        name="tasa_default"
                                        value={configuracionGeneral.tasa_default}
                                        type="number"
                                        onChange={handleConfigChange}
                                        error={errorsConfig.tasa_default}
                                        step="0.01"
                                        min="0"
                                    />
                                </form>
                                {/* Botón para confirmar cambios */}
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={() => setShowConfirmModal(true)}
                                    disabled={!isModified || !isFormValid} // Deshabilitado hasta que se modifique algo y sea válido
                                >
                                    Cambiar Valores
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            {showConfirmModal && (
                <ConfirmModal
                    msj="¿Seguro desea cambiar la configuración?"
                    handleEstadoChange={handleConfigData}
                    setShowConfirmModal={setShowConfirmModal}
                />
            )}

            <SuccessModal
                show={showSuccessModal}
                message="Configuración modificada."
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