import { useCallback, useEffect, useState } from 'react'
import axios from 'axios';
import { useAuth } from '../../context/AuthProvider';

const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { logout } = useAuth(); // Accede al usuario y al estado de carga desde el contexto

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null); // Reinicia el error antes de hacer la solicitud
        try {
            const response = await axios.get(url, { withCredentials: true });
            setData(response?.data);
        } catch (err) {
            if (err?.response) {
                if (err.response.status === 401) {
                    logout()
                } else {
                    setError(new Error(err.response.data.error || 'Error en la respuesta del servidor'));
                }
            } else if (err.request) {
                setError(new Error('No se recibió respuesta del servidor'));
            } else {
                setError(new Error(err.message));
            }
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Devuelve también una función para recargar los datos
    return { data, loading, error, refetch: fetchData, setData, setError };
}

export default useFetch