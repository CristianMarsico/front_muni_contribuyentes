import React from 'react'
import InputField from './InputField';

const LoginTaxpayer = ({ loginTaxpayer, handleLoginTaxpayerChange, errorTaxpayer }) => {
    return (
        <>
            <InputField label="CUIT"
                name="cuit"
                value={loginTaxpayer.cuit}
                type="number"
                onChange={handleLoginTaxpayerChange}
                error={errorTaxpayer.cuit}
                placeholder="Ingrese CUIT"
                onKeyDown={(e) => {
                    if (e.key === "e" || e.key === "E" || e.key === "-" || e.key === "+" || e.key === ".") {
                        e.preventDefault();
                    }
                }}
                inputMode="numeric"
                min="0"
                maxLength="11"
                />

            {/* Componente InputField para el campo de la Contraseña */}
            <InputField label="Contraseña"
                name="password"
                value={loginTaxpayer.password}
                type="password"
                onChange={handleLoginTaxpayerChange}
                error={errorTaxpayer.password}
                placeholder="Ingrese contraseña" />
        </>
    );
};
export default LoginTaxpayer