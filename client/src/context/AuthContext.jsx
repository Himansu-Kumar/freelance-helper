import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (error) {
          console.error('Error loading user', error);
          setAuthToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setAuthToken(res.data.token);
    const userRes = await api.get('/auth/me');
    setUser(userRes.data.data);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    setAuthToken(res.data.token);
    const userRes = await api.get('/auth/me');
    setUser(userRes.data.data);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateUser = (data) => setUser(data);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
