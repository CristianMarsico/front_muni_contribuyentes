import React, { useState } from 'react'

// Definimos el componente InputField, que es un campo de formulario genérico.
//minimo 6 parametros (label, name, type, value, onChange, error).
//al poner ...rest puede seguir recibiendo X cantidad de valores.
const InputField = ({ label, name, type, value, onChange, error, ...rest }) => {
    // Estado para alternar la visibilidad de la contraseña
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="mb-3 position-relative">
            <label htmlFor={name} className="form-label">{label}</label>
            <input
                id={name}
                name={name}
                type={type === "password" && showPassword ? "text" : type}
                value={value}
                onChange={onChange}
                // Removemos la clase is-invalid para el tipo password
                className={`form-control ${error ? "has-error" : ""}`}
                {...rest}
            />
            {/* Mensaje de error mostrado manualmente */}
            {error && (
                <div style={{ color: "red", fontSize: "0.875em", marginTop: "0.25em" }}>
                    {error}
                </div>
            )}

            {/* Si el campo es contraseña, mostramos el ícono para alternar visibilidad */}
            {type === "password" && (
                <div
                    style={{
                        position: "absolute",
                        top: "3.2rem",
                        right: "10px",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        fontSize: "18px",
                        color: "#333333",
                        zIndex: 1,
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                </div>
            )}
        </div>
    );
};
export default InputField