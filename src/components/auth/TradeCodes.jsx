import React, { useState } from "react";
import InputDecimal from "./InputDecimal";
import InputField from "./InputField";

// Componente TradeCodes que maneja la lista de comercios y la adición/eliminación de nuevos comercios
const TradeCodes = ({
    codigos,
    handleEliminarComercio,
    showComercioForm,
    setShowComercioForm,
    nuevoComercio,
    handleNuevoComercioChange,
    handleRegistrarComercio,
    setNuevoComercio
}) => {    
    // Estado para almacenar los errores de validación
    const [errors, setErrors] = useState({});
    // Función para validar los campos del formulario antes de registrar el comercio
    const validateFields = () => {
        const newErrors = {};
        if (!nuevoComercio.codigo || nuevoComercio.codigo.replace(/\./g, '').replace(',', '.') === "") {
            newErrors.codigo = "*El código del comercio es obligatorio.";
        }
        if (!nuevoComercio.direccion) newErrors.direccion = "*La dirección del comercio es obligatoria.";
        if (!nuevoComercio.nombre) newErrors.nombre = "*El nombre del comercio es obligatorio.";
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0; // Devuelve true si no hay errores
    };
    // Función que maneja el envío del formulario
    const handleSubmit = () => {
        if (validateFields()) {
            handleRegistrarComercio(); // Si no hay errores, registra el comercio
        }
    };
    // Determina si se debe mostrar el formulario de comercio o no
    const mostrarFormulario = codigos?.length === 0 || showComercioForm;

    return (
        <div>
            {/* Lista de comercios */}
            {codigos?.length > 0 && (
                <div>
                    <h5 className="text-success text-center">Lista de Comercios</h5>
                    <div className="list-group mt-3">
                        {codigos.map((comercio, index) => (
                            <div
                                key={index}
                                className="list-group-item shadow-lg p-4 mb-3 bg-light rounded"
                                style={{ borderLeft: "5px solid #28a745" }} // Borde verde al lado izquierdo
                            >
                                <div className="card shadow-lg border-0 rounded-3 mb-3">
                                    <div className="card-body">
                                        <div className="text-center mb-4">
                                            <i className="bi bi-upc-scan text-success fs-3 mb-2"></i>
                                            <p className="text-muted mb-1">
                                                <strong>Código Comercio (RAFAM):</strong>
                                            </p>
                                            <p className="mb-0">{comercio.codigo}</p>
                                        </div>
                                        <hr />
                                        <div className="text-center mb-4">
                                            <i className="bi bi-shop-window text-primary fs-3 mb-2"></i>
                                            <p className="text-muted mb-1">
                                                <strong>Nombre Comercio | Nombre Fantasía:</strong>
                                            </p>
                                            <p className="mb-0">{comercio.nombre}</p>
                                        </div>
                                        <hr />
                                        <div className="text-center">
                                            <i className="bi bi-geo-alt-fill text-danger fs-3 mb-2"></i>
                                            <p className="text-muted mb-1">
                                                <strong>Dirección Comercial:</strong>
                                            </p>
                                            <p className="mb-0">{comercio.direccion}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-grid">
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm d-flex align-items-center justify-content-center px-3 py-2 rounded-3"
                                        onClick={() => handleEliminarComercio(comercio.codigo)}
                                    >
                                        <i className="bi bi-trash me-2"></i> Remover
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Formulario de comercio */}
            {mostrarFormulario && (
                <div className="bg-light p-4 rounded shadow-sm">
                    <h5 className="text-center text-success mb-4">Registrar Nuevo Comercio</h5>
                    <div className="mt-2">

                        <InputDecimal
                            label="Código de Comercio (RAFAM)"
                            name="codigo"
                            value={nuevoComercio.codigo}
                            type="number"
                            onChange={handleNuevoComercioChange}
                            error={errors.codigo}
                            placeholder="Ingrese código de comercio"                           
                        />                       
                        <InputField
                            label="Dirección"
                            name="direccion"
                            value={nuevoComercio.direccion}
                            type="text"
                            onChange={handleNuevoComercioChange}
                            error={errors.direccion}
                            placeholder="Ingrese la dirección comercial"                           
                        />
                        <InputField
                            label="Nombre | Nombre Fantasía"
                            name="nombre"
                            value={nuevoComercio.nombre}
                            type="text"
                            onChange={handleNuevoComercioChange}
                            error={errors.nombre}
                            placeholder="Ingrese el nombre o nombre de fantasía"                            
                        />

                        {/* Botones para registrar o cancelar */}
                        <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 mt-4">
                            <button
                                type="button"
                                className="btn btn-primary w-100 w-sm-auto rounded-3 d-flex align-items-center justify-content-center gap-2 py-2"
                                onClick={handleSubmit} // Llama a handleSubmit cuando se hace click
                            >
                                <i className="bi bi-plus-circle"></i> Agregar
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary w-100 w-sm-auto py-2"
                                onClick={() => setNuevoComercio({ codigo: "", direccion: "", nombre: "" })} // Cierra el formulario cuando se hace click
                            >
                                Limpiar Campos
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Botón para mostrar el formulario de nuevo comercio */}
            {!mostrarFormulario && (
                <div className="d-flex justify-content-center">
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => setShowComercioForm(true)}// Muestra el formulario al hacer click
                    >
                        <i className="bi bi-plus-circle me-2"></i>Agregar Nuevo Comercio
                    </button>
                </div>
            )}
        </div>
    );
};

export default TradeCodes;
