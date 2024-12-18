import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { io } from 'socket.io-client';
import useFetch from '../../helpers/hooks/useFetch';
import InputField from '../auth/InputField';
import ErrorNotification from '../ErrorNotification';
import ConfirmModal from '../modalsComponents/ConfirmModal';
import SuccessModal from '../modalsComponents/SuccessModal';

const DataTableConfig = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { data, refetch } = useFetch(`${URL}/api/configuration`);
    const [configuracionGeneral, setConfiguracionGeneral] = useState({
        fecha_limite_ddjj: '',
        monto_ddjj_defecto: '',
        tasa_actual: '',
        tasa_default: '',
    });
    const [initialConfig, setInitialConfig] = useState(null); // Valores iniciales
    const [isModified, setIsModified] = useState(false); // Indica si se modificó algún valor
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorsConfig, setErrorsConfig] = useState({});
    const [values, setValues] = useState([]);

    useEffect(() => {
        if (data?.response) {
            setValues(data?.response);
        } else {
            setValues([]);
        }
    }, [data]);

    useEffect(() => {
        const socket = io(URL);
        socket.on('nuevos-valores', (nuevoValor) => {
            setValues((prev) => [...prev, nuevoValor]);
            refetch();
        });
        return () => socket.disconnect();
    }, [URL, refetch]);

    const errorMessages = {
        fecha_limite_ddjj: "*Especifique el día límite para cargar DDJJ.",
        tasa_actual: "*La tasa actual es obligatoria y debe ser un número decimal válido.",
        monto_ddjj_defecto: "*El monto por defecto es obligatorio y debe ser un número decimal válido.",
        tasa_default: "*La tasa por defecto es obligatoria y debe ser un número decimal válido."
    };

    useEffect(() => {
        if (data?.response[0]) {
            const initialData = {
                fecha_limite_ddjj: data.response[0].fecha_limite_ddjj || '',
                tasa_actual: data.response[0].tasa_actual || '',
                monto_ddjj_defecto: data.response[0].monto_defecto || '',
                tasa_default: data.response[0].tasa_default || '',
            };
            setConfiguracionGeneral(initialData);
            setInitialConfig(initialData); // Guardamos los valores iniciales
        }
    }, [data]);

    const validateField = (name, value) => {
        const decimalRegex = /^\d+(\.\d{1,2})?$/;
        let errorMessage = null;

        if (value.trim() === "") {
            errorMessage = errorMessages[name] || "*Este campo es obligatorio.";
        } else if (!decimalRegex.test(value)) {
            errorMessage = "*El valor debe ser un número decimal válido con hasta 2 decimales.";
        }

        return errorMessage;
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfiguracionGeneral({ ...configuracionGeneral, [name]: value });

        const errorMessage = validateField(name, value);
        setErrorsConfig((prevErrors) => ({
            ...prevErrors,
            [name]: errorMessage,
        }));

        // Compara valores iniciales y actuales para determinar si se modificó algo
        setIsModified(
            JSON.stringify({ ...configuracionGeneral, [name]: value }) !== JSON.stringify(initialConfig)
        );
    };

    const isFormValid = Object.values(errorsConfig).every((error) => error === null);

    const handleConfigData = async () => {
        let id = data?.response[0].id_configuracion;
        try {
            const response = await axios.put(`${URL}/api/configuration/${id}`, configuracionGeneral, {
                withCredentials: true,
            });
            if (response.status === 200) {
                setShowSuccessModal(false);
                setTimeout(() => setShowSuccessModal(true), 100);
                setShowConfirmModal(false);
                refetch();
            }
        } catch (error) {
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
            <div className='col-5'>
                {/* <h3 className="card-title">Configuración General</h3> */}
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
                    className="btn btn-primary w-100"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={!isModified || !isFormValid} // Deshabilitado hasta que se modifique algo y sea válido
                >
                    Cambiar Valores
                </button>
            </div>

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