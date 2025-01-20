import React, { useEffect, useState } from 'react'
import useFetch from '../helpers/hooks/useFetch';
import { io } from 'socket.io-client';

const Footer = () => {
    const URL = import.meta.env.VITE_API_URL;// URL de la API desde las variables de entorno
    const { data, refetch } = useFetch(`${URL}/api/configuration`);
    const res = data?.response[0]
   
    const [values, setValues] = useState([]);

    useEffect(() => {
        const socket = io(URL);// Establece la conexión con el servidor WebSocket
        socket.on('new-info', (nuevoValor) => {// Escucha el evento 'nuevos-valores' desde el servidor
            setValues((prev) => [...prev, nuevoValor]);// Actualiza el estado 'values' con el nuevo valor recibido
            refetch();// Vuelve a hacer la solicitud para obtener los datos actualizados
        });
        return () => socket.disconnect();// Desconecta el WebSocket cuando el componente se desmonta
    }, [URL, refetch]);

    return (
        <footer className="bg-dark text-white py-4 mt-4">
            <div className="container">
                <div className="row text-center text-md-start align-items-center">
                    {/* Columna Izquierda */}
                    <div className="col-md-4 mb-4 mb-md-0">
                        <div className="d-flex flex-column align-items-center align-items-md-start">
                            {/* Logo Municipalidad */}
                            <img
                                src="/img/logo_municipalidad_loberia2-removebg-preview.png"
                                alt="Logo Municipalidad Lobería"
                                className="mb-4"
                                style={{ width: "200px", height: "auto" }}
                            />
                            {/* Logo Jefatura */}
                            <div className="d-flex align-items-start">
                                <img
                                    src="/img/Gob.png"
                                    alt="Logo Jefatura Gabinete"
                                    style={{ width: "50px", height: "auto" }}
                                    className="me-3"
                                />
                                <div>
                                    <a
                                        href="https://www.argentina.gob.ar/jefatura"
                                        className="text-white text-decoration-none fw-bold"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: "1.1rem", lineHeight: "1.2" }}
                                    >
                                        Jefatura de <br /> Gabinete de Ministros
                                    </a>
                                    <p className="mb-0 text-white-50" style={{ fontSize: "0.9rem" }}>Argentina</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Centro */}
                    <div className="col-md-4 mb-4 mb-md-0" id="footer-contact">
                        <div className="text-center">
                            <p className="fw-bold mb-2">Municipio de Lobería</p>
                            <p className="mb-1"><i className="bi bi-geo-alt-fill text-danger me-2"></i>{res?.direccion}</p>
                            <p className="mb-1">Lobería, Prov. de Buenos Aires, Argentina</p>
                            <p className="mb-1"><i className="bi bi-whatsapp text-success me-2"></i> {res?.whatsapp}</p>                            
                            <p className="mb-1"><i className="bi bi-telephone-fill text-secondary me-2"></i> {res?.telefono}</p>
                            <p className="mb-0"><i className="bi bi-envelope-fill text-secondary me-2"></i> {res?.email}</p>
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="col-md-4">
                        <div className="text-center text-md-end">
                            <p className="fw-bold mb-2">Redes sociales</p>
                            <div className="d-flex justify-content-center justify-content-md-end">
                                <a
                                    href={`https://${res?.facebook}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white me-3"
                                >
                                    <i className="bi bi-facebook fs-3"></i>
                                </a>
                                <a
                                    href={`https://${res?.instagram}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white me-3"
                                >
                                    <i className="bi bi-instagram fs-3"></i>
                                </a>
                                {/* <a
                                    href="mailto:info@municipio.gob.ar"
                                    className="text-white"
                                >
                                    <i className="bi bi-envelope fs-3"></i>
                                </a> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Separador */}
                <hr className="border-light my-4" />

                {/* Pie Inferior */}
                <div className="text-center">
                    <p className="mb-0">&copy; {new Date().getFullYear()} Municipio de Lobería. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer