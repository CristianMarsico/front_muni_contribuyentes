import React from 'react'
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const Error = () => {
  const { user } = useAuth(); // No necesitas validar el usuario aquí para rutas completamente públicas

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <h2 className="text-dark">Página no encontrada</h2>
      <p className="text-muted text-center mb-4">
        Lo sentimos, la página que estás buscando no existe. <br />
        Por favor, verifica la URL o vuelve al inicio.
      </p>
      {
        !user ? (
          <Link to="/" className="btn btn-primary">
            Volver
          </Link>

        ) : (
          <Link to="/home" className="btn btn-primary">
            Volver al Inicio
          </Link>
        )
      }
    </div>
  );
}

export default Error