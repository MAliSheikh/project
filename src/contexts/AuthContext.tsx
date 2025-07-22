import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser } from '../services/api';

interface User {
  email: string;
  username: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = sessionStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode<User>(savedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(savedToken);
          setUser(decoded);
        } else {
          sessionStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        sessionStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if API base URL is configured
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      if (!apiBaseUrl) {
        setError('API configuration missing. Please check your .env file.');
        return false;
      }
      
      const response = await loginUser(email, password);
      const { access_token } = response;
      
      const decoded = jwtDecode<User>(access_token);
      
      setToken(access_token);
      setUser(decoded);
      sessionStorage.setItem('token', access_token);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      
      // Provide specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK')) {
          setError('Cannot connect to server. Please ensure the backend API is running at ' + import.meta.env.VITE_API_BASE_URL);
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setError('Invalid credentials. Please check your email and password.');
        } else if (error.message.includes('timeout')) {
          setError('Request timeout. Please check your internet connection and try again.');
        } else {
          setError('Login failed: ' + error.message);
        }
      } else {
        setError('An unexpected error occurred during login.');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};