import React, { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/auth/InputField';
import ErrorNotification from '../components/ErrorNotification';

const RecoverPassword = () => {
    const URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRePassword, setNewRePassword] = useState('');
    const [step, setStep] = useState(1);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false); // Estado para controlar la carga

    const validateFields = () => {
        const fieldErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!email) fieldErrors.email = '*El correo electrónico es obligatorio.';
        else if (!emailRegex.test(email)) fieldErrors.email = '*Debe ser un correo electrónico válido.';

        if (step === 2) {
            if (!code) fieldErrors.code = 'El código es obligatorio.';
            if (!newPassword) {
                fieldErrors.newPassword = 'La nueva contraseña es obligatoria.';
            } else if (!passwordRegex.test(newPassword)) {
                fieldErrors.newPassword ='La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.';
            }
            if (!newRePassword) {
                fieldErrors.newRePassword = 'Debe confirmar la nueva contraseña.';
            } else if (newPassword !== newRePassword) {
                fieldErrors.newRePassword = 'Las contraseñas no coinciden.';
            }
        }

        setErrors(fieldErrors);
        return Object.keys(fieldErrors).length === 0;
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!validateFields()) return;
        setLoading(true); // Activar el indicador de carga
        try {
            const res = await axios.post(`${URL}/api/auth/recover-password`, { email });
            if (res.status === 200) {
                setSuccessMessage(res?.data?.message);
                setStep(2);
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Error al enviar el código.');
        } finally {
            setLoading(false); // Desactivar el indicador de carga
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!validateFields()) return;
        setLoading(true);
        try {
            const res = await axios.post(`${URL}/api/auth/reset-password`, { email, code, newPassword });
            setSuccessMessage('Contraseña actualizada correctamente.');
            setStep(1);
            setEmail('');
            setCode('');
            setNewPassword('');
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Error al actualizar la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card shadow p-3">
                            <div className="card-body">
                                <h4 className="text-center mb-4">Recuperar cuenta</h4>
                                <form>
                                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                    {loading && (
                                        <div className="text-center">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                        </div>
                                    )}
                                    {step === 1 && (
                                        <>
                                            <InputField
                                                label="Correo de recuperación"
                                                name="email"
                                                value={email}
                                                type="email"
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Ingrese email"
                                                error={errors.email}
                                            />
                                            <button
                                                onClick={handleSendCode}
                                                className="btn btn-primary w-100"
                                                disabled={loading}>
                                                Obtener Código
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => navigate('/')}
                                                className="btn btn-secondary mt-2 w-100"
                                                disabled={loading}>
                                                Volver
                                            </button>
                                        </>
                                    )}
                                    {step === 2 && (
                                        <>
                                            <InputField
                                                label="Código"
                                                name="code"
                                                value={code}
                                                type="text"
                                                onChange={(e) => setCode(e.target.value)}
                                                placeholder="Ingrese el código"
                                                error={errors.code}
                                            />
                                            <InputField
                                                label="Nueva contraseña"
                                                name="newPassword"
                                                value={newPassword}
                                                type="password"
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Ingrese nueva contraseña"
                                                error={errors.newPassword}
                                            />
                                            <InputField
                                                label="Verifique contraseña"
                                                name="newRePassword"
                                                value={newRePassword}
                                                type="password"
                                                onChange={(e) => setNewRePassword(e.target.value)}
                                                placeholder="Reingrese contraseña"
                                                error={errors.newRePassword}
                                            />
                                            <button
                                                onClick={handleResetPassword}
                                                className="btn btn-primary w-100"
                                                disabled={loading}>
                                                Actualizar Contraseña
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => navigate('/')}
                                                className="btn btn-danger mt-2 w-100"
                                                disabled={loading}>
                                                Salir
                                            </button>
                                        </>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ErrorNotification
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />
        </>
    );
};

export default RecoverPassword