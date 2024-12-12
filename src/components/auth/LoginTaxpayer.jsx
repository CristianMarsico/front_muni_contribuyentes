import React from 'react'
import CuitField from './CuitField';
import InputField from './InputField';

const LoginTaxpayer = ({ loginTaxpayer, handleLoginTaxpayerChange, handleCuitChange, errorTaxpayer }) => {
    return (
        <>
            <div>
                <div>
                    <CuitField
                        cuit={loginTaxpayer.cuit}
                        errors={errorTaxpayer.cuit}
                        onChange={handleCuitChange} />
                    
                    <InputField label="Contraseña"
                        name="password"
                        value={loginTaxpayer.password}
                        type="password"
                        onChange={handleLoginTaxpayerChange}
                        error={errorTaxpayer.password}
                        placeholder="Ingrese contraseña" />                    
                </div>
            </div>
        </>
    );
};

export default LoginTaxpayer