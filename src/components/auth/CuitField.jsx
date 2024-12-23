import React from 'react'

// Definimos el componente CuitField, que recibe como propiedades 'cuit', 'errors' y 'onChange'.
const CuitField = ({ cuit, errors, onChange }) => {
    return (
        <div className="mb-3">
            <label className="form-label">CUIT</label>
            <div className="row g-2">

                {/* Esta columna ocupa 12 en móviles, 4 en pantallas pequeñas y 3 en pantallas grandes. */}
                <div className="col-12 col-sm-4 col-md-3">
                    <input
                        type="number"
                        name="prefijoCuit"
                        className={`form-control ${errors.prefijoCuit ? "is-invalid" : ""}`}
                        value={cuit.prefijoCuit}
                        onChange={onChange}
                        placeholder="Prefijo"
                    />
                    {/* Si hay un error con el prefijo, se muestra el mensaje de error. */}
                    {errors.prefijoCuit && (
                        <div className="invalid-feedback text-center">{errors.prefijoCuit}</div>
                    )}
                </div>
                {/* Esta columna ocupa 12 en móviles, 4 en pantallas pequeñas y 6 en pantallas grandes. */}
                <div className="col-12 col-sm-4 col-md-6">
                    <input
                        type="number"
                        name="numeroCuit"
                        className={`form-control ${errors.numeroCuit ? "is-invalid" : ""}`}
                        value={cuit.numeroCuit}
                        onChange={onChange}
                        placeholder="DNI o Sociedad"
                    />
                    {/* Si hay un error con el numero de cuit, se muestra el mensaje de error. */}
                    {errors.numeroCuit && (
                        <div className="invalid-feedback text-center">{errors.numeroCuit}</div>
                    )}
                </div>

                {/* Esta columna ocupa 12 en móviles, 4 en pantallas pequeñas y 3 en pantallas grandes. */}
                <div className="col-12 col-sm-4 col-md-3">
                    <input
                        type="number"
                        name="verificadorCuit"
                        className={`form-control ${errors.verificadorCuit ? "is-invalid" : ""}`}
                        value={cuit.verificadorCuit}
                        onChange={onChange}
                        placeholder="Sufijo"
                    />
                    {/* Si hay un error con el sufijo, se muestra el mensaje de error. */}
                    {errors.verificadorCuit && (
                        <div className="invalid-feedback text-center">{errors.verificadorCuit}</div>
                    )}
                </div>
            </div>
        </div>
    );

}

export default CuitField