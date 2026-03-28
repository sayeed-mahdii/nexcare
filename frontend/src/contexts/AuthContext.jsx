import { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const newSocket = io(apiUrl, {
        auth: { token: localStorage.getItem('token') }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join', user.id);
      });

      newSocket.on('appointment:new', (data) => {
        console.log('New appointment notification:', data);
      });

      newSocket.on('appointment:status', (data) => {
        console.log('Appointment status update:', data);
      });

      newSocket.on('report:ready', (data) => {
        console.log('Lab report ready:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user: newUser } = response.data.data;
    localStorage.setItem('token', token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const updateProfile = async (data) => {
    const response = await api.put('/auth/profile', data);
    setUser({ ...user, ...response.data.data });
    return response.data.data;
  };

  const value = {
    user,
    loading,
    socket,
    login,
    register,
    logout,
    updateProfile,
    updateUser: (data) => setUser({ ...user, ...data }), // Allow local updates
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Administrator',
    isDoctor: user?.role === 'Doctor',
    isPatient: user?.role === 'Patient',
    isPathologist: user?.role === 'Pathologist',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
