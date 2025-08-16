import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProfile } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to get CSRF token
  const getCSRFToken = async () => {
    try {
      await fetch('/api/csrf/', {
        method: 'GET',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  };

  // Check if user is authenticated on app load
  const checkAuth = async () => {
    try {
      // First get CSRF token
      await getCSRFToken();
      
      const response = await getProfile();
      setUser(response.user);
    } catch (error) {
      // User is not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}