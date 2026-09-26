import React from 'react';
import { TicketPriority } from '../../types/ticket';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, ShieldAlert, ArrowDown } from 'lucide-react';

interface TicketPriorityBadgeProps {
 priority: TicketPriority;
 className?: string;
}

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; icon: any; style: string }> = {
 CRITICAL: { label: 'CRITICAL', icon: ShieldAlert, style: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
 HIGH: { label: 'HIGH', icon: AlertTriangle, style: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
 MEDIUM: { label: 'MEDIUM', icon: AlertCircle, style: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
 LOW: { label: 'LOW', icon: ArrowDown, style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

export const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({ priority, className }) => {
 const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
 const Icon = config.icon;

 return (
 <span
 className={clsx(
 'inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border tracking-wider',
 config.style,
 className
 )}
 >
 <Icon className="w-3 h-3 shrink-0" />
 {config.label}
 </span>
 );
};
