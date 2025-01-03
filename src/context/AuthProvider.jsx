import React, { createContext, useEffect, useState } from 'react'
import { useContext } from 'react';
import axios from 'axios';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const URL = import.meta.env.VITE_API_URL;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Estado de carga inicial

    // Validar sesión en el backend
    useEffect(() => {
        const validateSession = async () => {
            try {
                const res = await axios.get(`${URL}/api/auth/protected`, {
                    withCredentials: true, // Incluye las cookies
                });
                setUser(res.data.user); // Usuario autenticado
            } catch {
                setUser(null); // No autenticado o token inválido
            } finally {
                setLoading(false); // Finaliza la carga inicial
            }
        };
        validateSession();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        await axios.post(`${URL}/api/auth/logout`, {}, { withCredentials: true });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)