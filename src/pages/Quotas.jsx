import React from 'react'
import useFetch from '../helpers/hooks/useFetch';


const Quotas = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { data } = useFetch(`${URL}/api/expirationDates`)

    const cuotas = data?.response;
    console.log(cuotas)

    const getMonthName = (month, year) => {
        const date = new Date(year, month - 1); // -1 porque los meses en JavaScript son de 0 a 11
        return date.toLocaleString('default', { month: 'short' }); // 'long' devuelve el nombre completo del mes
    };


    return (
        <div className="container mt-3">
            <div className="text-center bg-light p-2 mb-2 border">
                <strong>T. P/SERV A LA ACTIV COMER INDUST PROFES Y SER • PLAZAS A.V. (13)</strong>
            </div>
            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            {cuotas?.map((c, index) => (
                                <th key={index}>
                                    {c.id_vencimiento === 1 && "1° Cuota + 1° Cuota A.V"}
                                    {c.id_vencimiento === 2 && "2° Cuota + 2° Cuota A.V"}
                                    {c.id_vencimiento >= 3 && `${c.id_vencimiento}° Cuota`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {cuotas?.map((c, index) => {
                                console.log(c)
                                const mes = getMonthName(c.mes, c.anio);
                                return (
                                    c.id_vencimiento < 12 ? (
                                        <td key={index}>
                                            {c.dia}-{mes}
                                        </td>
                                    ) : <td key={index}>
                                        {c.dia}-{mes}/{c.anio}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Quotas