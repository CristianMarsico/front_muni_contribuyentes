import React from 'react'

const FormattedNumber = ({ value }) => {  
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    // Formatear manualmente el número
    const formattedValue = numericValue
        .toFixed(2) // Asegura dos decimales
        .replace('.', ',') // Cambia el punto decimal por coma
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Agrega puntos para los miles

    return formattedValue;
}
export default FormattedNumber