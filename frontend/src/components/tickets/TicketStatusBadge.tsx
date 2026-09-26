import React from 'react';
import { TicketStatus } from '../../types/ticket';
import { clsx } from 'clsx';

interface TicketStatusBadgeProps {
 status: TicketStatus;
 className?: string;
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; dot: string; style: string }> = {
 NEW: { label: 'NEW', dot: 'bg-sky-400', style: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
 OPEN: { label: 'OPEN', dot: 'bg-indigo-400', style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
 IN_PROGRESS: { label: 'IN PROGRESS', dot: 'bg-amber-400 animate-pulse', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
 PENDING: { label: 'PENDING', dot: 'bg-purple-400', style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
 RESOLVED: { label: 'RESOLVED', dot: 'bg-emerald-400', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
 CLOSED: { label: 'CLOSED', dot: 'bg-slate-400', style: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
 REOPENED: { label: 'REOPENED', dot: 'bg-pink-400 animate-pulse', style: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
 OVERDUE: { label: 'OVERDUE', dot: 'bg-rose-500 animate-ping', style: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status, className }) => {
 const config = STATUS_CONFIG[status] || STATUS_CONFIG.NEW;

 return (
 <span
 className={clsx(
 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border tracking-wider',
 config.style,
 className
 )}
 >
 <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
 {config.label}
 </span>
 );
};
