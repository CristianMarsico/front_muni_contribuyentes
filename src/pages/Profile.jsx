import React, { useEffect, useState } from 'react'
import InputField from '../components/auth/InputField';
import ErrorNotification from '../components/ErrorNotification';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import { useAuth } from '../context/AuthProvider'
import useFetch from '../helpers/hooks/useFetch';
import "bootstrap/dist/css/bootstrap.min.css";
import { handleError } from '../helpers/hooks/handleError';
import axios from 'axios';

const Profile = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { logout, user } = useAuth();   
    const { data, refetch } = useFetch(`${URL}/api/user/${user.rol}`)
    const [usuarioApi, setUsuarioApi] = useState([]);    

    useEffect(() => {
        if (data?.response) {
            setUsuarioApi(data?.response);
        } else {
            setUsuarioApi([]);
        }
    }, [data])

    const [formData, setFormData] = useState({
        id: "",
        usuario: "",
        pass_actual: "",
        pass_nuevo: "",
        re_pass_nuevo: "",
    });

    useEffect(() => {
        if (usuarioApi?.length > 0) {          
            setFormData((prevState) => ({
                ...prevState,
                id: usuarioApi[0].id_usuario, // Aquí se actualiza correctamente
                usuario: usuarioApi[0].usuario, // Aquí se actualiza correctamente
            }));
        }
    }, [usuarioApi]);
   
    const [editando, setEditando] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [msjModalExito, setMsjModalExito] = useState("");
    const [errorsData, setErrorsData] = useState({
        usuario: null,
        pass_actual: null,
        pass_nuevo: null,
        re_pass_nuevo: null,
    });

    const handleChange = (e) => {
        if (!editando) return; // Evita cambios si no estás en modo edición
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorsData({ ...errorsData, [e.target.name]: null });
    };

    const toggleEditar = () => {
        if (editando) {
            if (validateForm()) {
                setShowConfirmModal(true);
            }
        } else {
            setEditando(true);
        }
    };

    const handleCancel = () => {      
        setEditando(false);        
    };

    const validateForm = () => {
        let errors = {};
        let isValid = true;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

        for (let key in formData) {
            if (!formData[key] || !formData[key].toString().trim()) {
                errors[key] = "*Este campo es obligatorio.";
                isValid = false;
            }
        }

        if (formData.usuario.length < 6) {
            errors.usuario = "*El nombre de usuario debe tener al menos 6 caracteres.";
            isValid = false;
        }

        if (formData.pass_nuevo && !passwordRegex.test(formData.pass_nuevo)) {
            errors.pass_nuevo = "*Debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.";
            isValid = false;
        }

        if (formData.re_pass_nuevo && formData.pass_nuevo !== formData.re_pass_nuevo) {
            errors.re_pass_nuevo = "*Las contraseñas no coinciden.";
            isValid = false;
        }

        if (formData.pass_nuevo && !formData.pass_actual) {
            errors.pass_actual = "*Debe ingresar su contraseña actual para cambiarla.";
            isValid = false;
        }

        setErrorsData(errors);
        return isValid;
    };

    const handleConfirmChange = (confirm) => {
        if (confirm) {
            submitForm();
        } else {
            setShowConfirmModal(false);
        }
    };

    const submitForm = async () => {      
        let data = {
            usuario: formData?.usuario, 
            pass_actual: formData?.pass_actual,
            pass_nueva: formData?.pass_nuevo,
            id: formData?.id
        }
        try {
            const res = await axios.put(`${URL}/api/user/${data.id}`, data, { withCredentials: true });
            if (res?.status === 200) {
                console.log(res)           
                setMsjModalExito(res?.data.message);
                setShowConfirmModal(false);
                setShowSuccessModal(false);
                setTimeout(() => setShowSuccessModal(true), 100);               
                setEditando(false);
                // setMostrarForm(!mostrarForm);
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
        }finally{
            setShowConfirmModal(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card mx-auto shadow border-0 p-3" style={{ maxWidth: "400px", borderRadius: "15px" }}>
                {/* Encabezado del perfil */}
                <div className="text-center">
                    <div className="position-relative d-inline-block">
                        <img
                            src="/img/perfil.jpg"
                            alt="Avatar"
                            className="rounded-circle border border-3 border-white shadow"
                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                        />                      
                    </div>
                    <h4 className="mt-3 mb-1">{formData.usuario}</h4>                   
                </div>

                {/* Formulario */}
                <div className="mt-3">
                    <InputField
                        label="Nombre de Usuario"
                        name="usuario"
                        value={formData.usuario}
                        type="text"
                        onChange={handleChange}
                        placeholder="Ingrese su nombre de usuario"
                        error={errorsData.usuario}
                    />

                    <InputField
                        label="Contraseña Actual"
                        name="pass_actual"
                        value={formData.pass_actual}
                        type="password"
                        onChange={handleChange}
                        placeholder="Ingrese su contraseña actual"
                        error={errorsData.pass_actual}
                    />

                    <InputField
                        label="Nueva Contraseña"
                        name="pass_nuevo"
                        value={formData.pass_nuevo}
                        type="password"
                        onChange={handleChange}
                        placeholder="Ingrese su nueva contraseña"
                        error={errorsData.pass_nuevo}
                    />

                    <InputField
                        label="Confirmar Nueva Contraseña"
                        name="re_pass_nuevo"
                        value={formData.re_pass_nuevo}
                        type="password"
                        onChange={handleChange}
                        placeholder="Repita su nueva contraseña"
                        error={errorsData.re_pass_nuevo}
                    />
                </div>

                {/* Botones */}
                <div className="d-grid gap-2 mt-3">
                    <button className="btn btn-primary d-flex align-items-center justify-content-center" onClick={toggleEditar}>
                        <i className={`bi ${editando ? "bi-check" : "bi-pencil"} me-2`}></i>
                        {editando ? "Guardar" : "Editar"}
                    </button>

                    {editando && (
                        <button className="btn btn-outline-secondary d-flex align-items-center justify-content-center" onClick={handleCancel}>
                            <i className="bi bi-x me-2"></i> Cancelar
                        </button>
                    )}
                </div>
            </div>

            {/* Modal de Confirmación */}
            {showConfirmModal && (
                <ConfirmModal
                    msj="¿Seguro que deseas guardar los cambios?"
                    handleEstadoChange={handleConfirmChange}
                    setShowConfirmModal={() => setShowConfirmModal(false)}
                />
            )}

            {/* Modal de Éxito */}
            <SuccessModal
                show={showSuccessModal}
                message={msjModalExito}
                duration={3000}
            />

            {/* Notificación de Error */}
            <ErrorNotification
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />
        </div>
    );
};

export default Profile;