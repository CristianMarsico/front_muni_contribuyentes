import React from "react";
import InputDecimal from "../components/auth/InputDecimal";
import DiscountDetalis from "../components/DiscountDetalis";
import FormattedNumber from "../helpers/hooks/FormattedNumber";
import useFetch from "../helpers/hooks/useFetch";

const FormRectificar = ({
    show,
    onClose,
    onConfirm,
    editedData,
    setEditedData,
    errors,
    setErrors,
    meses
}) => {
    // const URL = import.meta.env.VITE_API_URL;
    // const { data } = useFetch(`${URL}/api/configuration`);
    // let res = data?.response[0];   

    if (!show) return null;   
      
    const handleChange = (e) => {       
        const { name, value } = e.target;
        setEditedData((prev) => ({ ...prev, [name]: value }));

        setErrors((prevErrors) => {
            const { [name]: _, ...rest } = prevErrors;
            return rest;
        });
    };

    const fecha = new Date(editedData?.fecha);
    const mesActualIndex = (fecha.getMonth() - 1 + 12) % 12;

    // Cálculos automáticos de tasa
    // let tasa = res?.tasa_actual;
    // let montoMinimo = res?.monto_defecto;
    const montoIngresado = parseFloat(editedData?.monto) || 0;
    
    // const resultadoCalculado = montoIngresado * tasa;

    // const resultadoFinal = resultadoCalculado < montoMinimo
    //     ? montoMinimo
    //     : resultadoCalculado;

    return (
        <div className="modal fade show d-block" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg rounded-4">
                    <div className="modal-header bg-primary text-white rounded-top-4">
                        <h5 className="modal-title">Rectificar Declaración Jurada</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <form>
                            <InputDecimal
                                label="Nuevo monto"
                                name="monto"
                                value={editedData?.monto || ""}
                                type="number"
                                onChange={handleChange}
                                error={errors.monto}
                                placeholder="Ingrese monto"
                            />

                            <div className="mb-4 position-relative">
                                <label className="form-label fw-semibold">Mes Correspondiente</label>
                                <select
                                    name="mes"
                                    value={editedData.mes || ""} // Maneja el estado dinámicamente
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setEditedData((prev) => ({ ...prev, mes: value })); // Actualiza el estado
                                        setErrors((prev) => ({
                                            ...prev,
                                            mes: value ? null : "*Debe seleccionar un mes.", // Valida el cambio
                                        }));
                                    }}
                                    className={`form-select text-center ${errors.mes ? "is-invalid border-danger" : ""}`}
                                >
                                    <option value="">Seleccione un mes</option> {/* Opción predeterminada */}
                                    <option value={editedData.mes || meses[mesActualIndex]}>{meses[mesActualIndex]}</option>
                                </select>
                                {errors.mes && <div className="invalid-feedback">{errors.mes}</div>}
                            </div>

                            {/* Mensaje de resultado */}
                            {montoIngresado > 0 && (
                                <DiscountDetalis montoIngresado={montoIngresado} buen_contribuyente={editedData?.es_buen_contribuyente}/>
                            )}
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