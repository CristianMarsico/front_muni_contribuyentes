import React from 'react'
import FormattedNumber from '../helpers/hooks/FormattedNumber';
import useFetch from '../helpers/hooks/useFetch';

const DiscountDetalis = ({ montoIngresado, buen_contribuyente}) => {

    const URL = import.meta.env.VITE_API_URL;
    const { data } = useFetch(`${URL}/api/configuration`);
    let res = data?.response[0];  

    let tasa = res?.tasa_actual;
    let montoMinimo = res?.monto_defecto;
    // const montoIngresado = parseFloat(editedData?.monto) || 0;

    const resultadoCalculado = montoIngresado * tasa;

    const resultadoFinal = resultadoCalculado < montoMinimo
        ? montoMinimo
        : resultadoCalculado;
  return (
      <div className="alert alert-info text-center">
          {buen_contribuyente ?
              <>
                  <h5>Accede al {tasa * 100}% por buen Contribuyente</h5>
                  <p>
                      Valor de la tasa: $<FormattedNumber value={resultadoFinal} /> y se aplicará el {tasa * 100}% de descuento
                  </p>
                  <strong>Deberá abonar:</strong> $<FormattedNumber value={(resultadoFinal - (resultadoFinal * tasa))} /><br />
              </>
              :
              <>
                  <strong>Deberá abonar:</strong> $<FormattedNumber value={resultadoFinal} /><br />
              </>
          }
      </div>
  )
}

export default DiscountDetalis