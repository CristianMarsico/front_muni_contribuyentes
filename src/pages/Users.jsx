import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { io } from 'socket.io-client';
import InputField from '../components/auth/InputField';
import ErrorNotification from '../components/ErrorNotification';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import ErrorResponse from '../components/ErrorResponse';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthProvider';
import useFetch from '../helpers/hooks/useFetch';
import { handleError } from '../helpers/hooks/handleError';

const Users = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { logout } = useAuth();
    const { data, loading, error, refetch } = useFetch(`${URL}/api/user`)
    const [configuracionUsuario, setConfiguracionUsuario] = useState({
        usuario: '',
        password: '',
        rePassword: '',
    });

    const [msjModalExito, setMsjModalExito] = useState("");
    const [initialConfig, setInitialConfig] = useState(null);
    const [isModified, setIsModified] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        isVisible: false,
        message: '',
        onConfirm: null,
    });

    const [errorMessage, setErrorMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [errorsConfig, setErrorsConfig] = useState({
        usuario: null,
        password: null,
        rePassword: null,
    });

    const errorMessages = {
        usuario: '*Campo obligatorio.',
        password: '*Campo obligatorio.',
        rePassword: '*Campo obligatorio.',
    };

    const [users, setUsers] = useState([]);
    const [showSetPass, setShowSetPass] = useState(false); // Formulario de cambio de contraseña
    const [selectedUserId, setSelectedUserId] = useState(null); // ID usuario seleccionado
    const [configurationPass, setConfigurationPass] = useState({ password: "", rePassword: "" });
    const [errorsConfigPass, setErrorsConfigPass] = useState({ password: null, rePassword: null });
    // Actualizar la lista cuando se reciben nuevos datos de la API
    useEffect(() => {
        if (data?.response) {
            setUsers(data?.response);
        } else {
            setUsers([]);
        }
    }, [data]);
    // Configurar eventos del socket

    useEffect(() => {
        const socket = io(URL);
        // Evento: agregar nuevo contribuyente
        socket.on('new-admin', (nuevoAdmin) => {
            setUsers((prevAdmin) => [...prevAdmin, nuevoAdmin]);
            refetch();
        });

        socket.on('deleted_admin', (borradoAdmin) => {
            setUsers((prevAdmin) => [...prevAdmin, borradoAdmin]);
            refetch();
        });

        return () => {
            socket.disconnect();
        };
    }, [URL, refetch]);
    // Validaciones

    const validateFieldPass = (name, value) => {
        let errorMessage = null;

        if (value.trim() === "") {
            errorMessage = "*Este campo es obligatorio.";
        } else if (name === "password") {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(value)) {
                errorMessage =
                    "*La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.";
            }
        } else if (name === "rePassword") {
            if (value !== configurationPass.password) {
                errorMessage = "*Las contraseñas no coinciden.";
            }
        }

        return errorMessage;
    };

    const validateField = (name, value) => {
        let errorMessage = null;

        if (value.trim() === '') {
            errorMessage = errorMessages[name] || '*Este campo es obligatorio.';
        }
        else if (name === 'usuario') {
            if (value.length < 6) {
                errorMessage = '*El nombre de usuario debe tener al menos 6 caracteres.';
            }
        }
        else if (name === 'password') {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(value)) {
                errorMessage =
                    '*La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.';
            }
        } else if (name === 'rePassword') {
            if (value !== configuracionUsuario.password) {
                errorMessage = '*Las contraseñas no coinciden.';
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

        setIsModified(
            JSON.stringify({ ...configuracionUsuario, [name]: value }) !==
            JSON.stringify(initialConfig)
        );
    };

    const handleConfigChangePass = (e) => {
        const { name, value } = e.target;
        setConfigurationPass((prevState) => ({ ...prevState, [name]: value }));

        const errorMessage = validateFieldPass(name, value);
        setErrorsConfigPass((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    };

    const handleMostrarFormulario = () => {
        setMostrarForm(!mostrarForm);
    };

    const isFormValid =
        Object.values(errorsConfig).every((error) => error === null) &&
        configuracionUsuario.usuario.trim() !== '' &&
        configuracionUsuario.password.trim() !== '' &&
        configuracionUsuario.rePassword.trim() !== '';

    const handleFormSubmit = async () => {
        setModalConfig({ ...modalConfig, isVisible: false });
        try {
            const res = await axios.post(`${URL}/api/user`, configuracionUsuario, { withCredentials: true });
            if (res?.status === 200) {
                setMsjModalExito(res?.data.message);
                setShowModal(false);
                setTimeout(() => setShowModal(true), 100);
                setConfiguracionUsuario({ usuario: '', password: '', rePassword: '' });
                setInitialConfig({ usuario: '', password: '', rePassword: '' });
                setIsModified(false);
                setMostrarForm(!mostrarForm);
                refetch();
            }
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
        }
    };

    const handleChangePassUser = async (userId) => {
        setModalConfig({ ...modalConfig, isVisible: false });
        if (!configurationPass.password || !configurationPass.rePassword) {
            setErrorMessage("Por favor, completa todos los campos.");
            return;
        }
        if (configurationPass.password !== configurationPass.rePassword) {
            setErrorMessage("Las contraseñas no coinciden.");
            return;
        }
        try {
            const response = await axios.put(`${URL}/api/user/${userId}/${configurationPass.rePassword}`, null, { withCredentials: true });
            if (response?.status == 200) {
                setMsjModalExito(response?.data.message);
                setShowModal(false);
                setTimeout(() => setShowModal(true), 100);
                setConfigurationPass({ password: "", rePassword: "" });
                setErrorsConfigPass({ password: null, rePassword: null });
                setShowSetPass(false);
                refetch();
            }
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
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const res = await axios.delete(`${URL}/api/user/${userId}`, {
                withCredentials: true,
            });
            if (res?.status === 200) {
                setMsjModalExito(res?.data.message);
                setShowModal(false);
                setTimeout(() => setShowModal(true), 100);
                refetch(); // Refrescar la tabla después de eliminar el usuario
            }
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
        }
    };

    const handleShowAddModal = () => {
        setModalConfig({
            isVisible: true,
            message: '¿Deseas agregar un nuevo administrador ?',
            onConfirm: handleFormSubmit, // Función para agregar
        });
    };

    const handleShowChangePassModal = (userId) => {
        setModalConfig({
            isVisible: true,
            message: '¿Deseas modificar la contraseña ?',
            onConfirm: () => handleChangePassUser(userId), // Función para agregar
        });
    };

    const handleShowDeleteModal = (userId) => {
        setModalConfig({
            isVisible: true,
            message: '¿Estás seguro de que deseas eliminar éste usuario?',
            onConfirm: () => handleDeleteUser(userId), // Función para eliminar
        });
    };

    return (
        <>
            {!mostrarForm && !showSetPass && (
                <div className="d-flex justify-content-center">
                    <button
                        className="btn btn-primary rounded-3"
                        onClick={handleMostrarFormulario}
                    >
                        <i className="bi bi-plus-circle me-2"></i> Agregar Administrador
                    </button>
                </div>
            )}

            {mostrarForm && (
                <>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                                <div className="card shadow p-3">
                                    <div className="card-body">
                                        <form >
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
                                            className="btn btn-primary w-100 mb-2"
                                            onClick={handleShowAddModal}
                                            disabled={!isModified || !isFormValid}
                                        >
                                            Agregar administrador
                                        </button>
                                        <button
                                            className="btn btn-danger w-100"
                                            onClick={() => (
                                                setMostrarForm(!mostrarForm),
                                                setConfiguracionUsuario({ usuario: '', password: '', rePassword: '' }),
                                                setInitialConfig({ usuario: '', password: '', rePassword: '' }),
                                                setErrorsConfig({ usuario: null },
                                                    { password: null },
                                                    { rePassword: null })
                                            )
                                            }
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </>
            )}

            {showSetPass && (
                <div className="container mt-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                            <div className="card shadow p-3">
                                <div className="card-body">
                                    <form>
                                        <InputField
                                            label="Nueva Contraseña"
                                            name="password"
                                            value={configurationPass.password}
                                            type="password"
                                            onChange={handleConfigChangePass}
                                            placeholder="Ingrese nueva contraseña"
                                            error={errorsConfigPass.password}
                                        />
                                        <InputField
                                            label="Confirmar Contraseña"
                                            name="rePassword"
                                            value={configurationPass.rePassword}
                                            type="password"
                                            onChange={handleConfigChangePass}
                                            placeholder="Confirme nueva contraseña"
                                            error={errorsConfigPass.rePassword}
                                        />
                                    </form>
                                    <button
                                        className="btn btn-primary w-100 mt-2"
                                        onClick={() => handleShowChangePassModal(selectedUserId)}
                                        disabled={
                                            !configurationPass.password ||
                                            !configurationPass.rePassword ||
                                            errorsConfigPass.password ||
                                            errorsConfigPass.rePassword
                                        }
                                    >
                                        Cambiar Contraseña
                                    </button>
                                    <button
                                        className="btn btn-danger w-100 mt-2"
                                        onClick={() => {
                                            setShowSetPass(false);
                                            setConfigurationPass({ password: "", rePassword: "" });
                                            setErrorsConfigPass({ password: null, rePassword: null });
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mostrar Tabla */}
            {!mostrarForm && !showSetPass && (
                <div className="container col-12">
                    <div className="mt-4">
                        <div className="card shadow">
                            <div className="card-header bg-primary text-white text-center">
                                <h5 className="mb-0">Listado de administradores</h5>
                            </div>
                            <div className="row justify-content-center">
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered text-center w-100" style={{ textAlign: "center", verticalAlign: "middle" }}>
                                            <thead className="thead-dark">
                                                <tr className="text-uppercase text-light">
                                                    <th scope="col">#</th>
                                                    <th scope="col">USUARIO</th>
                                                    <th scope="col">ESTADO</th>
                                                    <th scope="col">ELIMINAR</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="4">
                                                            <div className="d-flex justify-content-center">
                                                                <Loading />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : error ? (
                                                    <tr>
                                                        <td colSpan="4">
                                                            <div className="text-danger">
                                                                <ErrorResponse
                                                                    message={error?.message || 'No hay administradores'}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    users.map((a, index) => (
                                                        <tr key={index}>
                                                            {
                                                                <>
                                                                    <th className="text-secondary">{index + 1}</th>
                                                                    <td className="fw-bold">{a.usuario}</td>
                                                                    <td>
                                                                        <button
                                                                            className="btn btn-warning btn-sm fw-bold"
                                                                            onClick={() => {
                                                                                setSelectedUserId(a.id_usuario);
                                                                                setShowSetPass(true);
                                                                            }}
                                                                        >
                                                                            CAMBIAR CONTRASEÑA
                                                                        </button>
                                                                    </td>
                                                                    <td>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-danger btn-sm fw-bold"
                                                                            onClick={() => handleShowDeleteModal(a.id_usuario)}
                                                                        >
                                                                            DAR DE BAJA
                                                                        </button>
                                                                    </td>
                                                                </>

                                                            }
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalConfig.isVisible && (
                <ConfirmModal
                    msj={modalConfig.message}
                    handleEstadoChange={() => {
                        modalConfig.onConfirm();
                        setModalConfig({ ...modalConfig, isVisible: false });
                    }}
                    setShowConfirmModal={(isVisible) =>
                        setModalConfig((prev) => ({ ...prev, isVisible }))
                    }
                />
            )}
            <SuccessModal
                show={showModal}
                message={msjModalExito}
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