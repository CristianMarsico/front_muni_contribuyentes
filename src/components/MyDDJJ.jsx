import axios from "axios";
import React, { useState, useEffect } from "react";
import useFetch from "../helpers/hooks/useFetch";

const MyDDJJ = ({ id }) => {
    const URL = import.meta.env.VITE_API_URL;
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => currentYear - i);

    const { data, loading, error } = useFetch(`${URL}/api/trade/${id}`);

    const [selectedComercio, setSelectedComercio] = useState("");
    const [selectedAnio, setSelectedAnio] = useState(currentYear);
    const [selectedMes, setSelectedMes] = useState("");
    const [tableData, setTableData] = useState([]); // Estado para datos de la tabla
    const [tableError, setTableError] = useState(null); // Estado para errores

    const meses = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
    ];

    useEffect(() => {
        if (data?.response?.length > 0) {
            setSelectedComercio(data.response[0].id_comercio);
        }
    }, [data]);

    const handleComercioChange = (e) => {
        setSelectedComercio(e.target.value);
    };

    const handleAnioChange = (e) => {
        setSelectedAnio(e.target.value);
    };

    const handleBimestreChange = (e) => {
        setSelectedMes(e.target.value);
    };

    const handleButtonClick = async () => {
        let _url = `${URL}/api/ddjj/${id}/${selectedComercio}/${selectedAnio}`;
        if (selectedMes) {
            _url += `/${selectedMes}`;
        }
        try {
            const response = await axios.get(_url, {
                withCredentials: true,
            });
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
            setTableError(error.response.data.error);
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
                                value={selectedComercio}
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
                                value={selectedAnio}
                                onChange={handleAnioChange}
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
                                value={selectedMes}
                                onChange={handleBimestreChange}
                            >
                                <option value="">Ver todas</option>
                                {meses.map((mes, index) => (
                                    
                                    <option key={index} value={index+1}>
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
                {tableError && (
                    <div className="alert alert-danger text-center" role="alert">
                        {tableError}
                    </div>
                )}              
                {tableData.length > 0 && (
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white text-center">
                            <h5 className="mb-0">Resultados de Declaraciones Juradas</h5>
                        </div>
                        <div className="card-body">
                           
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th scope="col">ID Contribuyente</th>
                                            <th scope="col">ID Comercio</th>
                                            <th scope="col">Fecha</th>
                                            <th scope="col">Monto</th>
                                            <th scope="col">Descripción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.id_contribuyente}</td>
                                                <td>{item.id_comercio}</td>
                                                <td>{new Date(item.fecha).toLocaleDateString()}</td>
                                                <td>${item.monto.toLocaleString()}</td>
                                                <td>{item.descripcion}</td>
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
