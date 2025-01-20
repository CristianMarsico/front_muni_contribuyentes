import React from 'react'
import { Navigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthProvider';

// Definimos el componente PublicRoutes, que recibe como propiedad (prop) los 'children' 
// (el contenido que se quiere mostrar en rutas públicas).
const PublicRoutes = ({children}) => {
    
    // Usamos el hook `useAuth()` para obtener el estado de autenticación. Solo estamos desestructurando la propiedad 'loading', que indica si los datos de autenticación están siendo cargados.
    const { user, loading } = useAuth(); 

    // Mientras 'loading' sea true (es decir, mientras los datos de autenticación estén siendo cargados), mostramos el componente 'Loading'. Este es generalmente un spinner o una animación de espera.
    if (loading) return <Loading />; // Muestra un indicador mientras se valida la sesión

    //si estoy logeado y quiero volver al login manteneme en clientes
    if (user) return <Navigate to={"/home"} />;

    return children; // Si está autenticado, redirige; si no, muestra la página pública
}

export default PublicRoutes