import React from 'react';
import InputField from './InputField';

// Definición del componente LoginAdmin, que es un formulario de login para el administrador.
// Recibe tres propiedades: loginAdmin (que contiene los valores de los campos de formulario),
// handleLoginAdminChange (función que maneja los cambios en los campos del formulario),
// y errorsAdmin (que contiene los mensajes de error para cada campo).
const LoginAdmin = ({ loginAdmin, handleLoginAdminChange, errorsAdmin }) => {
    return (
        <>
            {/* Componente InputField reutilizado para el campo "Usuario" */}
            <InputField label="Usuario"
                name="username"
                value={loginAdmin.username}
                type="text"
                onChange={handleLoginAdminChange}
                error={errorsAdmin.username}
                placeholder="Ingrese usuario" />

            {/* Componente InputField reutilizado para el campo "Contraseña" */}
            <InputField label="Contraseña"
                name="password"
                value={loginAdmin.password}
                type="password"
                onChange={handleLoginAdminChange}
                error={errorsAdmin.password}
                placeholder="Ingrese contraseña" />
        </>
    );
};

export default LoginAdmin;
