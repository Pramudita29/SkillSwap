import { createContext, useEffect, useState } from 'react';
import api from '../utils/api';

export const AuthContext = createContext({
    currentUser: null,
    loginStepOne: async () => { },
    loginStepTwo: async () => { },
    logout: () => { },
    loading: true,
    error: '',
});

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Fetch user ID from token
                const response = await api.get('/auth/me');
                const user = await api.get(`/users/${response.userId}`);
                setCurrentUser({ id: response.userId, ...user });
                setError('');
            } catch (err) {
                setCurrentUser(null);
                setError(err.message);
                localStorage.removeItem('authToken');
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    const loginStepOne = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            setError('');
            return { userId: response.userId, mfaCode: response.mfaCode };
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const loginStepTwo = async (userId, mfaCode) => {
        try {
            const response = await api.post('/auth/mfa', { userId, mfaCode });
            localStorage.setItem('authToken', response.token);
            const user = await api.get(`/users/${userId}`);
            setCurrentUser({ id: userId, ...user });
            setError('');
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        setError('');
    };

    return (
        <AuthContext.Provider value={{ currentUser, loginStepOne, loginStepTwo, logout, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};