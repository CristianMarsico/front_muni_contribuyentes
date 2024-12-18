import React from 'react';
import InputField from './InputField';

const LoginAdmin = ({ loginAdmin, handleLoginAdminChange, errorsAdmin }) => {
    return (
        <>
            <div>
                <div>
                    <InputField label="Usuario"
                        name="username"
                        value={loginAdmin.username}
                        type="text"
                        onChange={handleLoginAdminChange}
                        error={errorsAdmin.username}
                        placeholder="Ingrese usuario" />

                    <InputField label="Contraseña"
                        name="password"
                        value={loginAdmin.password}
                        type="password"
                        onChange={handleLoginAdminChange}
                        error={errorsAdmin.password}
                        placeholder="Ingrese contraseña" />
                </div>
            </div>
        </>
    );
};

export default LoginAdmin;
