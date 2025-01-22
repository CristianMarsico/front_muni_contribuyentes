import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import useFetch from '../helpers/hooks/useFetch';
import Loading from '../components/Loading';
import ErrorResponse from '../components/ErrorResponse';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import ErrorNotification from '../components/ErrorNotification';
import axios from 'axios';
import Filter from '../components/Filter';
import { handleError } from '../helpers/hooks/handleError';
import { useAuth } from '../context/AuthProvider';
import FormattedNumber from '../helpers/hooks/FormattedNumber';
import InputField from '../components/auth/InputField';

const DdjjToRafam = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { data, loading, error, refetch } = useFetch(`${URL}/api/ddjj`);
    const { logout } = useAuth();

    // Estados principales
    const [ddjj, setDdjj] = useState([]);
    const [modalConfig, setModalConfig] = useState({ isVisible: false, message: "", onConfirm: null });
    const [showModal, setShowModal] = useState(false);
    const [msjModalExito, setMsjModalExito] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [selectedCheckbox, setSelectedCheckbox] = useState(null);
    const [showModalRectificar, setShowModalRectificar] = useState(false);
    const [selectedRectificar, setSelectedRectificar] = useState(null);
    const [editedRectificar, setEditedRectificar] = useState({});
    const [errorsRectificar, setErrorsRectificar] = useState({});

    const [buscarCuit, setBuscarCuit] = useState('');
    const [buscarCodComercio, setBuscarCodComercio] = useState('');
    const [buscarAnio, setBuscarAnio] = useState('');
    // Actualizar la lista con los datos de la API
    useEffect(() => {
        if (data?.response) {
            setDdjj(data?.response);
        } else {
            setDdjj([]);
        }
    }, [data]);

    // WebSocket para recibir actualizaciones en tiempo real
    useEffect(() => {
        const socket = io(URL);
        socket.on('nueva-ddjj', (nuevaDdjj) => {
            setDdjj((prev) => [...prev, nuevaDdjj]);
            refetch();
        });

        socket.on('ddjj-newState', (newState) => {
            if (newState && newState.id_taxpayer && newState.id_trade) {
                // Actualizar solo si los datos recibidos son válidos
                setDdjj((prev) =>
                    prev.map((item) =>
                        item.id_contribuyente === newState.id_taxpayer &&
                            item.id_comercio === newState.id_trade &&
                            item.fecha === newState.id_date
                            ? { ...item, cargada_rafam: newState.cargada_rafam }
                            : item
                    )
                );
                refetch();
            }
        });

        socket.on('rectificada', (rectificada) => {
            if (rectificada && rectificada.id_taxpayer && rectificada.id_trade) {
                // Actualizar solo si los datos recibidos son válidos
                setDdjj((prev) =>
                    prev.map((item) =>
                        item.id_contribuyente === rectificada.id_taxpayer &&
                        item.id_comercio === rectificada.id_trade &&
                        item.fecha === rectificada.id_date
                    )
                );
                refetch();
            }
        });

        return () => socket.disconnect();
    }, [URL], refetch);

    const filtros = ddjj.filter((c) => {
        if (!c?.cuit || !c?.cod_comercio || !c?.fecha) return false; // Excluir datos incompletos
        const cuit = c?.cuit.toString().includes(buscarCuit);
        const codigoComercio = c?.cod_comercio.toString().includes(buscarCodComercio);

        const fecha = new Date(c?.fecha);
        const anio = fecha.getFullYear();

        // Filtrar por año solo si buscarAnio tiene valor
        const filtrarAnio = buscarAnio ? anio.toString() === buscarAnio : true;
        return cuit && codigoComercio && filtrarAnio;
    });

    const exportToExcel = () => {
        if (!ddjj || ddjj?.length == 0 || error) {
            setErrorMessage("No hay datos para exportar en EXCEL");
            return;
        }
        // Crea un nuevo libro de Excel (workbook)
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Administradores');

        // Define las columnas de la hoja
        worksheet.columns = [
            { header: '#', key: 'id', width: 5, style: { numFmt: '0' } },
            { header: 'CUIT', key: 'cuit', width: 15, style: { numFmt: '0' } },
            { header: 'N° Comercio', key: 'cod_comercio', width: 15, style: { numFmt: '0' } },
            { header: 'Nombre Comercio / Fantasía', key: 'nombre_comercio', width: 30 },
            { header: 'Monto Declarado', key: 'monto', width: 20, style: { numFmt: '0.00' } },
            { header: 'Tasa a Pagar', key: 'tasa', width: 15, style: { numFmt: '0.00' } },
            { header: 'Fecha', key: 'fecha', width: 10 },
            { header: 'Detalle', key: 'mes_correspondiente', width: 35 },
            { header: 'Cargada en Fecha', key: 'en_tiempo', width: 20 },
            { header: 'Rectificada', key: 'rectificada', width: 15 },
            { header: 'Enviada a RAFAM', key: 'en_rafam', width: 20 },
        ];

        // Agrega los datos fila por fila
        ddjj?.forEach((row, index) => {
            worksheet.addRow({
                id: parseFloat(index + 1),
                cuit: parseFloat(row?.cuit),
                cod_comercio: parseFloat(row?.cod_comercio),
                nombre_comercio: row?.nombre_comercio,
                monto: parseFloat(row?.monto),
                tasa: parseFloat(row?.tasa_calculada) || 'N/A',
                fecha: new Date(row?.fecha).toLocaleDateString(),
                mes_correspondiente: row?.descripcion,
                en_tiempo: row?.cargada_en_tiempo ? 'Sí' : 'No',
                rectificada: row?.rectificada ? 'Rectificada' : 'Sin Rectificar',
                en_rafam: row?.cargada_rafam ? 'Sí' : 'No',
            });
        });

        // Estilo opcional para el encabezado
        worksheet.getRow(1).font = { bold: true };

        // Genera el archivo Excel en un buffer
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            // Guarda el archivo con FileSaver
            saveAs(blob, 'Administradores.xlsx');
        }).catch((err) => {
            setErrorMessage('Error al generar el archivo Excel:', err);
        });
    };

    // Mostrar modal de confirmación
    const handleShowModal = (message, onConfirm) => {
        setModalConfig({ isVisible: true, message, onConfirm });
    };

    const closeModal = () => {
        setModalConfig({ isVisible: false, message: "", onConfirm: null });
        setSelectedCheckbox(null);
    };

    // Enviar DDJJ a RAFAM
    const handleCheckboxChange = async (id_contribuyente, id_comercio, fecha) => {
        try {
            const res = await axios.put(`${URL}/api/ddjj/${id_contribuyente}/${id_comercio}/${fecha}`, null, {
                withCredentials: true,
            });
            if (res?.status === 200) {
                setMsjModalExito(res?.data.message);
                setShowModal(false);
                setTimeout(() => setShowModal(true), 100);
                setDdjj((prev) =>
                    prev.map((item) =>
                        item.id_contribuyente === id_contribuyente &&
                            item.id_comercio === id_comercio &&
                            item.fecha === fecha
                            ? { ...item, cargada_rafam: true }
                            : item
                    )
                );
                refetch();
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
            setSelectedCheckbox(null)
        }
    };

    // Manejar la edición de una DDJJ
    const handleRectificar = (ddjj) => {
        setSelectedRectificar(ddjj);
        setEditedRectificar({ ...ddjj });
        setShowModalRectificar(true);
    };

    const handleRectificarChange = (e) => {
        const { name, value } = e.target;
        setEditedRectificar((prev) => ({ ...prev, [name]: value }));
        setErrorsRectificar((prevErrors) => {
            const { [name]: _, ...remainingErrors } = prevErrors;
            return remainingErrors;
        });
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
                refetch();
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

    // Arreglo de meses
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Obtener el mes actual (0 = Enero, 11 = Diciembre)
    const mesActual = new Date().getMonth();    

    return (
        <>
            {/* Sección de filtros */}
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card shadow-lg rounded-4 border-0">
                            <div className="card-body p-4">
                                <h5 className="card-title text-center text-primary mb-4">Filtros</h5>
                                <Filter search={buscarCodComercio} setSearch={setBuscarCodComercio} name="N° de Comercio" type="number" placeholder="Ingrese cod comercio" />
                                <Filter search={buscarCuit} setSearch={setBuscarCuit} name="CUIT" type="number" placeholder="Ingrese CUIT" />
                                <Filter search={buscarAnio} setSearch={setBuscarAnio} name="Año de DDJJ" type="number" placeholder="Ingrese año que desea buscar" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-center mt-4">
                <button
                    className="btn btn-success rounded-3"
                    onClick={exportToExcel}
                >
                    <i className="bi bi-file-earmark-excel me-2"></i> Descargar EXCEL
                </button>
            </div>
            <div className="container col-12">
                <div className="mt-4">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white text-center">
                            <h5 className="mb-0">Lista de DDJJs para procesar en RAFAM</h5>
                        </div>
                        <div className="row justify-content-center">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered text-center w-100" style={{ textAlign: "center", verticalAlign: "middle" }}>
                                        <thead className="thead-dark">
                                            <tr className="text-center align-middle">
                                                <th scope="col">#</th>
                                                <th scope="col">CUIT</th>
                                                <th scope="col">Código de Comercio (RAFAM)</th>
                                                <th scope="col">Nombre de Comercio / Fantasía</th>
                                                <th scope="col">Monto Declarado</th>
                                                <th scope="col">Tasa a Abonar</th>
                                                <th scope="col">Fecha</th>
                                                <th scope="col">Detalle</th>
                                                <th scope="col">Cargada en Fecha</th>
                                                <th scope="col">Rectificar DDJJ</th>
                                                <th scope="col">Enviada a RAFAM</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="11">
                                                        <div className="d-flex justify-content-center">
                                                            <Loading />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : error || filtros?.length === 0 ? (
                                                <tr>
                                                    <td colSpan="11">
                                                        <div className="text-danger">
                                                            <ErrorResponse
                                                                message={error?.message || 'No hay coincidencias'}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filtros?.map((ddjj, index) => (
                                                    <tr key={index}>
                                                        {
                                                            <>
                                                                <th>{index + 1}</th>
                                                                <td>{ddjj?.cuit}</td>
                                                                <td>{ddjj?.cod_comercio}</td>
                                                                <td>{ddjj?.nombre_comercio}</td>
                                                                <td>$ <FormattedNumber value={ddjj?.monto} /></td>
                                                                <td>$ <FormattedNumber value={ddjj?.tasa_calculada} /></td>
                                                                <td>{new Date(ddjj?.fecha).toLocaleDateString()}</td>
                                                                <td>
                                                                    <>
                                                                        {ddjj?.cargada_en_tiempo ? (
                                                                            // Si está cargada a tiempo, solo muestra la descripción
                                                                            <>{ddjj?.descripcion}</>
                                                                        ) : ddjj?.rectificada ? (
                                                                            // Si NO está cargada a tiempo pero ESTÁ rectificada, muestra con otro icono
                                                                            <>
                                                                                <i className="bi bi-check-circle text-success"></i> {ddjj?.descripcion}
                                                                            </>
                                                                        ) : (
                                                                            // Si NO está cargada a tiempo y NO está rectificada, muestra el icono de advertencia
                                                                            <>
                                                                                <i className="bi bi-exclamation-triangle text-warning"></i> {ddjj?.descripcion}
                                                                            </>
                                                                        )}
                                                                    </>
                                                                </td>
                                                                <td>
                                                                    {ddjj?.cargada_en_tiempo ? (
                                                                        <i className="bi bi-check-circle text-success"> Sí</i>
                                                                    ) : (
                                                                        <i className="bi bi-x-circle text-danger"> No </i>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <i
                                                                        className="bi bi-pencil text-primary ms-2"
                                                                        role="button"
                                                                        onClick={() => handleRectificar(ddjj)}
                                                                    ></i>
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input border-dark"
                                                                        checked={ddjj?.cargada_rafam || selectedCheckbox === `${ddjj?.id_contribuyente}-${ddjj?.id_comercio}-${ddjj?.fecha}`}
                                                                        onChange={(e) =>
                                                                            handleShowModal(
                                                                                `¿Deseas enviar a RAFAM la DDJJ del comercio n° ${ddjj?.cod_comercio}?`,
                                                                                () => handleCheckboxChange(ddjj?.id_contribuyente, ddjj?.id_comercio, ddjj?.fecha)
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            </>
                                                        }
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showModalRectificar && (
                <div className="modal fade show d-block" role="dialog">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg rounded-4">
                            <div className="modal-header bg-primary text-white rounded-top-4">
                                <h5 className="modal-title">Rectificar Declaración Jurada</h5>                                
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowModalRectificar(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-4">
                                <form>
                                    <InputField
                                        label="Nuevo monto"
                                        name="monto"
                                        value={editedRectificar.monto || ""}
                                        type="number"
                                        onChange={handleRectificarChange}
                                        error={errorsRectificar.monto}
                                        placeholder="Ingrese monto"
                                    />

                                    <div className="mb-4 position-relative">
                                        <label className="form-label fw-semibold">Mes Correspondiente</label>
                                        <select
                                            name="mes"
                                            value={editedRectificar.mes}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setEditedRectificar({ ...editedRectificar, mes: value });

                                                // Si selecciona un mes válido, eliminar el error
                                                setErrorsRectificar(prevErrors => ({
                                                    ...prevErrors,
                                                    mes: value ? null : "*Debe seleccionar un mes."
                                                }));
                                            }}
                                            className={`form-select text-center ${errorsRectificar.mes ? "is-invalid border-danger" : ""}`}
                                        >
                                            <option value="">Seleccione el mes actual o posterior</option>
                                            {meses.map((mes, index) => (
                                                <option
                                                    key={index}
                                                    value={mes}
                                                    disabled={index < mesActual} // Desactivar meses anteriores al actual
                                                >
                                                    {mes}
                                                </option>
                                            ))}
                                        </select>
                                        {errorsRectificar?.mes && (
                                            <div className="invalid-feedback">{errorsRectificar?.mes}</div>
                                        )}
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-end gap-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowModalRectificar(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleConfirmChanges}
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalConfig.isVisible && (
                <ConfirmModal
                    msj={modalConfig.message}
                    handleEstadoChange={() => {
                        modalConfig.onConfirm();
                        closeModal();
                    }}
                    setShowConfirmModal={closeModal}
                />
            )}

            <SuccessModal show={showModal} message={msjModalExito} duration={3000} />
            <ErrorNotification message={errorMessage} onClose={() => setErrorMessage(null)} />


        </>
    );
};

export default DdjjToRafam