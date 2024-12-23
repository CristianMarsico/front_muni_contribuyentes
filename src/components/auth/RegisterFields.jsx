import React, { useState } from "react";
import CuitField from "./CuitField";
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
        rePassword : null,
        email: null,
        direccion: null,
        telefono: null,
        razon_social: null,
        cuit: {
            prefijoCuit: null,
            numeroCuit: null,
            verificadorCuit: null,
        },
    });

    // Validación y actualización de datos personales
    const handleRegistroChange = (e) => {
        const { name, value } = e.target;
        setRegistroData({ ...registroData, [name]: value });

        // Función para manejar los errores
        const validateField = (name, value) => {
            switch (name) {
                case "nombre":
                    return value.trim() === "" ? "*Nombre es obligatorio" : null;
                case "apellido":
                    return value.trim() === "" ? "*Apellido es obligatorio" : null;
                case "email":
                    return value.trim() === "" ? "*Email obligatorio" : null;
                case "direccion":
                    return value.trim() === "" ? "*Dirección obligatoria" : null;
                case "telefono":
                    return value.trim() === "" ? "*Teléfono o celular obligatorio" : null;
                case "razon_social":
                    return value.trim() === "" ? "*Razón social obligatoria" : null;
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

        setErrors({
            ...errors,
            [name]: errorMessage,
        });
    };

    // Validación y actualización de CUIT
    const handleCuitChange = (e) => {
        const { name, value } = e.target;

        // Actualizar valores del CUIT
        setRegistroData({
            ...registroData,
            cuit: {
                ...registroData.cuit,
                [name]: value,
            },
        });

        // Validar cada parte del CUIT
        const cuitErrors = { ...errors.cuit };
        if (name === "prefijoCuit") {
            cuitErrors.prefijoCuit = value.length === 2 ? null : "Sólo 2 dígitos";
        } else if (name === "numeroCuit") {
            cuitErrors.numeroCuit =
                value.length >= 8 && value.length <= 9 ? null : "Entre 8 o 9 dígitos";
        } else {
            cuitErrors.verificadorCuit =
                value.length === 1 ? null : "Sólo 1 dígito";
        }

        setErrors({
            ...errors,
            cuit: cuitErrors,
        });
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
            setError("Por favor completa todos los campos del comercio.");
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
        const newErrors = { ...errors, cuit: { ...errors.cuit } };

        if (currentStep === 0) {
            if (!registroData.nombre || registroData.nombre.trim() === "") {
                newErrors.nombre = "*Nombre es obligatorio";
            }

            if (!registroData.apellido || registroData.apellido.trim() === "") {
                newErrors.apellido = "*Apellido es obligatorio";
            }

            if (!registroData.direccion || registroData.direccion.trim() === "") {
                newErrors.direccion = "*Dirección obligatoria";
            }
            if (!registroData.telefono || registroData.telefono.trim() === "") {
                newErrors.telefono = "*Teléfono o celular obligatorio";
            }
            if (!registroData.email || registroData.email.trim() === "") {
                newErrors.email = "*Email obligatorio";
            }
        } else if (currentStep === 1) {
            if (!registroData.password || registroData.password.trim() === "") {
                newErrors.password = "*Contraseña obligatoria";
            }
            if (!registroData.rePassword || registroData.rePassword.trim() === "") {
                newErrors.rePassword = "*Contraseña obligatoria";
            }
            if (!registroData.razon_social || registroData.razon_social.trim() === "") {
                newErrors.razon_social = "*Razón social obligatoria";
            }

            // Validar CUIT
            if (!registroData.cuit.prefijoCuit || registroData.cuit.prefijoCuit.length !== 2) {
                newErrors.cuit.prefijoCuit = "Sólo 2 dígitos";
            }
            if (!registroData.cuit.numeroCuit || registroData.cuit.numeroCuit.length < 8 || registroData.cuit.numeroCuit.length > 9) {
                newErrors.cuit.numeroCuit = "Entre 8 o 9 dígitos";
            }
            if (!registroData.cuit.verificadorCuit || registroData.cuit.verificadorCuit.length !== 1) {
                newErrors.cuit.verificadorCuit = "Sólo 1 dígito";
            }
        }
        // Si hay errores, mostrarlos
        if (
            newErrors.nombre ||
            newErrors.apellido ||
            newErrors.password ||
            newErrors.rePassword ||
            newErrors.email ||
            newErrors.direccion ||
            newErrors.telefono ||
            newErrors.razon_social ||
            newErrors.cuit.prefijoCuit ||
            newErrors.cuit.numeroCuit ||
            newErrors.cuit.verificadorCuit
        ) {
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
                            placeholder="Ingrese teléfono" />

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

                        <CuitField
                            cuit={registroData.cuit}
                            errors={errors.cuit}
                            onChange={handleCuitChange} />

                        <InputField label="Razón Social"
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


                    {
                        currentStep < totalSteps - 1 && (
                            <button
                                type="button"
                                className="btn btn-success rounded-pill px-4 py-2 ms-auto"
                                onClick={handleNextStep}
                            >
                                Siguiente
                            </button>
                        )
                    }
                </div >
            </div>

        </>
    );
};

export default RegisterFields;