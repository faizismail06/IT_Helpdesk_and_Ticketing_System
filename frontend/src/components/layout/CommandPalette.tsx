import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Ticket, BookOpen, BarChart3, Users, Settings, ShieldAlert, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface CommandPaletteProps {
 isOpen: boolean;
 onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
 const navigate = useNavigate();
 const { user } = useAuth();
 const [query, setQuery] = useState('');

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
 e.preventDefault();
 if (isOpen) onClose();
 }
 };
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, [isOpen, onClose]);

 if (!isOpen) return null;

 const actions = [
 { id: 'dash', label: 'Go to Dashboard', icon: BarChart3, path: `/${user?.role?.toLowerCase()}`, roles: ['EMPLOYEE', 'HELPDESK', 'TECHNICIAN', 'ADMIN'] },
 { id: 'tickets', label: 'View Ticket Queue', icon: Ticket, path: '/tickets', roles: ['EMPLOYEE', 'HELPDESK', 'TECHNICIAN', 'ADMIN'] },
 { id: 'new-ticket', label: 'Create New Ticket', icon: Ticket, path: '/tickets/new', roles: ['EMPLOYEE', 'HELPDESK', 'TECHNICIAN', 'ADMIN'] },
 { id: 'kb', label: 'Browse Knowledge Base', icon: BookOpen, path: '/knowledge-base', roles: ['EMPLOYEE', 'HELPDESK', 'TECHNICIAN', 'ADMIN'] },
 { id: 'reports', label: 'System Reports & Export', icon: BarChart3, path: '/reports', roles: ['HELPDESK', 'ADMIN'] },
 { id: 'users', label: 'User & Role Administration', icon: Users, path: '/admin/users', roles: ['ADMIN'] },
 { id: 'sla', label: 'SLA Rules Engine Setup', icon: Settings, path: '/admin/sla', roles: ['ADMIN'] },
 { id: 'audit', label: 'View Audit Logs', icon: ShieldAlert, path: '/admin/audit', roles: ['ADMIN'] },
 ];

 const filtered = actions.filter(
 (a) => a.roles.includes(user?.role || '') && a.label.toLowerCase().includes(query.toLowerCase())
 );

 const handleSelect = (path: string) => {
 navigate(path);
 onClose();
 };

 return (
 <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
 <div className="w-full max-w-xl bg-[#111726] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
 <div className="flex items-center px-4 border-b border-slate-800">
 <Search className="w-5 h-5 text-slate-400 shrink-0" />
 <input
 type="text"
 placeholder="Type a command or search ticket ID..."
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 className="w-full bg-transparent px-3 py-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
 autoFocus
 />
 <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
 <X className="w-4 h-4" />
 </button>
 </div>

 <div className="p-2 max-h-80 overflow-y-auto space-y-1">
 {filtered.length === 0 ? (
 <div className="p-6 text-center text-xs text-slate-500">No command matching "{query}"</div>
 ) : (
 filtered.map((item) => {
 const Icon = item.icon;
 return (
 <button
 key={item.id}
 onClick={() => handleSelect(item.path)}
 className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1a2236] text-slate-300 hover:text-white text-xs group transition-colors"
 >
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-slate-800/80 text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
 <Icon className="w-4 h-4" />
 </div>
 <span className="font-medium text-sm">{item.label}</span>
 </div>
 <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
 </button>
 );
 })
 )}
 </div>

 <div className="px-4 py-2 bg-[#090d16] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
 <span>Tip: Navigate with arrow keys or enter to select</span>
 <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">ESC to close</span>
 </div>
 </div>
 </div>
 );
};
