import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-4">
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
                    <div className="col-md-4 mb-4 mb-md-0">
                        <div className="text-center">
                            <p className="fw-bold mb-2">Municipio de Lobería</p>
                            <p className="mb-1">Avenida San Martín 51</p>
                            <p className="mb-1">Lobería, Prov. de Buenos Aires, Argentina</p>
                            <p className="mb-1">Conmutador: 02261 44-2126 y 44-3900</p>
                            <p className="mb-0">Interno 1013</p>
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="col-md-4">
                        <div className="text-center text-md-end">
                            <p className="fw-bold mb-2">Redes sociales</p>
                            <div className="d-flex justify-content-center justify-content-md-end">
                                <a
                                    href="https://www.facebook.com/municipalidadloberia"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white me-3"
                                >
                                    <i className="bi bi-facebook fs-3"></i>
                                </a>
                                <a
                                    href="https://www.instagram.com/muniloberia"
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