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
    // Condición para mostrar el formulario si no hay comercios
    const mostrarFormulario = codigos.length === 0 || showComercioForm;

    return (
        <div>

            {/* Mostrar lista de comercios si hay */}
            {codigos.length > 0 && (
                <div>
                    <h3>Lista de Comercios</h3>
                    <ul className="list-group mt-3">
                        {codigos.map((comercio) => (
                            <li key={comercio.codigo} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Nombre:</strong> {comercio.nombre} <br />
                                    <strong>CUIT:</strong> {comercio.cuit} <br />
                                    <strong>Dirección:</strong> {comercio.direccion} <br />
                                    <strong>Código:</strong> {comercio.codigo}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleEliminarComercio(comercio.codigo)}
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {/* Mostrar el formulario si no hay comercios o si se está editando uno nuevo */}
            {mostrarFormulario && (
                <div className="mt-3">                   
                    <div className="mb-3">
                        <label htmlFor="codigo" className="form-label">Código de Comercio</label>
                        <input
                            type="number"
                            id="codigo"
                            name="codigo"
                            className="form-control"
                            value={nuevoComercio.codigo}
                            onChange={handleNuevoComercioChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="cuit" className="form-label">Cuit</label>
                        <input
                            type="number"
                            id="cuit"
                            name="cuit"
                            className="form-control"
                            value={nuevoComercio.cuit}
                            onChange={handleNuevoComercioChange}
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
                            value={nuevoComercio.direccion}
                            onChange={handleNuevoComercioChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre del Comercio</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            className="form-control"
                            value={nuevoComercio.nombre}
                            onChange={handleNuevoComercioChange}
                            required
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleRegistrarComercio}
                    >
                        Registrar Comercio
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => setShowComercioForm(false)}
                    >
                        Cancelar
                    </button>
                </div>
            )}

           
        </div>
    );
};

export default TradeCodes;