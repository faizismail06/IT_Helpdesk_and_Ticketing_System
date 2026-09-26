import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Shield, LogOut, CheckCircle2 } from 'lucide-react';

interface DashboardPlaceholderProps {
 title: string;
}

export const DashboardPlaceholder: React.FC<DashboardPlaceholderProps> = ({ title }) => {
 const { user, logout } = useAuth();

 return (
 <div className="min-h-screen bg-[#090d16] p-6 space-y-6">
 <header className="flex items-center justify-between pb-4 border-b border-slate-800">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
 <Shield className="w-6 h-6" />
 </div>
 <div>
 <h1 className="text-xl font-bold text-white">{title}</h1>
 <p className="text-xs text-slate-400">Enterprise IT Helpdesk Workstation</p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="text-right">
 <div className="text-sm font-semibold text-slate-200">{user?.fullName}</div>
 <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded">
 {user?.role}
 </span>
 </div>
 <Button variant="outline" size="sm" onClick={logout}>
 <LogOut className="w-4 h-4" />
 Logout
 </Button>
 </div>
 </header>

 <Card className="border-emerald-500/20 bg-emerald-500/5">
 <div className="flex items-start gap-3">
 <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
 <div>
 <h3 className="text-sm font-semibold text-emerald-300">Phase 1 Integration Complete</h3>
 <p className="text-xs text-slate-400 mt-1">
 Authentication, JWT token verification, password hashing, and role-based route protection are operational.
 </p>
 </div>
 </div>
 </Card>
 </div>
 );
};
