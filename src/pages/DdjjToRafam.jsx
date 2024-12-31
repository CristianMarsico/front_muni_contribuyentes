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

const DdjjToRafam = () => {
    const URL = import.meta.env.VITE_API_URL;

    const { data, loading, error, refetch } = useFetch(`${URL}/api/ddjj`)
    const [ddjj, setDdjj] = useState([]);

    // Manejo de modal de confirmación (antes de enviar pregunta)
    const [modalConfig, setModalConfig] = useState({
        isVisible: false,
        message: '',
        onConfirm: null,
    });

    // Manejo de modal de éxito y sus mensajes
    const [showModal, setShowModal] = useState(false);
    const [msjModalExito, setMsjModalExito] = useState("");

    // Manejo de errores
    const [errorMessage, setErrorMessage] = useState(null);

    // Obtengo los datos seleccionados
    const [selectedCheckbox, setSelectedCheckbox] = useState(null);

    const [buscarCuit, setBuscarCuit] = useState('');
    const [buscarCodComercio, setBuscarCodComercio] = useState('');

    // Actualizar la lista cuando se reciben nuevos datos de la API
    useEffect(() => {
        if (data?.response) {
            setDdjj(data?.response);
        } else {
            setDdjj([]);
        }
    }, [data]);

    useEffect(() => {
        const socket = io(URL);
        socket.on('nueva-ddjj', (nuevaDdjj) => {
            setDdjj((prev) => [...prev, nuevaDdjj]);
            refetch();
        });

        socket.on('ddjj-newState', (newState) => {
            setDdjj((prev) => [...prev, newState]);
            refetch();
        });

        return () => socket.disconnect();
    }, [URL], refetch);

    const filtros = ddjj.filter((c) => {
        if (!c?.cuit || !c?.cod_comercio) return false; // Excluir datos incompletos
        const cuit = c?.cuit.toString().includes(buscarCuit);
        const codigoComercio = c?.cod_comercio.toString().includes(buscarCodComercio);
        return cuit && codigoComercio;
    });

    const exportToExcel = () => {
        if (!data?.response || data.response.length === 0) return;

        // Crea un nuevo libro de Excel (workbook)
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Administradores');

        // Define las columnas de la hoja
        worksheet.columns = [
            { header: '#', key: 'id', width: 5, style: { numFmt: '0' } },
            { header: 'CUIT', key: 'cuit', width: 20, style: { numFmt: '0' } },
            { header: 'N° Comercio', key: 'cod_comercio', width: 20, style: { numFmt: '0' } },
            { header: 'Nombre Comercio', key: 'nombre_comercio', width: 30 },
            { header: 'Monto Declarado', key: 'monto', width: 20, style: { numFmt: '0.00' } },
            { header: 'Tasa a Pagar', key: 'tasa', width: 20, style: { numFmt: '0.00' } },
            { header: 'Fecha', key: 'fecha', width: 20 },
            { header: 'Cargada en Fecha', key: 'en_tiempo', width: 20 },
        ];

        // Agrega los datos fila por fila
        ddjj?.forEach((row, index) => {
            worksheet.addRow({
                id: parseFloat(index + 1),
                cuit: parseFloat(row.cuit),
                cod_comercio: parseFloat(row.cod_comercio),
                nombre_comercio: row.nombre_comercio,
                monto: parseFloat(row.monto),
                tasa: parseFloat(row.tasa_calculada) || 'N/A',
                fecha: row.fecha,
                en_tiempo: row.cargada_en_tiempo ? 'Sí' : 'No',
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
            console.error('Error al generar el archivo Excel:', err);
        });
    };

    const handleShowAddModal = (id_contribuyente, id_comercio, cod_comercio, fecha, isChecked) => {
        if (isChecked) {
            setSelectedCheckbox(`${id_contribuyente}-${id_comercio}-${fecha}`);
            setModalConfig({
                isVisible: true,
                message: `¿Deseas enviar a RAFAM la DDJJ del comercio n° ${cod_comercio} ?`,
                onConfirm: () => handleCheckboxChange(id_contribuyente, id_comercio, fecha), // Función para agregar
            });
        } else {
            setSelectedCheckbox(null); // Limpia el estado si el checkbox se desmarca manualmente
        }
    };

    const handleCheckboxChange = async (id_contribuyente, id_comercio, fecha) => {
        try {
            const res = await axios.put(`${URL}/api/ddjj/${id_contribuyente}/${id_comercio}/${fecha}`, null, {
                withCredentials: true,
            });
            if (res?.status === 200) {
                setMsjModalExito(res?.data.message);
                setShowModal(false);
                setTimeout(() => setShowModal(true), 100);
                setSelectedCheckbox(null);
                refetch();
            }
        } catch (error) {
            if (error?.response) {
                if (error?.response.status === 401) {
                    setErrorMessage(error?.response.data.error);
                    setTimeout(() => {
                        logout();
                    }, 3000);
                } else {
                    setErrorMessage(error?.response.data.error);
                }
            } else {
                setErrorMessage("Error de conexión. Verifique su red e intente nuevamente.");
            }
        } finally {
            setSelectedCheckbox(null)
        }
    };

    // Cierra el modal y desmarca el checkbox seleccionado
    const handleCancelModal = () => {
        setModalConfig({ ...modalConfig, isVisible: false });
        setSelectedCheckbox(null); // Resetea el estado del checkbox seleccionado
    };

    return (
        <>
            {/* Sección de filtros */}
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card shadow-lg rounded-4 border-0">
                            <div className="card-body p-4">
                                <h5 className="card-title text-center text-primary mb-4">Filtros</h5>
                                <Filter search={buscarCodComercio} setSearch={setBuscarCodComercio} name="N° de Comercio" type="number" />
                                <Filter search={buscarCuit} setSearch={setBuscarCuit} name="CUIT" type="number" />
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
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">CUIT</th>
                                                <th scope="col">N° DE COMERCIO</th>
                                                <th scope="col">NOMBRE DE COMERCIO</th>
                                                <th scope="col">MONTO DECLARADO</th>
                                                <th scope="col">TASA A PAGAR</th>
                                                <th scope="col">FECHA</th>
                                                <th scope="col">CARGADA EN FECHA</th>
                                                <th scope="col">MARCAR ENVIADA</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="9">
                                                        <div className="d-flex justify-content-center">
                                                            <Loading />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : error ? (
                                                <tr>
                                                    <td colSpan="9">
                                                        <div className="text-danger">
                                                            <ErrorResponse
                                                                message={error?.message || 'No hay DDJJs'}
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
                                                                <td>$ {ddjj?.monto}</td>
                                                                <td>$ {ddjj?.tasa_calculada}</td>
                                                                <td>{ddjj?.fecha}</td>
                                                                <td>
                                                                    {ddjj?.cargada_en_timpo ? (
                                                                        <strong className="bi bi-check-circle text-success"> Sí</strong>
                                                                    ) : (
                                                                        <strong className="bi bi-x-circle text-danger"> No </strong>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input border-dark"
                                                                        checked={
                                                                            selectedCheckbox === `${ddjj?.id_contribuyente}-${ddjj?.id_comercio}-${ddjj?.fecha}`
                                                                        }
                                                                        onChange={(e) => handleShowAddModal(ddjj?.id_contribuyente, ddjj?.id_comercio, ddjj?.cod_comercio, ddjj.fecha, e.target.checked)}
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

            {modalConfig.isVisible && (
                <ConfirmModal
                    msj={modalConfig.message}
                    handleEstadoChange={() => {
                        modalConfig.onConfirm();
                        setModalConfig({ ...modalConfig, isVisible: false });
                    }}
                    setShowConfirmModal={handleCancelModal}
                />
            )}

            <SuccessModal
                show={showModal}
                message={msjModalExito}
                duration={3000}
            />

            <ErrorNotification
                message={errorMessage}
                onClose={() =>
                    setErrorMessage(null)
                }
            />
        </>
    )
}

export default DdjjToRafam