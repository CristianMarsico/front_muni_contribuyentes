/**
 * Componente para gestionar y visualizar contribuyentes en espera de aprobación.
 *
 * Características principales:
 * - Obtiene la lista de contribuyentes desde una API.
 * - Escucha eventos en tiempo real mediante Socket.IO para:
 *   - Agregar nuevos contribuyentes.
 *   - Actualizar el estado de contribuyentes existentes.
 * - Permite filtrar contribuyentes por CUIT y apellido.
 * - Muestra una tabla interactiva con la información y un botón para acceder a los detalles.
 *
 * @component
 * @returns {JSX.Element} Tabla de contribuyentes con filtros y eventos en tiempo real.
 */
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import ErrorResponse from '../components/ErrorResponse';
import Filter from '../components/Filter';
import Loading from '../components/Loading';
import { useNavigate } from 'react-router-dom';
import useFetch from '../helpers/hooks/useFetch';

const Taxpayers = () => {
    const URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    // Hook personalizado para obtener los datos iniciales
    const { data, loading, error, refetch } = useFetch(`${URL}/api/taxpayer`);
    // Estados locales
    const [buscarCuit, setBuscarCuit] = useState('');
    const [buscarApellido, setBuscarApellido] = useState('');
    const [taxpayers, setTaxpayers] = useState([]);

    // Actualizar la lista cuando se reciben nuevos datos de la API
    useEffect(() => {
        if (data?.response) {
            setTaxpayers(data.response);
        } else {
            setTaxpayers([]);
        }
    }, [data]);

    // Configurar eventos del socket
    useEffect(() => {
        const socket = io(URL);
        // Evento: agregar nuevo contribuyente
        socket.on('nuevo-contribuyente', (nuevoContribuyente) => {
            setTaxpayers((prevTaxpayers) => [...prevTaxpayers, nuevoContribuyente]);
            refetch();
        });

        // Evento: actualizar estado de un contribuyente
        socket.on('estado-actualizado', (contribuyenteActualizado) => {
            if (contribuyenteActualizado && contribuyenteActualizado.id_contribuyente) {
                setTaxpayers((prevTaxpayers) =>
                    prevTaxpayers.map((c) =>
                        c.id_contribuyente === contribuyenteActualizado.id_contribuyente
                            ? { ...c, estado: contribuyenteActualizado.estado }
                            : c
                    )
                );
            } else {
                console.error('Estado actualizado inválido:', contribuyenteActualizado);
            }
        });

        // Cleanup al desmontar el componente
        return () => {
            socket.disconnect();
        };
    }, [URL, refetch]);

    // Aplicar filtros dinámicos
    const filtros = taxpayers.filter((c) => {
        if (!c?.cuit || !c?.apellido) return false; // Excluir datos incompletos
        const cuit = c.cuit.toString().includes(buscarCuit);
        const apellido = c.apellido.toLowerCase().includes(buscarApellido.toLowerCase());
        return cuit && apellido;
    });

    return (
        <>
            {/* Sección de filtros */}
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card shadow-lg rounded-4 border-0">
                            <div className="card-body p-4">
                                <h5 className="card-title text-center text-primary mb-4">Filtros</h5>
                                <Filter search={buscarApellido} setSearch={setBuscarApellido} name="Apellido" type="text" placeholder="Ingrese apellido" />
                                <Filter search={buscarCuit} setSearch={setBuscarCuit} name="CUIT" type="number" placeholder="Ingrese CUIT" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de contribuyentes */}
            <div className="container mt-4 col-12">
                <div className="mt-4">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white text-center">
                            <h5 className="mb-0">Contribuyentes en espera para ser aprobados</h5>
                        </div>
                        <div className="row justify-content-center">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered text-center w-100" style={{ textAlign: "center", verticalAlign: "middle" }}>
                                        <thead className="thead-dark">
                                            <tr className="text-center align-middle">
                                                <th scope="col">Nombre y Apellido</th>
                                                <th scope="col">CUIT</th>
                                                <th scope="col">Email</th>
                                                <th scope="col">Estado</th>
                                                <th scope="col">Información</th>
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
                                                    <td colSpan="5">
                                                        <div className="text-danger">
                                                            <ErrorResponse
                                                                message={error?.message || 'No hay coincidencias'}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filtros.map((c) => (
                                                    <tr key={c?.id_contribuyente || Math.random()}>
                                                        <td>{c?.nombre} {c?.apellido}</td>
                                                        <td>{c?.cuit}</td>
                                                        <td>{c?.email}</td>
                                                        <td>
                                                            {c?.estado ? (
                                                                <strong className="bi bi-check-circle text-success"> Habilitado</strong>
                                                            ) : (
                                                                <strong className="bi bi-x-circle text-danger"> Sin habilitar</strong>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                type="button"
                                                                className="btn btn-warning fw-bold"
                                                                onClick={() => navigate(`/contribuyente/${c?.id_contribuyente}`)}
                                                            >
                                                                Ver Detalles
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
                </div>
            </div>
        </>
    );
};

export default Taxpayers;