import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RoleName } from '../types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
 allowedRoles?: RoleName[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
 const { isAuthenticated, isLoading, user } = useAuth();

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-slate-400">
 <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
 </div>
 );
 }

 if (!isAuthenticated || !user) {
 return <Navigate to="/login" replace />;
 }

 if (allowedRoles && !allowedRoles.includes(user.role)) {
 return <Navigate to="/unauthorized" replace />;
 }

 return <Outlet />;
};
