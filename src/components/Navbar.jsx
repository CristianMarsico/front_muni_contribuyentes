import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'


const Navbar = () => {
    const { logout, user } = useAuth();
    return (

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">

                {/* Botón hamburguesa para móviles */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Contenido del Navbar */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    {/* Enlaces de navegación */}

                    <ul className="navbar-nav mx-auto">
                        {user?.rol && (
                            <>
                                {
                                    user?.rol === "admin" ? (
                                        <li className="nav-item">
                                            <Link className="nav-link text-uppercase" to="/home">
                                                Contribuyentes
                                            </Link>
                                        </li>

                                    ) : (
                                        <>
                                            {
                                                user?.estado && (
                                                    <>
                                                        <li className="nav-item">
                                                            <Link className="nav-link text-uppercase" to="/home">
                                                                Mis DDJJs
                                                            </Link>
                                                        </li>
                                                        <li className="nav-item">
                                                            <Link className="nav-link text-uppercase" to="/newDdjj">
                                                                Cargar DDJJ
                                                            </Link>
                                                        </li>
                                                    </>
                                                )
                                            }
                                        </>
                                    )
                                }

                                <li className="nav-item">
                                    <Link className="nav-link text-uppercase" onClick={() => logout()}>
                                        Cerrar Sesión
                                    </Link>
                                </li>
                            </>
                        )}

                    </ul>
                    {/* Redes sociales */}
                    <div className="d-flex">
                        <a
                            href="https://facebook.com"
                            className="text-white me-3"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                        >
                            <span className="bi bi-facebook" style={{ fontSize: "1.5rem" }}></span>
                        </a>
                        <a
                            href="https://instagram.com"
                            className="text-white"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                        >
                            <span className="bi bi-instagram" style={{ fontSize: "1.5rem" }}></span>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar