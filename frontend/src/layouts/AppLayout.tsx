import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';

export const AppLayout: React.FC = () => {
 return (
 <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
 <Header />
 <div className="flex flex-1">
 <Sidebar />
 <main className="flex-1 p-6 overflow-x-hidden">
 <Outlet />
 </main>
 </div>
 </div>
 );
};
