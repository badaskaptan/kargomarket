import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  googleLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      // Temporary mock login - replace with Supabase
      console.log('Mock login:', { email, password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser = {
        id: '1',
        email,
        fullName: 'Test User',
        avatar: undefined
      };
      
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      // Temporary mock register - replace with Supabase
      console.log('Mock register:', { fullName, email, password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser = {
        id: '1',
        email,
        fullName,
        avatar: undefined
      };
      
      setUser(mockUser);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      // Temporary mock Google login - replace with Supabase
      console.log('Mock Google login');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser = {
        id: '1',
        email: 'user@gmail.com',
        fullName: 'Google User',
        avatar: undefined
      };
      
      setUser(mockUser);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    login,
    register,
    logout,
    googleLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
