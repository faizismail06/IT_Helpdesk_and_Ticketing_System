import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/auth';
import { api } from '../api/axios';

interface AuthContextType extends AuthState {
 login: (token: string, user: User) => void;
 logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [state, setState] = useState<AuthState>({
 user: null,
 token: localStorage.getItem('token'),
 isAuthenticated: false,
 isLoading: true,
 });

 useEffect(() => {
 const initAuth = async () => {
 const token = localStorage.getItem('token');
 if (!token) {
 setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
 return;
 }

 try {
 const response = await api.get('/auth/me');
 setState({
 user: response.data.data,
 token,
 isAuthenticated: true,
 isLoading: false,
 });
 } catch (err) {
 localStorage.removeItem('token');
 setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
 }
 };

 initAuth();
 }, []);

 const login = (token: string, user: User) => {
 localStorage.setItem('token', token);
 setState({
 user,
 token,
 isAuthenticated: true,
 isLoading: false,
 });
 };

 const logout = () => {
 localStorage.removeItem('token');
 setState({
 user: null,
 token: null,
 isAuthenticated: false,
 isLoading: false,
 });
 };

 return (
 <AuthContext.Provider value={{ ...state, login, logout }}>
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
