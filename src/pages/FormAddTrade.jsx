import axios from 'axios';
import React, { useState } from 'react'
import InputField from '../components/auth/InputField';
import ErrorNotification from '../components/ErrorNotification';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import { useAuth } from '../context/AuthProvider';
import { handleError } from '../helpers/hooks/handleError';

const FormAddTrade = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { user, logout } = useAuth();

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [registerTrade, setRegisterTrade] = useState({
        codigo_comercio: '',
        nombre_comercio: '',
        direccion_comercio: ''
    });

    const [errorsTrade, setErrorsTrade] = useState({
        codigo_comercio: null,
        nombre_comercio: null,
        direccion_comercio: null
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const setError = (message) => {
        setErrorMessage(message);
    };

    const handleAddTradeChange = (e) => {
        const { name, value } = e.target;
        setRegisterTrade((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let errorMessage = null;

        if (registerTrade.codigo_comercio.trim() === "") {
            setErrorsTrade(prev => ({
                ...prev,
                codigo_comercio: "*Código de comercio obligatorio."
            }));
            errorMessage = "*Código de comercio obligatorio.";
        } else if (registerTrade.nombre_comercio.trim() === "") {
            setErrorsTrade(prev => ({
                ...prev,
                nombre_comercio: "*Nombre de comercio obligatorio."
            }));
            errorMessage = "*Nombre de comercio obligatorio.";
        } else if (registerTrade.direccion_comercio.trim() === "") {
            setErrorsTrade(prev => ({
                ...prev,
                direccion_comercio: "*Dirección de comercio obligatoria."
            }));
            errorMessage = "*Dirección de comercio obligatoria.";
        }

        if (errorMessage) {
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
            codigo_comercio: registerTrade.codigo_comercio,
            nombre_comercio: registerTrade.nombre_comercio,
            direccion_comercio: registerTrade.direccion_comercio
        };

        try {
            const response = await axios.post(`${URL}/api/trade`, data, { withCredentials: true });
            if (response?.status === 200) {
                setShowSuccessModal(false);
                setTimeout(() => setShowSuccessModal(true), 100);
                setRegisterTrade({
                    codigo_comercio: '',
                    nombre_comercio: '',
                    direccion_comercio: ''
                });
                setErrorsTrade({
                    codigo_comercio: null,
                    nombre_comercio: null,
                    direccion_comercio: null
                });
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
            setShowConfirmModal(false);
        }
    };

    return (
        <>
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card shadow">
                            <div className="card-body">
                                <h2 className="text-center mb-4">Cargar Comercio</h2>

                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <InputField
                                            label="Código de comercio"
                                            name="codigo_comercio"
                                            value={registerTrade.codigo_comercio}
                                            type="number"
                                            onChange={handleAddTradeChange}
                                            error={errorsTrade.codigo_comercio}
                                            placeholder="Ingrese código de comercio"
                                        />
                                        <InputField
                                            label="Nombre de comercio"
                                            name="nombre_comercio"
                                            value={registerTrade.nombre_comercio}
                                            type="text"
                                            onChange={handleAddTradeChange}
                                            error={errorsTrade.nombre_comercio}
                                            placeholder="Ingrese nombre de comercio"
                                        />
                                        <InputField
                                            label="Dirección de comercio"
                                            name="direccion_comercio"
                                            value={registerTrade.direccion_comercio}
                                            type="text"
                                            onChange={handleAddTradeChange}
                                            error={errorsTrade.direccion_comercio}
                                            placeholder="Ingrese dirección de comercio"
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">
                                        Cargar Comercio
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showConfirmModal && (
                <ConfirmModal
                    msj={`¿Continuar con la carga del comercio N° ${registerTrade.codigo_comercio} ?`}
                    setShowConfirmModal={setShowConfirmModal}
                    handleEstadoChange={handleConfirmChange}
                />
            )}
            <SuccessModal
                show={showSuccessModal}
                message="El comercio se ha cargado con éxito."
                duration={3000}
            />
            <ErrorNotification
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />
        </>
    );
}

export default FormAddTrade