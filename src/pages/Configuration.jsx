import React, { useState } from 'react'
import { useAuth } from '../context/AuthProvider';
import DataTableConfig from './DataTableConfig';
import Quotas from './Quotas';
import Users from './Users';

const Configuration = () => {
    // Estado para controlar la sección activa
    const [activeSection, setActiveSection] = useState('general');

    const { user } = useAuth();

    return (
        <>
            <div className="container mt-4">
                {/* Barra de Navegación */}
                <nav className="navbar navbar-expand-lg bg-primary mb-4">
                    <div className="container d-flex flex-column align-items-center">
                        <div className="d-flex flex-column flex-md-row justify-content-center align-items-center w-100 gap-3">
                            <button
                                className={`btn px-4 py-2 text-white ${activeSection === 'general' ? 'btn-primary border border-light' : ''}`}
                                onClick={() => setActiveSection('general')}
                            >
                                CONFIGURACIÓN DE VALORES
                            </button>
                            <button
                                className={`btn px-4 py-2 text-white ${activeSection === 'vencimientos' ? 'btn-primary border border-light' : ''}`}
                                onClick={() => setActiveSection('vencimientos')}
                            >
                                CONFIGURACIÓN DE VENCIMINETOS
                            </button>
                            {
                                user.rol === 'super_admin' && (
                                    <button
                                        className={`btn px-4 py-2 text-white ${activeSection === 'usuarios' ? 'btn-primary border border-light' : ''}`}
                                        onClick={() => setActiveSection('usuarios')}
                                    >
                                        ABM DE USUARIOS
                                    </button>

                                )
                            }
                        </div>
                    </div>
                </nav>
                {/* Contenido de las Secciones */}
                {activeSection === 'general' && (
                    <div className="card-body container d-flex flex-column align-items-center">
                        <DataTableConfig />
                    </div>
                )}

                {activeSection === 'vencimientos' && (
                    <div className="card">
                        <div className="card-body container d-flex flex-column align-items-center">
                            <Quotas />
                        </div>
                    </div>
                )}
                {user.rol === 'super_admin' && (
                    activeSection === 'usuarios' && (
                        <div className="card-body container d-flex flex-column align-items-center">
                            <Users />
                        </div>
                    )
                )}
            </div>
        </>
    );
};

export default Configuration;