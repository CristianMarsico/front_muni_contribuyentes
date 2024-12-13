import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import ErrorResponse from '../components/ErrorResponse';
import Filter from '../components/Filter';
import Loading from '../components/Loading';
import useFetch from '../helpers/hooks/UseFetch';

const Taxpayers = () => {
    const URL = import.meta.env.VITE_API_URL;
    const { data, loading, error, refetch } = useFetch(`${URL}/api/taxpayer`);
    const [buscarCuit, setBuscarCuit] = useState('');
    const [buscarApellido, serBuscarApellido] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState(null); // Datos del contribuyente seleccionado
    const [taxpayers, setTaxpayers] = useState(data?.response || []); // Estado local para los contribuyentes

    useEffect(() => {
        // Conectar con el servidor WebSocket
        const socket = io(URL);
        // Escuchar el evento de nuevos contribuyentes registrados
        socket.on('nuevo-contribuyente', (nuevoContribuyente) => {
            refetch();          
            // Actualizar el estado de contribuyentes cuando se reciba el nuevo registro
            setTaxpayers((prevTaxpayers) => [...prevTaxpayers, nuevoContribuyente]);
        });
        // Limpiar la conexión al cerrar el componente
        return () => {
            socket.disconnect();
        };
    }, []);

    const filtros = data?.response?.filter((c) => {
        const cuit = c.cuit.toString().includes(buscarCuit);
        const apellido = c.apellido.toLowerCase().includes(buscarApellido.toLowerCase());
        return apellido && cuit;
    });  

    const handleEditEstado = (c) => {
        setSelectedEstado(c);  
        setShowConfirmModal(true);
    };



    const handleEstadoChange = async () => {       
        try {
            const response = await axios.put(`${URL}/api/taxpayer/${selectedEstado.id_contribuyente}`,{
                withCredentials: true, // Incluye las cookies
            });
            if (response.status === 200) {
                refetch(); // Refresca los datos
            }
        } catch (error) {
            console.error(error);
        } finally {
            setShowConfirmModal(false);
        }
    }; 

    return (
        <>
            {/* Filtros */}
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 col-lg-4">
                        <div className="card shadow-lg rounded-4 border-0">
                            <div className="card-body p-4">
                                <h5 className="card-title text-center text-primary mb-4">Filtros</h5>
                                <Filter search={buscarApellido} setSearch={serBuscarApellido} name="Apellido" type="text"/>
                                <Filter search={buscarCuit} setSearch={setBuscarCuit} name="CUIT" type="number"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="container my-4">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="table-responsive shadow-lg rounded">
                            <table className="table table-hover text-center align-middle">
                                <thead className="table-dark">
                                    <tr className="text-uppercase text-light">
                                        <th scope="col">#</th>
                                        <th scope="col">NOMBRE Y APELLIDO</th>
                                        <th scope="col">CUIT</th>
                                        <th scope="col">EMAIL</th>
                                        <th scope="col">ACTIVAR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5">
                                                <div className="d-flex justify-content-center">
                                                    <Loading />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error || filtros?.length === 0 ? (
                                        <tr>
                                            <td colSpan="6">
                                                <div className="text-danger">
                                                    <ErrorResponse
                                                        message={error?.message || 'No hay coincidencias'}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtros.map((c, index) => (
                                            <tr key={c.id_contribuyente}>
                                                <th className="text-secondary">{index + 1}</th>
                                                <td className="fw-bold">
                                                    {c.nombre} {c.apellido}
                                                </td>
                                                <td className="fw-bold">{c.cuit}</td>
                                                <td className="fw-bold">{c.email}</td>
                                                <td className="fw-bold">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleEditEstado(c)}
                                                    >
                                                        {c.estado === false ? 'Dar de alta' : 'Dar de baja'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación */}
            {showConfirmModal && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
                    style={{ zIndex: 1050 }}
                >
                    <div className="p-4 shadow-lg rounded col-8 col-md-3 bg-light">
                        <h5 className="mb-3 text-primary">Confirmar Cambio</h5>
                        <p>
                            ¿Estás seguro de que deseas de alta a
                            <strong> {selectedEstado?.nombre} {selectedEstado?.apellido}</strong>?
                        </p>
                        <div className="d-flex justify-content-end">
                            <button className="btn btn-primary me-2" onClick={handleEstadoChange}>
                                Sí, dar de Alta
                            </button>
                            <button className="btn btn-danger" onClick={() => setShowConfirmModal(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Taxpayers;
