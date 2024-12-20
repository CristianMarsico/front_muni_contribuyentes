import React, { useState } from 'react'
import DataTableConfig from '../components/configurationComponents/DataTableConfig';
import Quotas from './Quotas';

const Configuration = () => {
    // Estado para controlar la sección activa
    const [activeSection, setActiveSection] = useState('general');

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
                        </div>
                    </div>
                </nav>
                {/* Contenido de las Secciones */}
                {activeSection === 'general' ? (
                    <>
                        <div className="card-body container d-flex flex-column align-items-center">
                            <DataTableConfig />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="card">
                            <div className="card-body container d-flex flex-column align-items-center">
                                {activeSection === 'vencimientos' && (
                                    <div>
                                        {/* <h3 className="card-title">Configuración de Vencimientos</h3> */}
                                        <Quotas />
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )
                }
            </div>
        </>
    );
};

export default Configuration;