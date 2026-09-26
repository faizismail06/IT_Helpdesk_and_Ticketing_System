import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SlaCountdownMeterProps {
 createdAt: string;
 slaDeadline: string;
 isOverdue: boolean;
 status: string;
}

export const SlaCountdownMeter: React.FC<SlaCountdownMeterProps> = ({
 createdAt,
 slaDeadline,
 isOverdue,
 status,
}) => {
 const [timeLeft, setTimeLeft] = useState<{ hours: number; mins: number; secs: number; totalMs: number }>({
 hours: 0,
 mins: 0,
 secs: 0,
 totalMs: 0,
 });

 const isResolvedOrClosed = ['RESOLVED', 'CLOSED'].includes(status);

 useEffect(() => {
 if (isResolvedOrClosed) return;

 const calculateTime = () => {
 const now = new Date().getTime();
 const deadline = new Date(slaDeadline).getTime();
 const diff = deadline - now;

 if (diff <= 0) {
 setTimeLeft({ hours: 0, mins: 0, secs: 0, totalMs: 0 });
 } else {
 const hours = Math.floor(diff / (1000 * 60 * 60));
 const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
 const secs = Math.floor((diff % (1000 * 60)) / 1000);
 setTimeLeft({ hours, mins, secs, totalMs: diff });
 }
 };

 calculateTime();
 const interval = setInterval(calculateTime, 1000);
 return () => clearInterval(interval);
 }, [slaDeadline, isResolvedOrClosed]);

 if (isResolvedOrClosed) {
 return (
 <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between font-medium">
 <span className="flex items-center gap-1.5">
 <CheckCircle2 className="w-4 h-4" /> SLA Resolved
 </span>
 <span className="font-mono text-[11px] text-emerald-300">Within SLA Target</span>
 </div>
 );
 }

 const startMs = new Date(createdAt).getTime();
 const deadlineMs = new Date(slaDeadline).getTime();
 const totalDuration = Math.max(1, deadlineMs - startMs);
 const percentRemaining = Math.max(0, Math.min(100, (timeLeft.totalMs / totalDuration) * 100));

 let colorStyle = 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
 let progressBg = 'bg-emerald-500';

 if (isOverdue || timeLeft.totalMs <= 0) {
 colorStyle = 'border-rose-500/40 bg-rose-500/10 text-rose-400';
 progressBg = 'bg-rose-500';
 } else if (percentRemaining < 20) {
 colorStyle = 'border-rose-500/30 bg-rose-500/5 text-rose-400 animate-pulse';
 progressBg = 'bg-rose-500';
 } else if (percentRemaining < 50) {
 colorStyle = 'border-amber-500/30 bg-amber-500/5 text-amber-400';
 progressBg = 'bg-amber-500';
 }

 const pad = (n: number) => String(n).padStart(2, '0');

 return (
 <div className={clsx('p-3.5 rounded-xl border space-y-2.5', colorStyle)}>
 <div className="flex items-center justify-between text-xs font-bold">
 <span className="flex items-center gap-1.5">
 {isOverdue || timeLeft.totalMs <= 0 ? (
 <AlertTriangle className="w-4 h-4 text-rose-400" />
 ) : (
 <Clock className="w-4 h-4" />
 )}
 SLA Remaining
 </span>
 <span className="font-mono text-[11px]">
 {isOverdue || timeLeft.totalMs <= 0 ? 'SLA BREACHED' : `${Math.round(percentRemaining)}% Time Left`}
 </span>
 </div>

 <div className="text-lg font-mono font-bold tracking-widest text-slate-100 flex items-center justify-between">
 {isOverdue || timeLeft.totalMs <= 0 ? (
 <span className="text-rose-400 font-sans text-sm font-bold">OVERDUE</span>
 ) : (
 <span>
 {pad(timeLeft.hours)}h : {pad(timeLeft.mins)}m : {pad(timeLeft.secs)}s
 </span>
 )}
 </div>

 {/* Progress Bar */}
 <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
 <div
 className={clsx('h-full transition-all duration-500', progressBg)}
 style={{ width: `${percentRemaining}%` }}
 />
 </div>
 </div>
 );
};
