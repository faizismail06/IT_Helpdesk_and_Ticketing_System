import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
 LayoutDashboard,
 Ticket,
 PlusCircle,
 Headset,
 Wrench,
 BookOpen,
 BarChart3,
 Users,
 Shield,
 Clock,
 CheckCircle2,
} from 'lucide-react';

interface MenuItem {
 title: string;
 path: string;
 icon: any;
 badge?: string;
 roles: string[];
}

const MENU_ITEMS: MenuItem[] = [
 // Dashboard Items
 { title: 'Employee Portal', path: '/employee', icon: LayoutDashboard, roles: ['EMPLOYEE'] },
 { title: 'Helpdesk Queue', path: '/helpdesk', icon: Headset, roles: ['HELPDESK'] },
 { title: 'Tech Workstation', path: '/technician', icon: Wrench, roles: ['TECHNICIAN'] },
 { title: 'Admin Console', path: '/admin', icon: Shield, roles: ['ADMIN'] },

 // Ticket Operations
 { title: 'My Tickets', path: '/tickets', icon: Ticket, roles: ['EMPLOYEE'] },
 { title: 'All Tickets Queue', path: '/tickets', icon: Ticket, roles: ['HELPDESK', 'ADMIN'] },
 { title: 'Assigned Tickets', path: '/tickets', icon: Clock, roles: ['TECHNICIAN'] },
 { title: 'Submit New Ticket', path: '/tickets/new', icon: PlusCircle, roles: ['EMPLOYEE'] },

 // Knowledge & Analytics
 { title: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen, roles: ['EMPLOYEE'] },
 { title: 'Reports & Export', path: '/reports', icon: BarChart3, roles: ['HELPDESK', 'ADMIN'] },

 // Admin Specific
 { title: 'User Management', path: '/admin/users', icon: Users, roles: ['ADMIN'] },
 { title: 'SLA Configurator', path: '/admin/sla', icon: Clock, roles: ['ADMIN'] },
 { title: 'Categories & Knowledge', path: '/admin/content', icon: BookOpen, roles: ['ADMIN'] },
 { title: 'Audit Trail Logs', path: '/admin/audit', icon: Shield, roles: ['ADMIN'] },
];

export const Sidebar: React.FC = () => {
 const { user } = useAuth();
 const currentRole = user?.role || 'EMPLOYEE';

 const filteredMenu = MENU_ITEMS.filter((item) => item.roles.includes(currentRole));

 return (
 <aside className="w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 shrink-0">
 <div className="p-4 space-y-6">
 {/* Workspace Brand Badge */}
 <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#111726] border border-slate-800">
 <div className="p-2 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
 <Shield className="w-5 h-5" />
 </div>
 <div className="min-w-0">
 <h2 className="text-xs font-bold text-white truncate">IT HELPDESK</h2>
 <p className="text-[10px] text-slate-400 truncate">Service Management</p>
 </div>
 </div>

 {/* Navigation Section */}
 <nav className="space-y-1">
 <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
 Navigation Menu
 </div>
 {filteredMenu.map((item) => {
 const Icon = item.icon;
 return (
 <NavLink
 key={item.path + item.title}
 to={item.path}
 className={({ isActive }) =>
 `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
 isActive
 ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
 : 'text-slate-400 hover:text-slate-200 hover:bg-[#111726]'
 }`
 }
 >
 <div className="flex items-center gap-3">
 <Icon className="w-4 h-4 transition-colors group-hover:text-blue-400" />
 <span>{item.title}</span>
 </div>
 {item.badge && (
 <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
 {item.badge}
 </span>
 )}
 </NavLink>
 );
 })}
 </nav>
 </div>

 {/* Footer Workstation Info */}
 <div className="p-4 border-t border-slate-800/80 bg-[#090d16]">
 <div className="p-3 rounded-xl bg-[#111726]/80 border border-slate-800/80 text-[11px] space-y-1">
 <div className="flex items-center justify-between text-slate-300">
 <span className="font-semibold">SLA Engine</span>
 <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
 <CheckCircle2 className="w-3 h-3" /> Active
 </span>
 </div>
 <p className="text-slate-500 text-[10px]">Auto overdue detection enabled</p>
 </div>
 </div>
 </aside>
 );
};
