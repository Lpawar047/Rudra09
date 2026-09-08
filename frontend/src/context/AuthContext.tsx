import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('rudra_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('rudra_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('rudra_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session verification failed', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password: pass });
    const { token: newToken, user: userData } = res.data;

    setToken(newToken);
    setUser(userData);
    localStorage.setItem('rudra_token', newToken);
    localStorage.setItem('rudra_user', JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rudra_token');
    localStorage.removeItem('rudra_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
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
