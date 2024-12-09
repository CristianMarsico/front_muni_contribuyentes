import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import WelcomeModal from '../components/WelcomeModal';
import { useAuth } from '../context/AuthProvider';
import LoginFields from '../components/auth/LoginFields';
import RegisterFields from '../components/auth/RegisterFields';
import ErrorNotification from '../components/ErrorNotification';

const AuthPage = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { login } = useAuth();
    const [modalShow, setModalShow] = useState(false);
    const [modalType, setModalType] = useState('login'); // Control del tipo de modal (login o register)
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState('contribuyente');
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registroData, setRegistroData] = useState({
        nombre: '',
        apellido: '',
        cuil: '',
        email: '',
        direccion: '',
        telefono: '',
        password: '',
        misComercios: [], // Arreglo de comercios
    });

    const setError = (message) => {
        setErrorMessage(message); // Establece el mensaje de error en el estado
    };

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleAutoHideModal = () => {
        setModalShow(false);
        navigate("/home"); // Redirige después de que el modal desaparezca
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLogin) {
            const endpoint = userType === 'administrador'
                ? `${URL}/api/auth/login/admin`
                : `${URL}/api/auth/login/taxpayer`;

            try {
                const response = await axios.post(endpoint, loginData, { withCredentials: true });

                if (response.status === 200) {
                    login(response.data);
                    setModalType('login'); // Modal para login
                    setModalShow(true); // Muestra modal
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
        } else {
            const codigosComercioFinales = [...registroData.misComercios];

            const registroFinal = {
                ...registroData,
                misComercios: codigosComercioFinales.filter(Boolean),
            };

            try {
                const response = await axios.post(`${URL}/api/auth/register`, registroFinal);

                if (response.status === 200) {
                    setModalType('register'); // Modal para registro
                    setModalShow(true); // Muestra modal
                }
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 404) {
                        setError(error.response.data.error);
                    } else {
                        setError("Error de servidor. Por favor, intente más tarde.");
                    }
                } else {
                    setError("Error de conexión. Verifique su red e intente nuevamente.");
                }
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
                                <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Registro'}</h2>

                                <form onSubmit={handleSubmit}>
                                    {isLogin ? (
                                        <LoginFields
                                            userType={userType}
                                            setUserType={setUserType}
                                            loginData={loginData}
                                            handleLoginChange={handleLoginChange}
                                        />
                                    ) : (
                                        <RegisterFields
                                            registroData={registroData}
                                            setRegistroData={setRegistroData}
                                        />
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-success w-100"
                                        disabled={!isLogin && registroData.misComercios.length === 0}
                                    >
                                        {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                                    </button>
                                </form>
                                <button
                                    className="btn btn-link w-100 mt-3"
                                    onClick={() => setIsLogin(!isLogin)}
                                >
                                    {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <WelcomeModal
                show={modalShow}
                onAutoHide={handleAutoHideModal}
                duration={2000}
                type={modalType} // Cambia dinámicamente entre "login" y "register"
            />

            <ErrorNotification
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />
        </>
    );
};

export default AuthPage;
