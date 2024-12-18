import React from 'react'

const InputField = ({ label, name, type, value, onChange, error, ...rest }) => {
    return (
        <div className="mb-3">
            <label htmlFor={name} className="form-label">{label}</label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className={`form-control ${error ? "is-invalid" : ""}`}               
                {...rest}
            />
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
};

export default InputField