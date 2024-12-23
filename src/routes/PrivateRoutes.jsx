import React from 'react'
import { Navigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthProvider';

// Definimos el componente PrivateRoutes, que recibe como propiedad (prop)
// los 'children' (el contenido que se quiere mostrar si el usuario está autenticado).
const PrivateRoutes = ({ children }) => {
    
    // Usamos el hook `useAuth()` para obtener el estado de autenticación. 'user' 
    // contiene los datos del usuario autenticado, y 'loading' indica si los datos de autenticación están siendo cargados.
    const { user, loading } = useAuth();

    if (loading) return <Loading />; // Mientras se cargan los datos de autenticación (loading es true), mostramos el componente 'Loading', que probablemente sea una animación o mensaje de carga.

    // Si 'user' existe (el usuario está autenticado), renderizamos los 'children' (el contenido protegido, como la página a la que se quiere acceder).
    // Si no hay un usuario autenticado, redirigimos a la página de inicio ('/'), usando el componente `Navigate` de React Router.
    return user ? children : <Navigate to="/" />;
}

export default PrivateRoutes 