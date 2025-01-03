import React, { useState } from 'react'

// Definimos el componente InputField, que es un campo de formulario genérico.
//minimo 6 parametros (label, name, type, value, onChange, error).
//al poner ...rest puede seguir recibiendo X cantidad de valores.
const InputField = ({ label, name, type, value, onChange, error, ...rest }) => {
    // Estado para controlar si la contraseña debe ser visible u oculta.
    const [showPassword, setShowPassword] = useState(false);
    return (
        <>
            <div className="mb-3 position-relative">
                <label htmlFor={name} className="form-label">{label}</label>
                <input
                    id={name}
                    name={name}
                    type={showPassword ? "text" : type}
                    value={value}
                    onChange={onChange}
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    {...rest}
                />
                {/* Si hay un error, mostramos un mensaje de error debajo del campo */}
                {error && <div className="invalid-feedback">{error}</div>}

                {/* Si el tipo es 'password' y no hay error, mostramos un ícono para mostrar u ocultar la contraseña */}
                {
                    type === "password" && !error && (
                        <div
                            // Usamos estos estilos para acomodar el icono del ojo
                            style={{
                                position: "absolute",
                                top: "74%",
                                right: "10px",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                fontSize: "18px",
                                color: "#333333",
                                zIndex: 1, // Asegura que el ícono quede sobre el input
                            }}
                            // Al hacer clic, cambia el estado de showPassword para alternar entre mostrar/ocultar la contraseña.
                            onClick={() => setShowPassword(!showPassword)}  // Cambiar el estado
                        >
                            {/* // Dependiendo del estado showPassword, cambiamos el ícono entre 'bi-eye' (ojo abierto) y 'bi-eye-slash' (ojo cerrado). */}
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                        </div>
                    )
                }
            </div>

        </>
    );
};

export default InputField