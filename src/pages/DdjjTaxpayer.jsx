import axios from 'axios';
import React, { useState } from 'react'
import { useParams } from 'react-router-dom';
import ErrorResponse from '../components/ErrorResponse';
import { useAuth } from '../context/AuthProvider';
import { handleError } from '../helpers/hooks/handleError';

const DdjjTaxpayer = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { id_contribuyente, id_comercio, cod_comercio } = useParams();
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => currentYear - i);
    const { logout } = useAuth();

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [tableData, setTableData] = useState([]); // Estado para datos de la tabla
    const [tableError, setTableError] = useState(null); // Estado para errores

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];

    const handleButtonClick = async () => {
        let _url = `${URL}/api/ddjj/${id_contribuyente}/${id_comercio}/${selectedYear}`;
        if (selectedMonth) {
            _url += `/${selectedMonth}`;
        }
        try {
            const response = await axios.get(_url, { withCredentials: true });
            if (response.status === 200) {
                const responseData = response.data.response;
                if (responseData.length > 0) {
                    setTableData(responseData);
                    setTableError(null);
                } else {
                    setTableData([]);
                    setTableError("No hay declaraciones juradas para los criterios seleccionados.");
                }
            }
        } catch (error) {
            setTableData([]);
            handleError(error, {
                on401: (message) => {
                    setTableError(message);
                    setTimeout(() => logout(), 3000);
                },
                on404: (message) => setTableError(message), // Puedes pasar cualquier función específica
                onOtherServerError: (message) => setTableError(message),
                onConnectionError: (message) => setTableError(message),
            });
        }
    };

    return (
        <div className="container mt-4 text-center">
            <h1>DDJJs del comercio n° {cod_comercio}</h1>
            <div className="card mx-auto" style={{ maxWidth: "600px" }}>
                <div className="card-body">
                    <form className="row g-3 justify-content-center">

                        <div className="col-12 col-md-6">
                            <label htmlFor="anio" className="form-label">
                                Año:
                            </label>
                            <select
                                id="anio"
                                className="form-select text-center"
                                value={selectedYear}
                                onChange={handleYearChange}
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 col-md-6">
                            <label htmlFor="mes" className="form-label">
                                Seleccione Mes:
                            </label>
                            <select
                                id="mes"
                                className="form-select text-center"
                                value={selectedMonth}
                                onChange={handleMonthChange}
                            >
                                <option value="">Ver todas</option>
                                {meses.map((mes, index) => (
                                    <option key={index} value={index + 1}>
                                        {mes}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 d-flex justify-content-center">
                            <button
                                type="button"
                                className="btn btn-primary w-50"
                                onClick={handleButtonClick}
                            >
                                Ver DDJJs
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-4 mb-4">
                {tableError ? (
                    <ErrorResponse message={tableError} />
                ) :
                    tableData.length > 0 && (
                        <div className="card shadow-sm">
                            <div className="card-header bg-primary text-white text-center">
                                <h5 className="mb-0">Resultados de Declaraciones Juradas</h5>
                            </div>
                            <div className="card-body">

                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered text-center">
                                        <thead className="thead-dark">
                                            <tr>
                                                <th scope="col">Fecha</th>
                                                <th scope="col">Cuit</th>
                                                <th scope="col">Monto</th>
                                                <th scope="col">Tasa Calculada</th>
                                                <th scope="col">Descripción</th>
                                                <th scope="col">En Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData?.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{new Date(item.fecha).toLocaleDateString()}</td>
                                                    <td>{item.cuit}</td>
                                                    <td>${item.monto.toLocaleString()}</td>
                                                    <td>${item.tasa_calculada}</td>
                                                    <td>
                                                        {item.descripcion ? (
                                                            item.descripcion
                                                        ) : (
                                                            <span className="bg-warning px-1 rounded">
                                                                Sin especificar
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {item.cargada_en_tiempo ? (
                                                            <i className="bi bi-check-circle text-success"> Sí</i>
                                                        ) : (
                                                            <i className="bi bi-x-circle text-danger"> No</i>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card-footer text-muted text-center">
                                Total resultados: {tableData.length}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    )
}

export default DdjjTaxpayer