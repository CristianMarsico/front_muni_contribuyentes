import React, { useState } from "react";
import TradeCodes from "./TradeCodes";

const RegisterFields = ({ registroData, setRegistroData }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [nuevoComercio, setNuevoComercio] = useState({
        codigo: "",
        cuit: "",
        direccion: "",
        nombre: "",
    });

    const [showComercioForm, setShowComercioForm] = useState(false);

    // Actualización de datos personales
    const handleRegistroChange = (e) => {
        setRegistroData({ ...registroData, [e.target.name]: e.target.value });
    };

    // Actualización del comercio nuevo
    const handleNuevoComercioChange = (e) => {
        setNuevoComercio({ ...nuevoComercio, [e.target.name]: e.target.value });
    };

    // Registrar un nuevo comercio
    const handleRegistrarComercio = () => {
        if (nuevoComercio.codigo && nuevoComercio.cuit && nuevoComercio.direccion && nuevoComercio.nombre) {
            setRegistroData({
                ...registroData,
                misComercios: [...registroData.misComercios, nuevoComercio],
            });
            setNuevoComercio({ codigo: "", cuit: "", direccion: "", nombre: "" });
            setShowComercioForm(false); // Ocultar el formulario después de registrar
        } else {
            alert("Por favor completa todos los campos del comercio.");
        }
    };
    // console.log(registroData.misComercios.length)
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
        if (currentStep === 1) {
            if (!registroData.nombre || !registroData.apellido || !registroData.cuil || !registroData.email) {
                alert("Por favor completa todos los campos obligatorios.");
                return;
            }
        }
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
                    <h2>Datos Personales</h2>
                    <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            className="form-control"
                            value={registroData.nombre}
                            onChange={handleRegistroChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="apellido" className="form-label">Apellido</label>
                        <input
                            type="text"
                            id="apellido"
                            name="apellido"
                            className="form-control"
                            value={registroData.apellido}
                            onChange={handleRegistroChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="cuil" className="form-label">Cuil</label>
                        <input
                            type="number"
                            id="cuil"
                            name="cuil"
                            className="form-control"
                            value={registroData.cuil}
                            onChange={handleRegistroChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-control"
                            value={registroData.password}
                            onChange={handleRegistroChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={registroData.email}
                            onChange={handleRegistroChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="direccion" className="form-label">Dirección</label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            className="form-control"
                            value={registroData.direccion}
                            onChange={handleRegistroChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="telefono" className="form-label">Teléfono</label>
                        <input
                            type="number"
                            id="telefono"
                            name="telefono"
                            className="form-control"
                            value={registroData.telefono}
                            onChange={handleRegistroChange}
                            required
                        />
                    </div>
                </div>
            )}

            {/* Paso 2: Datos del Comercio */}
            {currentStep === 2 && (
                <div>
                    <h2>Datos del Comercio</h2>
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

            {/* Botones de Navegación y Agregar Comercio */}
            <div className="mt-3 mb-3 d-flex justify-content-between align-items-center">
                {/* Botón Atrás */}
                {currentStep > 1 && (
                    <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4 py-2"
                        onClick={handlePreviousStep}
                    >
                        Atrás
                    </button>
                )}

                {/* Botón Siguiente (solo en paso 1) */}
                {currentStep === 1 && (
                    <button
                        type="button"
                        className="btn btn-primary rounded-pill px-4 py-2 ms-auto"
                        onClick={handleNextStep}
                    >
                        Siguiente
                    </button>
                )}

                {/* Botón "Agregar Nuevo Comercio" (solo si hay comercios) */}
                {currentStep === 2 && registroData.misComercios.length > 0 && (
                    <button
                        type="button"
                        className="btn btn-success rounded-pill px-4 py-2"
                        onClick={() => setShowComercioForm(true)}
                    >
                        Agregar Nuevo Comercio
                    </button>
                )}
            </div>


        </div>
    );
};

export default RegisterFields;