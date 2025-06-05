import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from 'socket.io-client';
import { useAuth } from "../context/AuthProvider";
import Loading from "../components/Loading";
import ErrorResponse from "../components/ErrorResponse";
import useFetch from "../helpers/hooks/useFetch";
import { handleError } from "../helpers/hooks/handleError";
import FormattedNumber from '../helpers/hooks/FormattedNumber';
// import InputDecimal from "../components/auth/InputDecimal";
import ConfirmModal from "../components/modalsComponents/ConfirmModal";
import SuccessModal from "../components/modalsComponents/SuccessModal";
import ErrorNotification from "../components/ErrorNotification";
import FormRectificar from "./FormRectificar";

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

    const [modalConfig, setModalConfig] = useState({ isVisible: false, message: "", onConfirm: null });
    const [showModal, setShowModal] = useState(false);
    const [msjModalExito, setMsjModalExito] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [selectedCheckbox, setSelectedCheckbox] = useState(null);
    const [showModalRectificar, setShowModalRectificar] = useState(false);
    const [selectedRectificar, setSelectedRectificar] = useState(null);
    const [editedRectificar, setEditedRectificar] = useState({});
    const [errorsRectificar, setErrorsRectificar] = useState({});

    // Desplegable para las rectificaciones
    const [expandedRows, setExpandedRows] = useState({});


    useEffect(() => {
        if (!selectedTrade && data?.response?.length > 0) {
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
    }, [URL, refetch]);   

    const toggleExpand = (id) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleRectificar = (ddjj) => {
        setSelectedRectificar(ddjj);
        setEditedRectificar({ ...ddjj });
        setShowModalRectificar(true);
    };

    const handleConfirmChanges = () => {

        // Inicializar un objeto de errores vacío
        let errors = {};

        const decimalRegex = /^\d+(\.\d{1,2})?$/;

        // Validación del monto
        if (editedRectificar.monto.trim() === "") {
            errors.monto = "*El monto es obligatorio.";
        } else if (!decimalRegex.test(editedRectificar.monto)) {
            errors.monto = "*El monto debe ser un número decimal válido con hasta 2 decimales.";
        }

        // Validar mes
        if (!editedRectificar?.mes || editedRectificar.mes.trim() === "") {
            errors.mes = "*Debe seleccionar un mes válido.";
        }

        // Si hay errores, actualizar el estado de errores y evitar enviar
        if (Object.keys(errors).length > 0) {
            setErrorsRectificar(errors);
            return;
        }

        setShowModalRectificar(false);
        handleShowModal(
            `¿Estás seguro de que deseas rectificar la DDJJ del comercio n° ${selectedRectificar.cod_comercio}?`,
            confirmRectificarChanges
        );
    };

    const handleShowModal = (message, onConfirm) => {
        setModalConfig({ isVisible: true, message, onConfirm });
    };

    const closeModal = () => {
        setModalConfig({ isVisible: false, message: "", onConfirm: null });
        setSelectedCheckbox(null);
    };

    const confirmRectificarChanges = async () => {        
        try {
            const res = await axios.put(
                `${URL}/api/rectificar/${selectedRectificar.id_contribuyente}/${selectedRectificar.id_comercio}/${selectedRectificar.fecha}`,
                editedRectificar,
                { withCredentials: true }
            );

            if (res?.status === 200) {                
                setMsjModalExito(res?.data.message);
                setShowModal(false);
                setTimeout(() => setShowModal(true), 100);
                await handleButtonClick();
                // handleButtonClick();
            }
        } catch (error) {
            handleError(error, {
                on401: (message) => {
                    setErrorMessage(message);
                    setTimeout(() => logout(), 3000);
                },
                on404: (message) => setErrorMessage(message), // Puedes pasar cualquier función específica
                onOtherServerError: (message) => setErrorMessage(message),
                onConnectionError: (message) => setErrorMessage(message),
            });
        } finally {
            setShowModalRectificar(false);
        }
    }; 

    const handleComercioChange = (e) => {
        setTableData([])
        setSelectedTrade(e.target.value);
    };

    const handleYearChange = (e) => {
        setTableData([])
        setSelectedYear(e.target.value);
    };

    const handleMonthChange = (e) => {
        setTableData([])
        setSelectedMonth(e.target.value);
    };

    const handleButtonClick = async () => {
        let _url = `${URL}/api/ddjj/${id}/${selectedTrade}/${selectedYear}`;
        if (selectedMonth) {
            _url += `/${selectedMonth}`;
        }
        try {
            const response = await axios.get(_url, { withCredentials: true });
            if (response?.status === 200) {
                const responseData = response?.data.response;               
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
        <>
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
                                        (() => {
                                            const comerciosHabilitados = data.response.filter(c => c.estado);
                                            if (comerciosHabilitados.length === 0) {
                                                return <option>Aún no se ha dado de alta</option>;
                                            }
                                            return comerciosHabilitados.map(c => (
                                                <option key={c.cod_comercio} value={c.id_comercio}>
                                                    {c.nombre_comercio} (N° {c.cod_comercio})
                                                </option>
                                            ));
                                        })()
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
                                                    <th scope="col">Rectificar DDJJ</th>
                                                </tr>
                                            </thead>
                                                <tbody>
                                                    {tableData?.map((item, index) => {
                                                        const ddjj = item; // Asegurarse de que `ddjj` esté definido

                                                        return (
                                                            <React.Fragment key={index}>
                                                                <tr>
                                                                    <td>{ddjj?.cuit}</td>
                                                                    <td>{ddjj?.cod_comercio}</td>
                                                                    <td>{new Date(ddjj?.fecha).toLocaleDateString()}</td>
                                                                    <td>$ <FormattedNumber value={ddjj?.monto_ddjj} /></td>
                                                                    <td>$ <FormattedNumber value={ddjj?.tasa_calculada} /></td>
                                                                    <td>
                                                                        {ddjj?.cargada_en_tiempo ? (
                                                                            <>{ddjj?.descripcion_ddjj}</>
                                                                        ) : ddjj?.rectificada ? (
                                                                            <>
                                                                                <i className="bi bi-check-circle text-success"></i> {ddjj?.descripcion_ddjj}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <i className="bi bi-exclamation-triangle text-warning"></i> {ddjj?.descripcion_ddjj}
                                                                            </>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {ddjj?.cargada_en_tiempo ? (
                                                                            <i className="bi bi-check-circle text-success"> Sí</i>
                                                                        ) : (
                                                                            <i className="bi bi-x-circle text-danger"> No</i>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        <i
                                                                            className="bi bi-pencil text-primary ms-2"
                                                                            role="button"
                                                                            onClick={() => handleRectificar(ddjj)}
                                                                        ></i>
                                                                    </td>
                                                                </tr>

                                                                {ddjj.rectificaciones?.length > 0 && (
                                                                    <>
                                                                        <tr>
                                                                            <td colSpan="11" className="text-center position-relative py-2">
                                                                                <div
                                                                                    className="fw-bold btn btn-sm btn-outline-primary"
                                                                                    onClick={() => toggleExpand(index)}
                                                                                >
                                                                                    {expandedRows[index]
                                                                                        ? 'Ocultar'
                                                                                        : `Ver rectificaciones, total: ${ddjj.rectificaciones.length}`}
                                                                                </div>
                                                                            </td>
                                                                        </tr>

                                                                        {expandedRows[index] &&
                                                                            ddjj.rectificaciones.map((d, i) => {
                                                                                const partesDescripcion = d.descripcion?.split('.');

                                                                                return (
                                                                                    <tr key={d.id_rectificacion} className="bg-white border-top border-secondary-subtle">
                                                                                        <td colSpan="11">
                                                                                            <div
                                                                                                className="d-flex justify-content-between align-items-center px-3 py-2 text-secondary small"
                                                                                                style={{ fontStyle: 'italic', background: "#FFAE69" }}
                                                                                            >
                                                                                                <span><strong>Rectificativa n° </strong> {i + 1}</span>
                                                                                                <span><strong>Monto rectificado:</strong> <FormattedNumber value={d.monto} /></span>
                                                                                                <span><strong>Tasa a abonar:</strong> <FormattedNumber value={d?.tasa} /></span>
                                                                                                <span><strong>Rectificado el:</strong> {partesDescripcion?.[1]}</span>
                                                                                                
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                    </>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
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
        {
        showModalRectificar && (
            <FormRectificar
                show={showModalRectificar}
                onClose={() => setShowModalRectificar(false)}
                onConfirm={handleConfirmChanges}
                editedData={editedRectificar}
                setEditedData={setEditedRectificar}
                errors={errorsRectificar}
                setErrors={setErrorsRectificar}
                meses={meses}
            />
        )
    }

    {
        modalConfig.isVisible && (
            <ConfirmModal
                msj={modalConfig.message}
                handleEstadoChange={() => {
                    modalConfig.onConfirm();
                    closeModal();
                }}
                setShowConfirmModal={closeModal}
            />
        )
    }

            <SuccessModal show={showModal} message={msjModalExito} duration={3000} />
            <ErrorNotification message={errorMessage} onClose={() => setErrorMessage(null)} />
</>
        
    );
};

export default MyDDJJ;
