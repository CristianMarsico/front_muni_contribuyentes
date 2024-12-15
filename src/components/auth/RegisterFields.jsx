import React, { useState } from "react";
import CuitField from "./CuitField";
import InputField from "./InputField";

import TradeCodes from "./TradeCodes";

const RegisterFields = ({ registroData, setRegistroData }) => {
    const [currentStep, setCurrentStep] = useState(1);
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

        // Validar campo "nombre"
        if (name === "nombre") {
            setErrors({
                ...errors,
                nombre: value.trim() === "" ? "*Nombre es obligatorio" : null,
            });
        }
        if (name === "apellido") {
            setErrors({
                ...errors,
                apellido: value.trim() === "" ? "*Apellido es obligatorio" : null,
            });
        }
        if (name === "password") {
            setErrors({
                ...errors,
                password: value.trim() === "" ? "*Contraseña obligatoria" : null,
            });
        }
        if (name === "email") {
            setErrors({
                ...errors,
                email: value.trim() === "" ? "*Email obligatorio" : null,
            });
        }
        if (name === "direccion") {
            setErrors({
                ...errors,
                direccion: value.trim() === "" ? "*Dirección obligatoria" : null,
            });
        }
        if (name === "telefono") {
            setErrors({
                ...errors,
                telefono: value.trim() === "" ? "*Teléfono o celular obligatorio" : null,
            });
        }

        if (name === "razon_social") {
            setErrors({
                ...errors,
                razon_social: value.trim() === "" ? "*Razón social obligatoria" : null,
            });
        }
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
            setRegistroData({
                ...registroData,
                misComercios: [...registroData.misComercios, nuevoComercio],
            });
            setNuevoComercio({ codigo: "", direccion: "", nombre: "" });
            setShowComercioForm(false);
        } else {
            alert("Por favor completa todos los campos del comercio.");
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

        // Validar "nombre"
        if (!registroData.nombre || registroData.nombre.trim() === "") {
            newErrors.nombre = "*Nombre es obligatorio";
        }

        if (!registroData.apellido || registroData.apellido.trim() === "") {
            newErrors.apellido = "*Apellido es obligatorio";
        }

        if (!registroData.password || registroData.password.trim() === "") {
            newErrors.password = "*Contraseña obligatoria";
        }
        if (!registroData.email || registroData.email.trim() === "") {
            newErrors.email = "*Email obligatorio";
        }

        if (!registroData.direccion || registroData.direccion.trim() === "") {
            newErrors.direccion = "*Dirección obligatoria";
        }
        if (!registroData.telefono || registroData.telefono.trim() === "") {
            newErrors.telefono = "*Teléfono o celular obligatorio";
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

        // Si hay errores, mostrarlos
        if (
            newErrors.nombre ||
            newErrors.apellido ||
            newErrors.password ||
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

    return (
        <div>
            {/* Paso 1: Datos Personales */}
            {currentStep === 1 && (
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

                    <InputField label="Contraseña"
                        name="password"
                        value={registroData.password}
                        type="password"
                        onChange={handleRegistroChange}
                        error={errors.password}
                        placeholder="Ingrese contraseña" />

                    <InputField label="Email"
                        name="email"
                        value={registroData.email}
                        type="email"
                        onChange={handleRegistroChange}
                        error={errors.email}
                        placeholder="Ingrese email" />

                    <CuitField
                        cuit={registroData.cuit}
                        errors={errors.cuit}
                        onChange={handleCuitChange} />

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

                    <InputField label="Razón Social"
                        name="razon_social"
                        value={registroData.razon_social}
                        type="text"
                        onChange={handleRegistroChange}
                        error={errors.razon_social}
                        placeholder="Ingrese razón social" />
                </div>
            )}

            {/* Paso 2: Datos del Comercio */}
            {currentStep === 2 && (
                <div>
                    <h4>Datos del Comercio</h4>
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
            )}

            {/* Botones de Navegación */}
            <div className="mt-3 mb-3 d-flex justify-content-between align-items-center">
                {currentStep > 1 && (
                    <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4 py-2"
                        onClick={handlePreviousStep}
                    >
                        Atrás
                    </button>
                )}

                {currentStep === 1 && (
                    <button
                        type="button"
                        className="btn btn-success rounded-pill px-4 py-2 ms-auto"
                        onClick={handleNextStep}
                    >
                        Siguiente
                    </button>
                )}
            </div>
        </div>
    );
};

export default RegisterFields;