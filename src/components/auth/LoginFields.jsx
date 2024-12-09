import React from 'react';

const LoginFields = ({ userType, setUserType, loginData, handleLoginChange }) => {
    return (
        <>
            <div className="mb-3">
                <label htmlFor="userType" className="form-label">
                    Selecciona el tipo de usuario:
                </label>
                <select
                    id="userType"
                    name="userType"
                    className="form-select"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    required
                >
                    <option value="contribuyente">Contribuyente</option>
                    <option value="administrador">Administrador</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="username" className="form-label">
                    {userType === 'contribuyente' ? 'CUIL' : 'Usuario'}
                </label>
                <input
                    type={userType === 'contribuyente' ? 'number' : 'text'}
                    id="username"
                    name="username"
                    className="form-control"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="password" className="form-label">
                    Contraseña
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                />
            </div>
        </>
    );
};

export default LoginFields;
