import React from 'react'

const InputDecimal = ({ label, name, type, value, onChange, error, ...rest }) => {  
    // Formatea el número con puntos para miles y coma para decimales
    const formatNumber = (num) => {
        if (!num) return "";

        let [integer, decimal] = num.toString().split('.');

        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Agrega puntos para miles
        return decimal !== undefined ? `${integer},${decimal}` : integer; // Usa coma para los decimales
    };

    // Convierte el número formateado a un valor numérico válido (sin puntos y con punto decimal)
    const cleanNumber = (formatted) => formatted.replace(/\./g, '').replace(',', '.');

    const handleInputChange = (e) => {
        let rawValue = e.target.value;

        if (type === "number") {
            // Permitir solo números y una sola coma para los decimales
            rawValue = rawValue.replace(/[^0-9,]/g, '');

            // Evitar múltiples comas
            if ((rawValue.match(/,/g) || []).length > 1) return;

            // Evitar que empiece con coma
            if (rawValue.startsWith(',')) return;

            // Convertir al formato válido antes de enviarlo
            rawValue = cleanNumber(rawValue);
        }

        onChange({ target: { name, value: rawValue } }); // Mantiene compatibilidad con eventos onChange
    };

    return (
        <div className="mb-3 position-relative">
            <label htmlFor={name} className="form-label">{label}</label>
            <input
                id={name}
                name={name}
                type={type === "number" ? "text" : type} // Cambiar a "text" solo si es number
                value={type === "number" ? formatNumber(value) : value} // Formatear solo si es number
                onChange={handleInputChange}
                className={`form-control ${error ? "is-invalid" : ""}`}
                {...rest}
            />
            {error && <div className="invalid-feedback">{error}</div>}           
        </div>
    );
};


export default InputDecimal