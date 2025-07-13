import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext, useState } from 'react';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const login = async (email, password) => {
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
        }
        catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };
    const register = async (fullName, email, password) => {
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
        }
        catch (error) {
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
        }
        catch (error) {
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
    return (_jsx(AuthContext.Provider, { value: value, children: children }));
};
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
