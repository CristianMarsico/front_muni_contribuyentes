import React, { useState } from 'react'
import DataTableConfig from '../components/configurationComponents/DataTableConfig';



const Configuration = () => {
   
    // Estado para controlar la sección activa
    const [activeSection, setActiveSection] = useState('general');

    console.log("Configuración renderizada, sección activa:", activeSection);

    return (
        <div className="container mt-4">
            {/* Barra de Navegación */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
                <div className="container-fluid ">
                    <div>
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <button
                                    className={`nav-link btn ${activeSection === 'general' ? 'active' : ''}`}
                                    onClick={() => setActiveSection('general')}
                                >
                                    Configuración General
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link btn ${activeSection === 'vencimientos' ? 'active' : ''}`}
                                    onClick={() => setActiveSection('vencimientos')}
                                >
                                    Configuración de vencimientos
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Contenido de las Secciones */}
            <div className="card">
                <div className="card-body">
                    {activeSection === 'general' && (
                        <DataTableConfig />
                    )}             

                    {activeSection === 'vencimientos' && (
                        <div>
                            <h3 className="card-title">Configuración de Vencimientos</h3>
                            <h1>Aca van a estar las fechas de vencimientos</h1>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Configuration;