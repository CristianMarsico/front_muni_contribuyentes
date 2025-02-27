import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import WelcomeModal from '../components/modalsComponents/WelcomeModal';
import { useAuth } from '../context/AuthProvider';
import LoginAdmin from '../components/auth/LoginAdmin';
import RegisterFields from '../components/auth/RegisterFields';
import ErrorNotification from '../components/ErrorNotification';
import LoginTaxpayer from '../components/auth/LoginTaxpayer';
import Loading from '../components/Loading';
import { handleError } from '../helpers/hooks/handleError';

const AuthPage = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { login } = useAuth();
    const [modalShow, setModalShow] = useState(false);
    const [modalType, setModalType] = useState('register'); // Control del tipo de modal (login o register)
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState('contribuyente');
    const [isLoading, setIsLoading] = useState(false);

    const [loginAdmin, setLoginAdmin] = useState({ username: '', password: '' });
    const [loginTaxpayer, setLoginTaxpayer] = useState({
        cuit: '',
        password: ''
    });

    const [errorsAdmin, setErrorsAdmin] = useState({
        username: null,
        password: null,
    });

    const [errorTaxpayer, setErrorTaxpayer] = useState({
        password: null,
        cuit: null,
    });

    const [registroData, setRegistroData] = useState({
        nombre: '',
        apellido: '',
        cuit: '',
        email: '',
        direccion: '',
        telefono: '',
        password: '',
        rePassword: '',
        razon_social: '',
        misComercios: [], // Arreglo de comercios
    });

    const setError = (message) => {
        setErrorMessage(message); // Establece el mensaje de error en el estado
    };

    const handleLoginAdminChange = (e) => {
        const { name, value } = e.target;
        setLoginAdmin({ ...loginAdmin, [name]: value });
        if (name === "username") {
            setErrorsAdmin({
                ...errorsAdmin,
                username: value.trim() === "" ? "*Usuario es obligatorio." : null,
            });
        }
        if (name === "password") {
            setErrorsAdmin({
                ...errorsAdmin,
                password: value.trim() === "" ? "*Contraseña obligatoria." : null,
            });
        }
    };

    // Validación y actualización de datos personales
    const handleLoginTaxpayerChange = (e) => {
        const { name, value } = e.target;
        if (name === "cuit") {
            // Permitir solo números y restringir a 11 caracteres
            const numericValue = value.replace(/\D/g, "").slice(0, 11);
            setLoginTaxpayer({ ...loginTaxpayer, [name]: numericValue });
            setErrorTaxpayer({
                ...errorTaxpayer,
                cuit: numericValue.length !== 11 ? "*El CUIT debe contener exactamente 11 dígitos." : null,
            });
            return;
        }
        if (name === "password") {
            setLoginTaxpayer({ ...loginTaxpayer, [name]: value });
            setErrorTaxpayer({
                ...errorTaxpayer,
                password: value.trim() === "" ? "*Contraseña obligatoria." : null,
            });
            return;
        }
        setLoginTaxpayer({ ...loginTaxpayer, [name]: value });
    };

    // Redirección y cierre automático del modal
    const handleAutoHideModal = () => {
        setModalShow(false);
        navigate("/home"); // Redirige después de que el modal desaparezca
    };

    // Manejo del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();      
        if (isLogin) {
            let errors = {};
            if (userType === "contribuyente") {
                if (!loginTaxpayer.cuit.trim()) errors.cuit = "*CUIT obligatorio.";
                else if (!/^\d{11}$/.test(loginTaxpayer.cuit)) errors.cuit = "*El CUIT debe contener exactamente 11 dígitos.";

                if (!loginTaxpayer.password.trim()) errors.password = "*Contraseña obligatoria.";
                setErrorTaxpayer(errors);
                if (Object.keys(errors).length > 0) return;
            }
            else {
                if (!loginAdmin.username.trim()) errors.username = "*Usuario obligatorio.";
                if (!loginAdmin.password.trim()) errors.password = "*Contraseña obligatoria.";
                setErrorsAdmin(errors);
                if (Object.keys(errors).length > 0) return;
            }

            const endpoint = userType === 'administrador'
                ? `${URL}/api/auth/login/admin`
                : `${URL}/api/auth/login/taxpayer`;
            let data = userType === 'administrador' ? loginAdmin : loginTaxpayer

            setIsLoading(true);

            try {
                const response = await axios.post(endpoint, data, { withCredentials: true });
                if (response?.status === 200) {
                    login(response?.data);
                    // navigate("/home")
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
                setIsLoading(false);
            }
        } else {

            const codigosComercioFinales = [...registroData.misComercios];

            const registroFinal = {
                ...registroData,
                misComercios: codigosComercioFinales.filter(Boolean),
            };           
            try {
                const response = await axios.post(`${URL}/api/auth/register`, registroFinal);
                if (response?.status === 200) {
                    setModalType('register');
                    setModalShow(true);
                }
            } catch (error) {
                handleError(error, {
                    on401: (message) => {
                        setError(message);
                        setTimeout(() => logout(), 3000);
                    },
                    on404: (message) =>
                        setError(message), // Puedes pasar cualquier función específica
                    onOtherServerError: (message) => setError(message),
                    onConnectionError: (message) => setError(message),
                });
            }
        }
    };

    return (
        <>
            {isLoading && <Loading />}
            {!isLoading && (
                <div className="container mt-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                            <div className="card shadow p-3">
                                <div className="card-body">
                                    <h2 className="text-center mb-4">{isLogin ? 'Inicio de sesión' : 'Registro'}</h2>

                                    <form onSubmit={handleSubmit}>
                                        {isLogin ? (
                                            <>
                                                <div className="mb-3">
                                                    <label htmlFor="userType" className="form-label">
                                                        Selecciona el tipo de usuario:
                                                    </label>
                                                    <select
                                                        id="userType"
                                                        name="userType"
                                                        className="form-select text-center"
                                                        value={userType}
                                                        onChange={(e) => setUserType(e.target.value)}
                                                        required
                                                    >
                                                        <option value="contribuyente">Contribuyente</option>
                                                        <option value="administrador">Administrador</option>
                                                    </select>
                                                </div>
                                                {
                                                    userType !== "contribuyente" ? (
                                                        <LoginAdmin
                                                            loginAdmin={loginAdmin}
                                                            handleLoginAdminChange={handleLoginAdminChange}
                                                            errorsAdmin={errorsAdmin}
                                                        />
                                                    ) : (
                                                        <LoginTaxpayer
                                                            loginTaxpayer={loginTaxpayer}
                                                            handleLoginTaxpayerChange={handleLoginTaxpayerChange}
                                                            errorTaxpayer={errorTaxpayer}
                                                        />
                                                    )
                                                }
                                            </>

                                        ) : (
                                            <RegisterFields
                                                registroData={registroData}
                                                setRegistroData={setRegistroData}
                                                setError={setError}
                                            />
                                        )}

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100"
                                            disabled={!isLogin && registroData?.misComercios.length === 0}
                                        >
                                            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                                        </button>
                                    </form>
                                    <button
                                        className="btn btn-link w-100 mt-3"
                                        onClick={() => {
                                            setIsLogin(!isLogin); // Cambiar entre login y registro
                                            // Limpiar los campos de registro cuando vuelves a Login
                                            if (isLogin) {
                                                setRegistroData({
                                                    nombre: '',
                                                    apellido: '',
                                                    cuit: '',
                                                    email: '',
                                                    direccion: '',
                                                    telefono: '',
                                                    password: '',
                                                    rePassword: '',
                                                    razon_social: '',
                                                    misComercios: [], // Arreglo de comercios
                                                });
                                            }
                                        }}
                                    >
                                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                                    </button>

                                    <button
                                        className="btn btn-link w-100 text-danger"
                                        onClick={() => navigate(`/recuperar`)}
                                    >
                                        {isLogin && 'Olvidé mi contraseña'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <WelcomeModal
                show={modalShow}
                onAutoHide={handleAutoHideModal}
                duration={2000}
                type={modalType}
            />
            <ErrorNotification
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />
        </>
    );
};

export default AuthPage;
