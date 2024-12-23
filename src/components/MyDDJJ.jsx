import React, { useState, useEffect } from "react";
import axios from "axios";
// import { io } from 'socket.io-client';
import useFetch from "../helpers/hooks/useFetch";
import ErrorResponse from "./ErrorResponse";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";

const MyDDJJ = ({ id }) => {
    const URL = import.meta.env.VITE_API_URL;
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => currentYear - i);
    const { data, loading, error } = useFetch(`${URL}/api/trade/${id}`);
    const [selectedTrade, setSelectedTrade] = useState("");
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [tableData, setTableData] = useState([]); // Estado para datos de la tabla
    const [tableError, setTableError] = useState(null); // Estado para errores
    // const [newDDJJ, setNewDDJJ] = useState([]);
    const navigate = useNavigate();
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];

    useEffect(() => {
        if (data?.response?.length > 0) {
            setSelectedTrade(data.response[0].id_comercio);
        }
    }, [data]);

    // useEffect(() => {
    //     const socket = io(URL);
    //     socket.on('nueva-ddjj', (nuevaDDJJ) => {      
    //         setTableData((prevTableData) => {
    //             const nuevaDDJJConDescripcion = {
    //                 ...nuevaDDJJ,
    //                 descripcion: nuevaDDJJ.descripcion || "Sin especificar", // Maneja la descripción nula
    //             };
    //             return [...prevTableData, nuevaDDJJConDescripcion];
    //         });      
    //     });
    //     return () => socket.disconnect();
    // }, [URL]);

    const handleComercioChange = (e) => {
        setSelectedTrade(e.target.value);
    };

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const handleButtonClick = async () => {
        let _url = `${URL}/api/ddjj/${id}/${selectedTrade}/${selectedYear}`;
        if (selectedMonth) {
            _url += `/${selectedMonth}`;
        }
        try {
            const response = await axios.get(_url, {withCredentials: true});
           
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
            if (error.response) {
                if (error.response.status === 401) {
                    setTableError(error.response.data.error);
                    setTimeout(() => {
                        navigate("/");
                    }, 3000);
                }
                else if (error.response.status === 404) {
                    setTableError(error.response.data.error);
                } else {
                    setTableError(error.response.data.error);
                }
                
            } else {
                setTableError("Error de conexión. Verifique su red e intente nuevamente.");
            }
        }
    };

    return (
        <div className="container mt-4">
            <h1>Declaraciones Juradas</h1>
            <div className="card">
                <div className="card-body">
                    <form className="row g-3">
                        <div className="col-md-4">
                            <label htmlFor="comercio" className="form-label">
                                Comercio:
                            </label>
                            <select
                                id="comercio"
                                className="form-select"
                                value={selectedTrade}
                                onChange={handleComercioChange}
                            >
                                {loading ? (
                                    <option>Cargando...</option>
                                ) : error ? (
                                    <option>{error?.message || "Error al cargar los datos"}</option>
                                ) : data?.response?.length === 0 ? (
                                    <option>No hay comercios disponibles</option>
                                ) : (
                                    data?.response.map((c) => (
                                        <option key={c.cod_comercio} value={c.id_comercio}>
                                            {c.nombre_comercio} (N° {c.cod_comercio})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label htmlFor="anio" className="form-label">
                                Año:
                            </label>
                            <select
                                id="anio"
                                className="form-select"
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

                        <div className="col-md-4">
                            <label htmlFor="mes" className="form-label">
                                Seleccione Mes:
                            </label>
                            <select
                                id="mes"
                                className="form-select"
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
                                className="btn btn-primary col-4"
                                onClick={handleButtonClick}
                            >
                                Ver DDJJs
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-4 mb-4">
                {loading ? (
                    <Loading />
                )
                : tableError ? (
                    <ErrorResponse message={tableError}/>                   
                ):
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
                                            <th scope="col">Cuit</th>
                                            <th scope="col">N° Comercio</th>
                                            <th scope="col">Fecha</th>
                                            <th scope="col">Monto</th>
                                            <th scope="col">Tasa Calculada</th>
                                            <th scope="col">Descripción</th>
                                            <th scope="col">En Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData?.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.cuit}</td>
                                                <td>{item.cod_comercio}</td>
                                                <td>{new Date(item.fecha).toLocaleDateString()}</td>
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
    );
};

export default MyDDJJ;
