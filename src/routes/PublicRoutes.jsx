import React from 'react'
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthProvider';

const PublicRoutes = ({children}) => {
    const { loading } = useAuth(); // Accede al usuario y al estado de carga desde el contexto
    if (loading) return <Loading />; // Muestra un indicador mientras se valida la sesión
    return children; // Si está autenticado, redirige; si no, muestra la página pública
}

export default PublicRoutes