import axios from 'axios';
import React, { useEffect, useState } from 'react'
import InputField from '../components/auth/InputField';
import ErrorNotification from '../components/ErrorNotification';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';

const Users = () => {
    const URL = import.meta.env.VITE_API_URL;
    // const { data, refetch } = useFetch(`${URL}/api/configuration`);
    const [configuracionUsuario, setConfiguracionUsuario] = useState({
        usuario: '',
        password: '',
        rePassword: ''
    });
    const [initialConfig, setInitialConfig] = useState(null); // Valores iniciales
    const [isModified, setIsModified] = useState(false); // Indica si se modificó algún valor
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorsConfig, setErrorsConfig] = useState({});
    const [values, setValues] = useState([]);

    // useEffect(() => {
    //     if (data?.response) {
    //         setValues(data?.response);
    //     } else {
    //         setValues([]);
    //     }
    // }, [data]);

    // useEffect(() => {
    //     const socket = io(URL);
    //     socket.on('nuevos-valores', (nuevoValor) => {
    //         setValues((prev) => [...prev, nuevoValor]);
    //         refetch();
    //     });
    //     return () => socket.disconnect();
    // }, [URL, refetch]);

    const errorMessages = {
        usuario: "*Campo obligatorio.",
        password: "*Campo obligatorio.",
        rePassword: "*Campo obligatorio.",
    };

    // useEffect(() => {
    //     if (data?.response[0]) {
    //         const initialData = {
    //             usuario: data.response[0].usuario || '',
    //             contraseña: data.response[0].contraseña || ''
    //         };
    //         setConfiguracionGeneral(initialData);
    //         setInitialConfig(initialData); // Guardamos los valores iniciales
    //     }
    // }, [data]);

    const validateField = (name, value) => {        
        let errorMessage = null;

        if (value.trim() === "") {
            errorMessage = errorMessages[name] || "*Este campo es obligatorio.";
        } else if (name === "password") {
            // Validar que incluya al menos una mayúscula, una minúscula y un número
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(value)) {
                errorMessage = "*La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.";
            }
        } else if (name === "rePassword") {
            // Validar que coincida con el campo "password"
            if (value !== configuracionUsuario.password) {
                errorMessage = "*Las contraseñas no coinciden.";
            }
        }

        return errorMessage;
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfiguracionUsuario({ ...configuracionUsuario, [name]: value });

        const errorMessage = validateField(name, value);
        setErrorsConfig((prevErrors) => ({
            ...prevErrors,
            [name]: errorMessage,
        }));

        // Compara valores iniciales y actuales para determinar si se modificó algo
        setIsModified(
            JSON.stringify({ ...configuracionUsuario, [name]: value }) !== JSON.stringify(initialConfig)
        );
    };

    const isFormValid = Object.values(errorsConfig).every((error) => error === null);

    const handleConfigData = async () => {       
        try {
            const response = await axios.post(`${URL}/api/user`, configuracionUsuario, {
                withCredentials: true,
            });
            if (response.status === 200) {
                setShowSuccessModal(false);
                setTimeout(() => setShowSuccessModal(true), 100);
                setShowConfirmModal(false);                
            }
        } catch (error) {
            console.log(error)
            setShowConfirmModal(false);
            if (error.response) {
                if (error.response.status === 404) {
                    setErrorMessage(error.response.data.error);
                } else {
                    setErrorMessage("Ocurrió un error en el servidor. Por favor, intente más tarde.");
                }
            } else {
                setErrorMessage("Error de conexión. Verifique su red e intente nuevamente.");
            }
        }
    };

    return (
        <>
            <div className='col-4 border p-3 rounded'>
                {/* <h3 className="card-title">Configuración General</h3> */}
                <form>
                    <InputField
                        label="Usuario"
                        name="usuario"
                        value={configuracionUsuario.usuario}
                        type="text"
                        onChange={handleConfigChange}
                        placeholder="Ingrese usuario"
                        error={errorsConfig.usuario}
                    />
                    <InputField
                        label="Contraseña"
                        name="password"
                        value={configuracionUsuario.password}
                        type="password"
                        onChange={handleConfigChange}
                        placeholder="Ingrese contraseña"
                        error={errorsConfig.password}
                    />
                    <InputField
                        label="Verificar Contraseña"
                        name="rePassword"
                        value={configuracionUsuario.rePassword}
                        type="password"
                        onChange={handleConfigChange}
                        placeholder="Confirme contraseña"
                        error={errorsConfig.rePassword}

                    />
                </form>
                <button
                    className="btn btn-primary w-100"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={!isModified || !isFormValid} // Deshabilitado hasta que se modifique algo y sea válido
                >
                    Agregar Usuario
                </button>
            </div>

            {showConfirmModal && (
                <ConfirmModal
                    msj={"¿Seguro desea dar de alta a " + configuracionUsuario.usuario + "?"}
                    handleEstadoChange={handleConfigData}
                    setShowConfirmModal={setShowConfirmModal}
                />
            )}

            <SuccessModal
                show={showSuccessModal}
                message="Usuario agregado con éxito."
                duration={3000}
            />

            <ErrorNotification
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />
        </>
    );
}

export default Users