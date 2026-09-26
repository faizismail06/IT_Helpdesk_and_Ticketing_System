import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Sparkles, LogOut } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { CommandPalette } from './CommandPalette';
import { RoleSwitcherModal } from './RoleSwitcherModal';

const ROLE_BADGES: Record<string, { label: string; style: string }> = {
 EMPLOYEE: { label: 'EMPLOYEE', style: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
 HELPDESK: { label: 'HELPDESK TRIAGE', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
 TECHNICIAN: { label: 'TECHNICIAN T2', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
 ADMIN: { label: 'ADMINISTRATOR', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export const Header: React.FC = () => {
 const { user, logout } = useAuth();
 const [isCmdOpen, setIsCmdOpen] = useState(false);
 const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

 const roleInfo = ROLE_BADGES[user?.role || 'EMPLOYEE'] || ROLE_BADGES.EMPLOYEE;

 return (
 <>
 <header className="h-16 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
 {/* Brand & System Pulse */}
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
 <span className="font-mono text-[11px] text-slate-400">SYS-ONLINE</span>
 </div>

 <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
 <span>/</span>
 <span className="font-semibold text-slate-200">{user?.department?.name || 'Enterprise'}</span>
 </div>
 </div>

 {/* Center Search / Command Trigger */}
 <button
 onClick={() => setIsCmdOpen(true)}
 className="flex items-center gap-3 px-4 py-1.5 bg-[#111726] hover:bg-[#1a2236] border border-slate-800 rounded-xl text-xs text-slate-400 transition-colors w-64 md:w-80 justify-between shadow-inner"
 >
 <div className="flex items-center gap-2">
 <Search className="w-4 h-4 text-slate-500" />
 <span>Search or command...</span>
 </div>
 <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700/60">
 ⌘K
 </span>
 </button>

 {/* Right Actions & User Profile */}
 <div className="flex items-center gap-3">
 {/* Quick Demo Role Switcher Trigger */}
 <button
 onClick={() => setIsRoleSwitcherOpen(true)}
 className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-medium transition-colors"
 title="Switch Demo Role"
 >
 <Sparkles className="w-3.5 h-3.5" />
 <span>Switch Role</span>
 </button>

 <NotificationBell />

 <div className="h-5 w-[1px] bg-slate-800" />

 {/* User Profile */}
 <div className="flex items-center gap-3">
 <div className="text-right hidden sm:block">
 <div className="text-xs font-semibold text-slate-200">{user?.fullName}</div>
 <span className={`inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded border ${roleInfo.style}`}>
 {roleInfo.label}
 </span>
 </div>

 <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs uppercase shadow-sm">
 {user?.fullName?.charAt(0) || 'U'}
 </div>

 <button
 onClick={logout}
 className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
 title="Sign Out"
 >
 <LogOut className="w-4 h-4" />
 </button>
 </div>
 </div>
 </header>

 <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
 <RoleSwitcherModal isOpen={isRoleSwitcherOpen} onClose={() => setIsRoleSwitcherOpen(false)} />
 </>
 );
};
