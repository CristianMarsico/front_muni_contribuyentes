import React, { useState } from "react";

const TradeCodes = ({
    codigos,
    handleEliminarComercio,
    showComercioForm,
    setShowComercioForm,
    nuevoComercio,
    handleNuevoComercioChange,
    handleRegistrarComercio,
}) => {
    const [errors, setErrors] = useState({}); // Manejo de errores

    // Validar campos antes de registrar el comercio
    const validateFields = () => {
        const newErrors = {};
        if (!nuevoComercio.codigo) newErrors.codigo = "El código del comercio es obligatorio";
        if (!nuevoComercio.direccion) newErrors.direccion = "La dirección del comercio es obligatoria";
        if (!nuevoComercio.nombre) newErrors.nombre = "El nombre del comercio es obligatorio";
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0; // Devuelve true si no hay errores
    };

    const handleSubmit = () => {
        if (validateFields()) {
            handleRegistrarComercio(); // Si no hay errores, registra el comercio
        }
    };

    const mostrarFormulario = codigos.length === 0 || showComercioForm;

    return (
        <div>
            {/* Lista de comercios */}
            {codigos.length > 0 && (
                <div>
                    <h5 className="text-success">Lista de Comercios</h5>
                    <div className="list-group mt-3">
                        {codigos.map((comercio) => (
                            <div
                                key={comercio.codigo}
                                className="list-group-item d-flex justify-content-between align-items-center shadow-sm p-3 mb-3 bg-white rounded"
                            >
                                <div>
                                    <p className="mb-1 text-muted">
                                        <strong>Código:</strong> {comercio.codigo}
                                    </p>
                                    <p className="mb-1 text-muted">
                                        <strong>Nombre:</strong> {comercio.nombre}
                                    </p>
                                    <p className="mb-0 text-muted">
                                        <strong>Dirección:</strong> {comercio.direccion}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm px-4 py-2 rounded"
                                    onClick={() => handleEliminarComercio(comercio.codigo)}
                                >
                                    <i className="bi bi-trash"></i> Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Formulario de comercio */}
            {mostrarFormulario && (
                <div className="mt-3">
                    {/* Código */}
                    <div className="mb-3">
                        <label htmlFor="codigo" className="form-label">
                            Código de Comercio
                        </label>
                        <div className="input-group">
                            <input
                                type="number"
                                id="codigo"
                                name="codigo"
                                className={`form-control ${errors.codigo ? "is-invalid" : ""}`}
                                value={nuevoComercio.codigo}
                                onChange={handleNuevoComercioChange}
                                required
                            />                           
                        </div>
                        {errors.codigo && (
                            <div className="form-text text-danger">{errors.codigo}</div>
                        )}
                    </div>

                    {/* Dirección */}
                    <div className="mb-3">
                        <label htmlFor="direccion" className="form-label">
                            Dirección de comercio
                        </label>
                        <div className="input-group">
                            <input
                                type="text"
                                id="direccion"
                                name="direccion"
                                className={`form-control ${errors.direccion ? "is-invalid" : ""}`}
                                value={nuevoComercio.direccion}
                                onChange={handleNuevoComercioChange}
                                required
                            />                           
                        </div>
                        {errors.direccion && (
                            <div className="form-text text-danger">{errors.direccion}</div>
                        )}
                    </div>

                    {/* Nombre */}
                    <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">
                            Nombre del Comercio
                        </label>
                        <div className="input-group">
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                                value={nuevoComercio.nombre}
                                onChange={handleNuevoComercioChange}
                                required
                            />                           
                        </div>
                        {errors.nombre && (
                            <div className="form-text text-danger">{errors.nombre}</div>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="d-flex justify-content-between">
                        <div className="d-flex justify-content-center w-100">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleSubmit}
                            >
                                Registrar Comercio
                            </button>
                        </div>
                        <div className="d-flex justify-content-center w-100">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowComercioForm(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Botón para agregar comercio */}
            {!mostrarFormulario && (
                <div className="mt-3 d-flex justify-content-center">
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => setShowComercioForm(true)}
                    >
                        Agregar Nuevo Comercio
                    </button>
                </div>
            )}
        </div>
    );
};

export default TradeCodes;
