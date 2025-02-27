import React, { useState } from "react";
import InputField from "./InputField";
import TradeCodes from "./TradeCodes";

const RegisterFields = ({ registroData, setRegistroData, setError }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 3; // Total de pasos
    const [nuevoComercio, setNuevoComercio] = useState({
        codigo: "",
        direccion: "",
        nombre: "",
    });

    const [showComercioForm, setShowComercioForm] = useState(false);
    const [errors, setErrors] = useState({
        nombre: null,
        apellido: null,
        password: null,
        rePassword: null,
        email: null,
        direccion: null,
        telefono: null,
        razon_social: null,
        cuit: null,
    });

    // Validación y actualización de datos personales
    const handleRegistroChange = (e) => {
        const { name, value } = e.target;
        setRegistroData({ ...registroData, [name]: value });

        const onlyNumbersRegex = /^\d+$/; // Solo números (sin guiones ni letras)
        // Función para manejar los errores
        const validateField = (name, value) => {
            switch (name) {
                case "nombre":
                case "apellido":
                case "direccion":               
                case "razon_social":
                    if (value.trim() === "") return `*${name.charAt(0).toUpperCase() + name.slice(1)} es obligatorio.`;
                    if (value.trim().length < 4) return `*${name.charAt(0).toUpperCase() + name.slice(1)} debe tener al menos 4 caracteres.`;
                    return null;

                case "telefono":
                    if (!onlyNumbersRegex.test(value)) {
                        return "*Solo se permiten números (sin guiones ni letras).";
                    }
                    break;

                case "email":
                    if (value.trim() === "") {
                        return "*Email obligatorio.";
                    }
                    // Validar formato de correo
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return !emailRegex.test(value) ? "*Formato de email inválido." : null;

                case "password":
                    // Validar que la contraseña tenga al menos una mayúscula, una minúscula y un número
                    if (value.trim() === "") {
                        return "*Contraseña obligatoria";
                    } else {
                        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
                        return !passwordRegex.test(value)
                            ? "*La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número."
                            : null;
                    }
                case "rePassword":
                    // Validar que coincida con el campo "password"
                    if (value.trim() === "") {
                        return "*Confirmación de contraseña obligatoria";
                    } else if (value !== registroData.password) {
                        return "*Las contraseñas no coinciden.";
                    }
                    return null;
                default:
                    return null;
            }
        };

        // Validar y actualizar errores para cada campo
        const errorMessage = validateField(name, value);

        setErrors({ ...errors, [name]: errorMessage, });
    };

    // Validación y actualización de CUIT
    const handleCuitChange = (e) => {
        const { name, value } = e.target;

        if (name === "cuit") {
            // Permitir solo números y restringir a 11 caracteres
            const numericValue = value.replace(/\D/g, "").slice(0, 11);
            setRegistroData({ ...registroData, [name]: numericValue });

            // Validación del CUIT
            let errorMessage = null;
            if (numericValue.length !== 11) {
                errorMessage = "*El CUIT debe contener exactamente 11 dígitos.";
            }

            setErrors({ ...errors, cuit: errorMessage });
        }
    };

    // Validar y registrar un nuevo comercio
    const handleNuevoComercioChange = (e) => {
        setNuevoComercio({ ...nuevoComercio, [e.target.name]: e.target.value });
    };

    const handleRegistrarComercio = () => {
        if (nuevoComercio.codigo && nuevoComercio.direccion && nuevoComercio.nombre) {
            // Verificar si el código ya existe en la lista de comercios
            const codigoDuplicado = registroData.misComercios.some(
                comercio => comercio.codigo === nuevoComercio.codigo
            );

            if (codigoDuplicado) {
                setError(`El código ${nuevoComercio.codigo} ya está registrado. Por favor, usa un código diferente.`);
                return;
            }

            // Si no está duplicado, agregar el nuevo comercio
            setRegistroData({
                ...registroData,
                misComercios: [...registroData.misComercios, nuevoComercio],
            });
            setNuevoComercio({ codigo: "", direccion: "", nombre: "" });
            setShowComercioForm(false);
        } else {
            setError("*Por favor completa todos los campos del comercio.");
        }
    };

    // Eliminar comercio por código
    const handleEliminarComercio = (codigoAEliminar) => {
        setRegistroData({
            ...registroData,
            misComercios: registroData.misComercios.filter(
                (comercio) => comercio.codigo !== codigoAEliminar
            ),
        });
    };

    // Navegación entre pasos
    const handleNextStep = () => {
        const newErrors = { ...errors };

        if (currentStep === 0) {
            if (!registroData.nombre || registroData.nombre.trim() === "") {
                newErrors.nombre = "*Nombre es obligatorio.";
            }

            if (!registroData.apellido || registroData.apellido.trim() === "") {
                newErrors.apellido = "*Apellido es obligatorio.";
            }

            if (!registroData.direccion || registroData.direccion.trim() === "") {
                newErrors.direccion = "*Dirección obligatoria.";
            }
            if (!registroData.telefono || registroData.telefono.trim() === "") {
                newErrors.telefono = "*Teléfono o celular obligatorio.";
            }
            if (!registroData.email || registroData.email.trim() === "") {
                newErrors.email = "*Email obligatorio.";
            }
        } else if (currentStep === 1) {
            if (!registroData.password || registroData.password.trim() === "") {
                newErrors.password = "*Contraseña obligatoria.";
            }
            if (!registroData.rePassword || registroData.rePassword.trim() === "") {
                newErrors.rePassword = "*Contraseña obligatoria.";
            }
            if (!registroData.razon_social || registroData.razon_social.trim() === "") {
                newErrors.razon_social = "*Razón social obligatoria.";
            }

            // Validar CUIT
            if (!registroData.cuit || registroData.cuit.length !== 11) {
                newErrors.cuit = "*El CUIT debe contener exactamente 11 dígitos.";
            }
        }

        // Si hay errores, mostrarlos
        if (Object.values(newErrors).some((error) => error !== undefined && error !== null)) {
            setErrors(newErrors);
            return;
        }

        // Sin errores, avanzar al siguiente paso
        setCurrentStep((prev) => prev + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const renderSteps = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div>
                        <h4>Datos Personales</h4>
                        <InputField label="Nombre"
                            name="nombre"
                            value={registroData.nombre}
                            type="text"
                            onChange={handleRegistroChange}
                            error={errors.nombre}
                            placeholder="Ingrese nombre" />

                        <InputField label="Apellido"
                            name="apellido"
                            value={registroData.apellido}
                            type="text"
                            onChange={handleRegistroChange}
                            error={errors.apellido}
                            placeholder="Ingrese apellido" />

                        <InputField label="Email"
                            name="email"
                            value={registroData.email}
                            type="email"
                            onChange={handleRegistroChange}
                            error={errors.email}
                            placeholder="Ingrese email" />

                        <InputField label="Dirección"
                            name="direccion"
                            value={registroData.direccion}
                            type="text"
                            onChange={handleRegistroChange}
                            error={errors.direccion}
                            placeholder="Ingrese dirección" />

                        <InputField label="Teléfono"
                            name="telefono"
                            value={registroData.telefono}
                            type="number"
                            onChange={handleRegistroChange}
                            error={errors.telefono}
                            placeholder="Ingrese teléfono"
                            onKeyDown={(e) => {
                                if (e.key === "e" || e.key === "E" || e.key === "-" || e.key === "+" || e.key === ".") {
                                    e.preventDefault();
                                }
                            }}
                            inputMode="numeric" />

                    </div>
                );
            case 1:
                return (
                    <div>
                        <h4>Datos personales y de la sesión</h4>
                        <InputField label="Contraseña"
                            name="password"
                            value={registroData.password}
                            type="password"
                            onChange={handleRegistroChange}
                            error={errors.password}
                            placeholder="Ingrese contraseña" />

                        <InputField label="Verifique Contraseña"
                            name="rePassword"
                            value={registroData.rePassword}
                            type="password"
                            onChange={handleRegistroChange}
                            error={errors.rePassword}
                            placeholder="Vuelva a ingresar contraseña" />
                 
                        <InputField label="CUIT"
                            name="cuit"
                            value={registroData.cuit}
                            type="number"
                            onChange={handleCuitChange}
                            error={errors.cuit}
                            placeholder="Ingrese CUIT"
                            onKeyDown={(e) => {
                                if (e.key === "e" || e.key === "E" || e.key === "-" || e.key === "+" || e.key === ".") {
                                    e.preventDefault();
                                }
                            }}
                            inputMode="numeric"
                            min="0"
                            maxLength="11"
                        />

                        <InputField 
                            label="Razón Social"
                            name="razon_social"
                            value={registroData.razon_social}
                            type="text"
                            onChange={handleRegistroChange}
                            error={errors.razon_social}
                            placeholder="Ingrese razón social" />
                    </div>
                );
            default:
                return (
                    <div>
                        <h4>{registroData.misComercios == 0 && "Datos del Comercio"}</h4>
                        <TradeCodes
                            codigos={registroData.misComercios}
                            handleEliminarComercio={handleEliminarComercio}
                            showComercioForm={showComercioForm}
                            setShowComercioForm={setShowComercioForm}
                            nuevoComercio={nuevoComercio}
                            handleNuevoComercioChange={handleNuevoComercioChange}
                            handleRegistrarComercio={handleRegistrarComercio}
                            setNuevoComercio={setNuevoComercio}
                        />
                    </div>
                )
        }

    }

    return (
        <>
            <div>
                {/* Barra de progreso */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                            key={index}
                            className="d-flex flex-column align-items-center"
                            style={{ flex: 1 }}
                        >
                            <div
                                className={`rounded-circle d-flex justify-content-center align-items-center ${currentStep === index
                                    ? "bg-primary text-white shadow"
                                    : "bg-secondary text-light"
                                    }`}
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease-in-out",
                                }}
                            >
                                {index + 1}
                            </div>
                            <small
                                className={`mt-2 ${currentStep === index ? "text-primary fw-bold" : "text-secondary"
                                    }`}
                            >
                                Paso {index + 1}
                            </small>
                        </div>
                    ))}
                </div>

                {renderSteps()}
                {/* Botones de Navegación */}
                < div className="mt-3 mb-3 d-flex justify-content-between align-items-center" >
                    <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4 py-2"
                        onClick={handlePreviousStep}
                        disabled={currentStep === 0}
                    >
                        Atrás
                    </button>

                    {currentStep < totalSteps - 1 && (
                        <button
                            type="button"
                            className="btn btn-success rounded-pill px-4 py-2 ms-auto"
                            onClick={handleNextStep}
                        >
                            Siguiente
                        </button>
                    )}
                </div >
            </div>
        </>
    );
};

export default RegisterFields;