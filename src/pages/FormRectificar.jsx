// components/modalsComponents/RectificarModal.jsx
import React from "react";
import InputDecimal from "../components/auth/InputDecimal";


const FormRectificar = ({show,
    onClose,
    onConfirm,
    editedData,
    setEditedData,
    errors,
    setErrors,
    meses
}) => {
    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prev) => ({ ...prev, [name]: value }));

        setErrors((prevErrors) => {
            const { [name]: _, ...rest } = prevErrors;
            return rest;
        });
    };

    const mesActualIndex = (new Date().getMonth() - 1 + 12) % 12;

    return (
        <div className="modal fade show d-block" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg rounded-4">
                    <div className="modal-header bg-primary text-white rounded-top-4">
                        <h5 className="modal-title">Rectificar Declaración Jurada</h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body p-4">
                        <form>
                            <InputDecimal
                                label="Nuevo monto"
                                name="monto"
                                value={editedData.monto || ""}
                                type="number"
                                onChange={handleChange}
                                error={errors.monto}
                                placeholder="Ingrese monto"
                            />
                            <div className="mb-4 position-relative">
                                <label className="form-label fw-semibold">Mes Correspondiente</label>
                                <select
                                    name="mes"
                                    value={editedData.mes}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setEditedData({ ...editedData, mes: value });

                                        setErrors((prev) => ({
                                            ...prev,
                                            mes: value ? null : "*Debe seleccionar un mes.",
                                        }));
                                    }}
                                    className={`form-select text-center ${errors.mes ? "is-invalid border-danger" : ""}`}
                                >
                                    <option value="">Seleccione el mes correspondiente</option>
                                    {Array.from({ length: mesActualIndex + 1 }, (_, i) => (
                                        <option key={i} value={meses[i]}>
                                            {meses[i]}
                                        </option>
                                    ))}
                                </select>
                                {errors.mes && <div className="invalid-feedback">{errors.mes}</div>}
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        <button className="btn btn-success" onClick={onConfirm}>
                            Confirmar cambios
                        </button>
                        <button className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormRectificar;