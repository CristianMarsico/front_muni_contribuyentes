import React from 'react'

const CuitField = ({ cuit, errors, onChange }) => {
    return (
        <div className="mb-3">
            <label className="form-label">CUIT</label>
            <div className="d-flex flex-wrap align-items-center gap-2">
                <div>
                    <input
                        type="number"
                        name="prefijoCuit"
                        className={`form-control ${errors.prefijoCuit ? "is-invalid" : ""}`}
                        style={{ width: "90px" }}
                        value={cuit.prefijoCuit}
                        onChange={onChange}
                        placeholder="Prefijo"
                    />
                    {errors.prefijoCuit && (
                        <div className="invalid-feedback">{errors.prefijoCuit}</div>
                    )}
                </div>

                <div>
                    <input
                        type="number"
                        name="numeroCuit"
                        className={`form-control ${errors.numeroCuit ? "is-invalid" : ""}`}
                        style={{ width: "221px" }}
                        value={cuit.numeroCuit}
                        onChange={onChange}
                        placeholder="DNI o Sociedad"
                    />
                    {errors.numeroCuit && (
                        <div className="invalid-feedback">{errors.numeroCuit}</div>
                    )}
                </div>

                <div>
                    <input
                        type="number"
                        name="verificadorCuit"
                        className={`form-control ${errors.verificadorCuit ? "is-invalid" : ""}`}
                        style={{ width: "90px" }}
                        value={cuit.verificadorCuit}
                        onChange={onChange}
                        placeholder="Sufijo"
                    />
                    {errors.verificadorCuit && (
                        <div className="invalid-feedback">{errors.verificadorCuit}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CuitField