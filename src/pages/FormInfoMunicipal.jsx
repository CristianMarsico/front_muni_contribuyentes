import axios from 'axios';
import React, { useEffect, useState } from 'react'
import InputField from '../components/auth/InputField';
import ErrorNotification from '../components/ErrorNotification';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import { useAuth } from '../context/AuthProvider';
import { handleError } from '../helpers/hooks/handleError';
import useFetch from '../helpers/hooks/useFetch';
import { io } from 'socket.io-client';

const FormInfoMunicipal = () => {

    const URL = import.meta.env.VITE_API_URL;// URL de la API desde las variables de entorno
    const { data, refetch } = useFetch(`${URL}/api/configuration`);// Hook personalizado para obtener los datos de configuración
    const { logout } = useAuth();

    // Estado que almacena la configuración general
    const [configuracionGeneral, setConfiguracionGeneral] = useState({
        whatsapp: '',
        email: '',
        telefono: '',
        direccion: '',
        facebook: '',
        instagram: ''
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
        socket.on('new-info', (nuevoValor) => {// Escucha el evento 'nuevos-valores' desde el servidor
            setValues((prev) => [...prev, nuevoValor]);// Actualiza el estado 'values' con el nuevo valor recibido
            refetch();// Vuelve a hacer la solicitud para obtener los datos actualizados
        });
        return () => socket.disconnect();// Desconecta el WebSocket cuando el componente se desmonta
    }, [URL, refetch]);

    // Este useEffect establece la configuración inicial cuando los datos de la API se cargan
    useEffect(() => {
        if (data?.response[0]) {
            const initialData = {
                whatsapp: data?.response[0].whatsapp || '',
                telefono: data?.response[0].telefono || '',
                email: data?.response[0].email || '',
                direccion: data?.response[0].direccion || '',
                facebook: data?.response[0].facebook || '',
                instagram: data?.response[0].instagram || '',
            };
            setConfiguracionGeneral(initialData);// Actualiza el estado con la configuración obtenida
            setInitialConfig(initialData); // Guarda los valores iniciales para comparar más tarde
        }
    }, [data]);

    // Función para validar los campos de configuración
    const validateField = (name, value) => {
        let errorMessage = null;

        // Expresiones regulares para validaciones
        const onlyNumbersRegex = /^\d+$/; // Solo números (sin guiones ni letras)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato de email válido

        switch (name) {
            case "whatsapp":
            case "telefono":
                if (!onlyNumbersRegex.test(value)) {
                    errorMessage = "*Solo se permiten números (sin guiones ni letras).";
                }
                break;

            case "email": // Corrección: debería ser "email" en toda la aplicación
                if (!emailRegex.test(value)) {
                    errorMessage = "*Ingrese un email válido.";
                }
                break;

            case "direccion":
            case "facebook":
            case "instagram":
                if (value.trim().length < 5) {
                    errorMessage = "*El campo debe tener al menos 5 caracteres.";
                }
                break;

            default:
                errorMessage = "*Este campo es obligatorio.";
                break;
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
            const response = await axios.put(`${URL}/api/configurationInfo/${id}`, configuracionGeneral, {
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
            handleError(error, {
                on401: (message) => {
                    setErrorMessage(message);
                    setTimeout(() => logout(), 3000);
                },
                on404: (message) => setErrorMessage(message), // Puedes pasar cualquier función específica
                onOtherServerError: (message) => setErrorMessage(message),
                onConnectionError: (message) => setErrorMessage(message),
            });
        } finally {
            setShowConfirmModal(false);// Cierra el modal de confirmación independientemente del resultado
        }
    };

    const handleCancel = () => {
        // Restablece el formulario a los valores iniciales
        setConfiguracionGeneral(initialConfig);
        setIsModified(false); // Deshabilita el estado de modificación
        setShowConfirmModal(false); // Cierra el modal de confirmación
    };

    return (
        <>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card shadow p-3">
                            <div className="card-body">
                                <form>
                                    <InputField
                                        label="Número de whatsapp"
                                        name="whatsapp"
                                        value={configuracionGeneral.whatsapp}
                                        type="number"
                                        onChange={handleConfigChange}
                                        error={errorsConfig.whatsapp}
                                    />
                                    <InputField
                                        label="Email"
                                        name="email"
                                        value={configuracionGeneral.email}
                                        type="text"
                                        onChange={handleConfigChange}
                                        error={errorsConfig.email}
                                    />
                                    <InputField
                                        label="Número teléfono"
                                        name="telefono"
                                        value={configuracionGeneral.telefono}
                                        type="number"
                                        onChange={handleConfigChange}
                                        error={errorsConfig.telefono}
                                    />

                                    <InputField
                                        label="Direccíon de oficina"
                                        name="direccion"
                                        value={configuracionGeneral.direccion}
                                        type="text"
                                        onChange={handleConfigChange}
                                        error={errorsConfig.direccion}
                                    />

                                    <InputField
                                        label="Facebook"
                                        name="facebook"
                                        value={configuracionGeneral.facebook}
                                        type="text"
                                        onChange={handleConfigChange}
                                        error={errorsConfig.facebook}
                                    />

                                    <InputField
                                        label="Instagram"
                                        name="instagram"
                                        value={configuracionGeneral.instagram}
                                        type="text"
                                        onChange={handleConfigChange}
                                        error={errorsConfig.instagram}
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
                    setShowConfirmModal={handleCancel}
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

export default FormInfoMunicipal