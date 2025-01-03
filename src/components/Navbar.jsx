import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'

const Navbar = () => {
    const { logout, user } = useAuth();
    const location = useLocation(); // Obtener la ubicación actual
    // Función para determinar si un enlace está activo
    const isActive = (path) => location.pathname === path;
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
            <div className="container">
                {/* Logo y nombre */}
                <Link to="/" className="navbar-brand d-flex align-items-center">
                    <img
                        src='/img/logo_municipalidad_loberia2-removebg-preview.png'
                        alt="Logo"
                        className="img-fluid me-2"
                        style={{ maxHeight: '80px' }}
                    />
                </Link>
                {/* Botón hamburguesa */}
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

                {/* Menú de navegación */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto text-center">
                        {user?.rol && (
                            <>
                                {user?.rol === 'admin' || user?.rol === 'super_admin' ? (
                                    <>
                                        <li className="nav-item">
                                            <Link
                                                className={`btn btn-dark text-uppercase me-2 ${isActive('/home')
                                                    && 'btn-outline-light'
                                                    }`}
                                                to="/home"
                                            >
                                                Contribuyentes
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`btn btn-dark text-uppercase me-2 ${isActive('/rafam')
                                                    && 'btn-outline-light'
                                                    }`}
                                                to="/rafam"
                                            >
                                                Cargar DDJJs en RAFAM
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`btn btn-dark text-uppercase me-2 ${isActive('/configuracion')
                                                    && 'btn-outline-light'
                                                    }`}
                                                to="/configuracion"
                                            >
                                                Configuración
                                            </Link>
                                        </li>

                                    </>
                                ) : (
                                    user?.estado && (
                                        <>
                                            <li className="nav-item">
                                                <Link
                                                    className={`btn btn-dark text-uppercase me-2 ${isActive('/home')
                                                        && 'btn-outline-light'
                                                        }`}
                                                    to="/home"
                                                >
                                                    Mis DDJJs
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link
                                                    className={`btn btn-dark text-uppercase me-2 ${isActive('/cargarDDJJ')
                                                        && 'btn-outline-light'
                                                        }`}
                                                    to="/cargarDDJJ"
                                                >
                                                    Cargar DDJJ
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link
                                                    className={`btn btn-dark text-uppercase me-2 ${isActive('/cargarComercio')
                                                        && 'btn-outline-light'
                                                        }`}
                                                    to="/cargarComercio"
                                                >
                                                    Cargar Comercio
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link
                                                    className={`btn btn-dark text-uppercase me-2 ${isActive('/vencimientos')
                                                        && 'btn-outline-light'
                                                        }`}
                                                    to="/vencimientos"
                                                >
                                                    Vencimientos
                                                </Link>
                                            </li>
                                        </>
                                    )
                                )}
                                <li className="nav-item">
                                    <Link
                                        className={`btn btn-dark text-uppercase me-2 ${isActive('/')
                                            && 'btn-outline-light'
                                            }`}
                                        onClick={logout}
                                    >
                                        Cerrar Sesión
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    {/* Redes sociales */}
                    <div className="d-flex justify-content-center mt-3 mt-lg-0">
                        <a
                            href="https://www.facebook.com/municipalidadloberia"
                            className="text-white me-3"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                        >
                            <i className="bi bi-facebook fs-4"></i>
                        </a>
                        <a
                            href="https://www.instagram.com/muniloberia"
                            className="text-white"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                        >
                            <i className="bi bi-instagram fs-4"></i>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;