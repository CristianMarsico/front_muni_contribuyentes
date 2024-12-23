import React from 'react'
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthProvider';

// Definimos el componente PublicRoutes, que recibe como propiedad (prop) los 'children' 
// (el contenido que se quiere mostrar en rutas públicas).
const PublicRoutes = ({children}) => {
    
    // Usamos el hook `useAuth()` para obtener el estado de autenticación. Solo estamos desestructurando la propiedad 'loading', que indica si los datos de autenticación están siendo cargados.
    const { loading } = useAuth(); 

    // Mientras 'loading' sea true (es decir, mientras los datos de autenticación estén siendo cargados), mostramos el componente 'Loading'. Este es generalmente un spinner o una animación de espera.
    if (loading) return <Loading />; 
    
    // Una vez que los datos de autenticación han terminado de cargarse (es decir, cuando 'loading' es false), renderizamos los 'children', que son las rutas públicas o el contenido que no requiere autenticación.
    return children; 
}

export default PublicRoutes