import React from 'react'
import { Navigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthProvider';

const PrivateRoutes = ({children}) => {
    const { user, loading } = useAuth(); // Agrega el estado `loading` desde el contexto
    if (loading) return <Loading />; 
    return user ? children : <Navigate to="/" />; // Redirige al login si no está autenticado
}

export default PrivateRoutes 