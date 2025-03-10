import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from 'socket.io-client';
import { useAuth } from "../context/AuthProvider";
import Loading from "../components/Loading";
import ErrorResponse from "../components/ErrorResponse";
import useFetch from "../helpers/hooks/useFetch";
import { handleError } from "../helpers/hooks/handleError";
import FormattedNumber from '../helpers/hooks/FormattedNumber';

const MyDDJJ = ({ id }) => {
    const URL = import.meta.env.VITE_API_URL;
    const { logout } = useAuth();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => currentYear - i);

    const { data, loading, error, refetch } = useFetch(`${URL}/api/trade/${id}`);

    const [selectedTrade, setSelectedTrade] = useState("");
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [tableData, setTableData] = useState([]); // Estado para datos de la tabla
    const [tableError, setTableError] = useState(null); // Estado para errores

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];

    useEffect(() => {
        if (data?.response?.length > 0) {
            setSelectedTrade(data.response[0].id_comercio);
        }
    }, [data]);

    useEffect(() => {
        const socket = io(URL);
        socket.on('comercio-nuevo', (nuevoComercio) => {
            const id_comercio = nuevoComercio;
            setSelectedTrade(id_comercio); // Actualiza el estado con un valor único
            refetch();
        });

        socket.on('estado-inactivo', (nuevoComercio) => {
            const id_comercio = nuevoComercio;
            setSelectedTrade(id_comercio); // Actualiza el estado con un valor único
            refetch();
        });

        socket.on('comercio-editado', (comercioEditado) => {
            const id_comercio = comercioEditado; 
            setSelectedTrade(id_comercio);
            refetch();
        });

        return () => socket.disconnect();
    }, [URL], refetch);


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
                                className="form-select text-center"
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
                                    data?.response
                                        .filter(c => c.estado) // Filtra solo los comercios con estado true
                                        .map(c => (
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

                        <div className="col-md-4">
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
                                className="btn btn-primary col-4"
                                onClick={handleButtonClick}
                            >
                                Ver DDJJs
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-4">
                {loading ? (
                    <Loading />
                )
                    : tableError ? (
                        <ErrorResponse message={tableError} />
                    ) :
                        tableData?.length > 0 && (
                            <div className="card shadow-sm">
                                <div className="card-header bg-primary text-white text-center">
                                    <h5 className="mb-0">Resultados de Declaraciones Juradas</h5>
                                </div>
                                <div className="card-body">

                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered text-center">
                                            <thead className="thead-dark">
                                                <tr className="text-center align-middle">
                                                    <th scope="col">Cuit</th>
                                                    <th scope="col">Código Comercio (RAFAM)</th>
                                                    <th scope="col">Fecha</th>
                                                    <th scope="col">Monto</th>
                                                    <th scope="col">Tasa Calculada</th>
                                                    <th scope="col">Detalle</th>
                                                    <th scope="col">En Fecha</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData?.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item?.cuit}</td>
                                                        <td>{item?.cod_comercio}</td>
                                                        <td>{new Date(item?.fecha).toLocaleDateString()}</td>
                                                        <td>$ <FormattedNumber value={item?.monto} /></td>
                                                        <td>$ <FormattedNumber value={item?.tasa_calculada} /></td>
                                                        <td>
                                                            <>
                                                                {item?.cargada_en_tiempo ? (
                                                                    // Si está cargada a tiempo, solo muestra la descripción
                                                                    <>{item?.descripcion}</>
                                                                ) : item?.rectificada ? (
                                                                    // Si NO está cargada a tiempo pero ESTÁ rectificada, muestra con otro icono
                                                                    <>
                                                                        <i className="bi bi-check-circle text-success"></i> {item?.descripcion}
                                                                    </>
                                                                ) : (
                                                                    // Si NO está cargada a tiempo y NO está rectificada, muestra el icono de advertencia
                                                                    <>
                                                                        <i className="bi bi-exclamation-triangle text-warning"></i> {item?.descripcion}
                                                                    </>
                                                                )}
                                                            </>
                                                        </td>
                                                        <td>
                                                            {item?.cargada_en_tiempo ? (
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
                                    Total resultados: {tableData?.length}
                                </div>
                            </div>
                        )}
            </div>
        </div>
    );
};

export default MyDDJJ;
