import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import WelcomeModal from '../components/modalsComponents/WelcomeModal';
import { useAuth } from '../context/AuthProvider';
import LoginAdmin from '../components/auth/LoginAdmin';
import RegisterFields from '../components/auth/RegisterFields';
import ErrorNotification from '../components/ErrorNotification';
import LoginTaxpayer from '../components/auth/LoginTaxpayer';

const AuthPage = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { login } = useAuth();
    const [modalShow, setModalShow] = useState(false);
    const [modalType, setModalType] = useState('login'); // Control del tipo de modal (login o register)
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState('contribuyente');

    const [loginAdmin, setLoginAdmin] = useState({ username: '', password: '' });
    const [loginTaxpayer, setLoginTaxpayer] = useState({
        cuit: {
            prefijoCuit: '',
            numeroCuit: '',
            verificadorCuit: '',
        },
        password: ''
    });

    const [errorsAdmin, setErrorsAdmin] = useState({
        username: null,
        password: null,
    });

    const [errorTaxpayer, setErrorTaxpayer] = useState({
        password: null,
        cuit: {
            prefijoCuit: null,
            numeroCuit: null,
            verificadorCuit: null,
        },
    });

    const [registroData, setRegistroData] = useState({
        nombre: '',
        apellido: '',
        cuit: {
            prefijoCuit: '',
            numeroCuit: '',
            verificadorCuit: '',
        },
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
                username: value.trim() === "" ? "*Usuario es obligatorio" : null,
            });
        }
        if (name === "password") {
            setErrorsAdmin({
                ...errorsAdmin,
                password: value.trim() === "" ? "*Contraseña obligatoria" : null,
            });
        }
    };

    // Validación y actualización de datos personales
    const handleLoginTaxpayerChange = (e) => {
        const { name, value } = e.target;
        setLoginTaxpayer({ ...loginTaxpayer, [name]: value });
        if (name === "password") {
            setErrorTaxpayer({
                ...errorTaxpayer,
                password: value.trim() === "" ? "*Contraseña obligatoria" : null,
            });
        }
    };

    // // Validación y actualización de CUIT
    const handleCuitChange = (e) => {
        const { name, value } = e.target;
        // Actualizar valores del CUIT
        setLoginTaxpayer({
            ...loginTaxpayer,
            cuit: {
                ...loginTaxpayer.cuit,
                [name]: value,
            },
        });
        // Validar cada parte del CUIT
        const cuitErrors = { ...errorTaxpayer.cuit };
        if (name === "prefijoCuit") cuitErrors.prefijoCuit = value.length === 2 ? null : "Sólo 2 dígitos";
        else if (name === "numeroCuit") cuitErrors.numeroCuit = value.length >= 8 && value.length <= 9 ? null : "Entre 8 o 9 dígitos";
        else cuitErrors.verificadorCuit = value.length === 1 ? null : "Sólo 1 dígito";

        setErrorTaxpayer({
            ...errorTaxpayer,
            cuit: cuitErrors,
        });
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
            let data = userType === 'administrador' ? loginAdmin : loginTaxpayer
           
            try {
                const response = await axios.post(endpoint, data, { withCredentials: true });
               
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
                }else{
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
                    setModalType('register');
                    setModalShow(true);
                }
            } catch (error) {               
                if (error.response) {
                    if (error.response.status === 404){
                        setError(error.response.data.error);
                    
                    }  else{
                        setError(error.response.data.error);
                    } 
                } else{
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
                                                        handleCuitChange={handleCuitChange}
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
                                        disabled={!isLogin && registroData.misComercios.length === 0}
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
                                                cuit: {
                                                    prefijoCuit: '',
                                                    numeroCuit: '',
                                                    verificadorCuit: '',
                                                },
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
