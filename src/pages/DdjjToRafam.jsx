import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import useFetch from '../helpers/hooks/useFetch';
import Loading from '../components/Loading';
import ErrorResponse from '../components/ErrorResponse';
import ConfirmModal from '../components/modalsComponents/ConfirmModal';
import SuccessModal from '../components/modalsComponents/SuccessModal';
import ErrorNotification from '../components/ErrorNotification';
import axios from 'axios';
import { handleError } from '../helpers/hooks/handleError';
import { useAuth } from '../context/AuthProvider';
import FormattedNumber from '../helpers/hooks/FormattedNumber';
import FormRectificar from './FormRectificar';
import ExportExcelComponents from '../components/ExportExcelComponents';
import FiltersRafam from '../components/FiltersRafam';
import CheckboxRafam from '../components/CheckboxRafam';
import CheckboxRectificar from '../components/CheckboxRectificar';

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
    
    // Estados para rectificar una ddjj
    const [showModalRectificar, setShowModalRectificar] = useState(false);
    const [selectedRectificar, setSelectedRectificar] = useState(null);
    const [editedRectificar, setEditedRectificar] = useState({});
    const [errorsRectificar, setErrorsRectificar] = useState({});

     // Estados para los filtros
    const [buscarCuit, setBuscarCuit] = useState('');
    const [buscarCodComercio, setBuscarCodComercio] = useState('');
    const [buscarAnio, setBuscarAnio] = useState('');
    const [buscarMes, setBuscarMes] = useState('');

     // Desplegable para las rectificaciones
    const [expandedRows, setExpandedRows] = useState({});

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

        socket.on('comercio-editado', (comercioEditado) => {
            setDdjj((prev) => [...prev, comercioEditado]);
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

        socket.on("addRectificacion", (newRectificacion) => {
            const rectificada = newRectificacion.rectificada;
            
            if (!rectificada || !rectificada.id_comercio || !rectificada.id_contribuyente || !rectificada.fecha) {
                return;
            }

            setDdjj((prev) =>
                prev.map((item) => {
                    if (
                        item.id_comercio === rectificada.id_comercio &&
                        item.id_contribuyente === rectificada.id_contribuyente &&
                        new Date(item.fecha).toISOString() === new Date(rectificada.fecha).toISOString()
                    ) {
                        return {
                            ...item,
                            rectificaciones: [...item.rectificaciones, rectificada],
                        };
                    }
                    return item;
                })
                );
                refetch(); // Para verificar el estado después de la actualización

        });
        // socket.on('rectificada', (rectificada) => {
        //     if (rectificada && rectificada.id_taxpayer && rectificada.id_trade) {
        //         // Actualizar solo si los datos recibidos son válidos
        //         setDdjj((prev) =>
        //             prev.map((item) =>
        //                 item.id_contribuyente === rectificada.id_taxpayer &&
        //                 item.id_comercio === rectificada.id_trade &&
        //                 item.fecha === rectificada.id_date
        //             )
        //         );
        //         refetch();
        //     }
        // });

        return () => socket.disconnect();
    }, [URL, refetch]);

    const toggleExpand = (id) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Arreglo que almacena objetos
    //Guarda todos los nombres de los meses y el value representa el numero de mes.
    const mesesSelect = [
        { value: 1, label: "Enero" },
        { value: 2, label: "Febrero" },
        { value: 3, label: "Marzo" },
        { value: 4, label: "Abril" },
        { value: 5, label: "Mayo" },
        { value: 6, label: "Junio" },
        { value: 7, label: "Julio" },
        { value: 8, label: "Agosto" },
        { value: 9, label: "Septiembre" },
        { value: 10, label: "Octubre" },
        { value: 11, label: "Noviembre" },
        { value: 12, label: "Diciembre" }
    ];

    // Función js para los filtros de busqueda.
    const filtros = ddjj.filter((c) => {
        if (!c?.cuit || !c?.cod_comercio || !c?.fecha) return false;

        const cuit = c?.cuit.toString().includes(buscarCuit);
        const codigoComercio = c?.cod_comercio.toString().includes(buscarCodComercio);

        const fecha = new Date(c?.fecha);
        const fechaDeclarada = new Date(fecha);
        fechaDeclarada.setMonth(fechaDeclarada.getMonth() - 1); // desfase de un mes

        const mes = fechaDeclarada.getMonth(); // 0 = Enero
        const anio = fechaDeclarada.getFullYear();

        const filtrarAnio = buscarAnio ? anio.toString() === buscarAnio : true;
        const filtrarMes = buscarMes ? mes === (parseInt(buscarMes) - 1) : true;

        return cuit && codigoComercio && filtrarAnio && filtrarMes;
    });

    // Mostrar modal de confirmación
    const handleShowModal = (message, onConfirm) => {
        setModalConfig({ isVisible: true, message, onConfirm });
    };

    const closeModal = () => {
        setModalConfig({ isVisible: false, message: "", onConfirm: null });
        setSelectedCheckbox(null);
    };

    // Manejar la edición de una DDJJ
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
        if (!editedRectificar?.monto || editedRectificar?.monto.trim() === "") {
            errors.monto = "*El monto es obligatorio.";
        } else if (!decimalRegex.test(editedRectificar.monto)) {
            errors.monto = "*El monto debe ser un número válido (máx. 2 decimales).";
        } else if (parseFloat(editedRectificar.monto) <= 0) {
            errors.monto = "*El monto debe ser mayor a cero.";
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

    // Enviar datos de ddjj a RECTIFICAR
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

    return (
        <>
            {/* Sección de filtros */}
            <FiltersRafam 
                buscarCodComercio={buscarCodComercio}
                setBuscarCodComercio={setBuscarCodComercio}
                buscarCuit={buscarCuit}
                setBuscarCuit={setBuscarCuit}
                buscarMes={buscarMes}
                setBuscarMes={setBuscarMes}
                mesesSelect={mesesSelect}
                buscarAnio={buscarAnio}
                setBuscarAnio={setBuscarAnio}
            />            

            {/* Sección de botón descargar Excel */}
            <ExportExcelComponents
                ddjj={ddjj} error={error} setErrorMessage={setErrorMessage}
            />

            {/* Sección tabla */}
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
                                                filtros?.map((ddjj, index) => {
                                                    const partesDescripcion = ddjj?.descripcion_ddjj?.split('.') || [];

                                                    return (
                                                        <React.Fragment key={index}>
                                                            <tr>
                                                                <th>{index + 1}</th>
                                                                <td>{ddjj?.cuit}</td>
                                                                <td>{ddjj?.cod_comercio}</td>
                                                                <td>{ddjj?.nombre_comercio}</td>
                                                                <td>$ <FormattedNumber value={ddjj?.monto_ddjj} /></td>
                                                                <td>$ <FormattedNumber value={ddjj?.tasa_calculada} /></td>
                                                                <td>{new Date(ddjj?.fecha).toLocaleDateString()}</td>
                                                                <td>
                                                                    {ddjj?.cargada_en_tiempo ? (
                                                                        <>{partesDescripcion[0]}</>
                                                                    ) : ddjj?.rectificada ? (
                                                                        <>
                                                                            <i className="bi bi-check-circle text-success"></i> {partesDescripcion[0]}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="bi bi-exclamation-triangle text-warning"></i> {partesDescripcion[0]}
                                                                        </>
                                                                    )}
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
                                                                    <CheckboxRafam
                                                                        ddjj={ddjj}
                                                                        selectedCheckbox={selectedCheckbox}
                                                                        setSelectedCheckbox={setSelectedCheckbox}
                                                                        setDdjj={setDdjj}
                                                                        refetch={refetch}
                                                                        handleShowModal={handleShowModal}
                                                                        setMsjModalExito={setMsjModalExito}
                                                                        setShowModal={setShowModal}                                                                       
                                                                        setErrorMessage={setErrorMessage}
                                                                        logout={logout}
                                                                        URL={URL}
                                                                    />                                                                    
                                                                </td>
                                                            </tr>

                                                            {/* Si no está rectificada, agregamos una fila debajo */}
                                                            {ddjj.rectificaciones?.length > 0 && (
                                                                <>
                                                                    <tr>
                                                                        <td colSpan="11" className="text-center position-relative py-2">
                                                                            <div className="fw-bold btn btn-sm btn-outline-primary" onClick={() => toggleExpand(index)}>
                                                                                {expandedRows[index]
                                                                                    ? 'Ocultar'
                                                                                    : `Ver rectificaciones, total: ${ddjj.rectificaciones.length}`}
                                                                            </div>
                                                                        </td>
                                                                    </tr>


                                                                    {expandedRows[index] &&
                                                                    ddjj.rectificaciones.map((d, index) => {
                                                                        const partesDescripcion = d.descripcion?.split('.'); // asegurar que esto esté adentro

                                                                        return (
                                                                            <tr key={d.id_rectificacion} className="bg-white border-top border-secondary-subtle">
                                                                                <td colSpan="11" >
                                                                                    <div className="d-flex justify-content-between align-items-center px-3 py-2 text-secondary small" style={{ fontStyle: 'italic', background: "#FFAE69" }}>
                                                                                        <span><strong>Rectificativa n° </strong> {index +1} </span>
                                                                                        <span><strong>Monto rectificado:</strong> <FormattedNumber value={d.monto} /></span>
                                                                                        <span><strong>Tasa a abonar:</strong> <FormattedNumber value={d?.tasa} /></span>
                                                                                        <span><strong>Rectificado el:</strong> {partesDescripcion?.[1]}</span>
                                                                                        <span>
                                                                                            <strong>Procesada : </strong>
                                                                                            <CheckboxRectificar
                                                                                                ddjj={d}
                                                                                                selectedCheckbox={selectedCheckbox}
                                                                                                setSelectedCheckbox={setSelectedCheckbox}
                                                                                                setDdjj={setDdjj}
                                                                                                refetch={refetch}
                                                                                                handleShowModal={handleShowModal}
                                                                                                setMsjModalExito={setMsjModalExito}
                                                                                                setShowModal={setShowModal}
                                                                                                setErrorMessage={setErrorMessage}
                                                                                                logout={logout}
                                                                                                URL={URL}
                                                                                            />
                                                                                        </span>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })
                                                                }
                                                                    
                                                                </>
                                                            )}

                                                        </React.Fragment>
                                                    );
                                                })
                                            )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección formulario rectificar */}
            {showModalRectificar && (
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
            )}

            {/* Sección carteles para el usuario*/}
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