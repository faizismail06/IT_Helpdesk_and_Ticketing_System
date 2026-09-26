import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RoleName } from '../../types/auth';
import { Sparkles, User, Wrench, Headset, ShieldAlert, X } from 'lucide-react';

interface RoleSwitcherModalProps {
 isOpen: boolean;
 onClose: () => void;
}

const DEMO_ACCOUNTS: { role: RoleName; label: string; email: string; pass: string; icon: any; color: string; desc: string }[] = [
 {
 role: 'EMPLOYEE',
 label: 'Employee / Requester',
 email: 'budi.employee@company.com',
 pass: 'User123!',
 icon: User,
 color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
 desc: 'Submit IT tickets, track status, post comments, rate resolutions',
 },
 {
 role: 'HELPDESK',
 label: 'Helpdesk (Triage Officer)',
 email: 'helpdesk@company.com',
 pass: 'Helpdesk123!',
 icon: Headset,
 color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
 desc: 'Triage incoming tickets, assign priorities/categories & route to technicians',
 },
 {
 role: 'TECHNICIAN',
 label: 'Technician (Tier 2/3 Support)',
 email: 'technician.ahmad@company.com',
 pass: 'Tech123!',
 icon: Wrench,
 color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
 desc: 'Diagnose assigned tickets, log work time, submit resolution notes',
 },
 {
 role: 'ADMIN',
 label: 'System Administrator',
 email: 'admin@company.com',
 pass: 'Admin123!',
 icon: ShieldAlert,
 color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
 desc: 'System oversight, user management, SLA rules, audit logs & reports',
 },
];

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
 const { login, user: currentUser } = useAuth();

 if (!isOpen) return null;

 const handleSwitchRole = async (email: string, pass: string) => {
 try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'}/auth/login`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email, password: pass }),
 });
 const data = await response.json();
 if (data.success) {
 login(data.data.token, data.data.user);
 onClose();
 }
 } catch (err) {
 console.error('Failed to switch role:', err);
 }
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="w-full max-w-lg bg-[#111726] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 relative">
 <button
 onClick={onClose}
 className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
 >
 <X className="w-5 h-5" />
 </button>

 <div className="flex items-center gap-3">
 <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
 <Sparkles className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-white">Demo Role Switcher</h2>
 <p className="text-xs text-slate-400">Instantly switch role context to test RBAC workflows</p>
 </div>
 </div>

 <div className="space-y-2.5">
 {DEMO_ACCOUNTS.map((item) => {
 const Icon = item.icon;
 const isCurrent = currentUser?.role === item.role;

 return (
 <button
 key={item.role}
 onClick={() => handleSwitchRole(item.email, item.pass)}
 disabled={isCurrent}
 className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
 isCurrent
 ? 'border-blue-500/40 bg-blue-500/5 cursor-default'
 : 'border-slate-800/90 bg-[#1a2236]/60 hover:bg-[#202a43] hover:border-slate-700'
 }`}
 >
 <div className={`p-2.5 rounded-lg border shrink-0 ${item.color}`}>
 <Icon className="w-5 h-5" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between">
 <span className="font-semibold text-sm text-slate-100">{item.label}</span>
 {isCurrent && (
 <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
 Active Role
 </span>
 )}
 </div>
 <p className="text-xs text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
 </div>
 </button>
 );
 })}
 </div>
 </div>
 </div>
 );
};
