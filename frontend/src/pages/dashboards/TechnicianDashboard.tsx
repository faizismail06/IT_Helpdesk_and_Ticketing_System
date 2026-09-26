import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Wrench, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TechnicianDashboard: React.FC = () => {
 const navigate = useNavigate();

 const stats = [
 { title: 'Assigned to Me', value: '5', icon: Wrench, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
 { title: 'In Progress', value: '3', icon: Clock, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
 { title: 'Nearing SLA Deadline', value: '1', icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
 { title: 'Resolved This Week', value: '12', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
 ];

 return (
 <div className="space-y-6 animate-in fade-in duration-200">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#111726] to-[#111726] border border-amber-500/20 shadow-xl">
 <div className="space-y-1">
 <h1 className="text-xl font-bold text-white">Technician Incident Workstation</h1>
 <p className="text-xs text-slate-400">
 Diagnose assigned incidents, update work logs, provide resolutions, and prevent SLA breaches.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {stats.map((s) => {
 const Icon = s.icon;
 return (
 <Card key={s.title} className="flex items-center gap-4">
 <div className={`p-3 rounded-xl border ${s.color}`}>
 <Icon className="w-6 h-6" />
 </div>
 <div>
 <div className="text-2xl font-bold text-white">{s.value}</div>
 <div className="text-xs text-slate-400 font-medium">{s.title}</div>
 </div>
 </Card>
 );
 })}
 </div>

 <Card className="space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-slate-800">
 <div>
 <h2 className="text-sm font-bold text-white">Assigned Tickets (Action Required)</h2>
 <p className="text-xs text-slate-400">Tickets assigned to you sorted by SLA urgency</p>
 </div>
 <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>
 My Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
 </Button>
 </div>

 <div className="space-y-2">
 {[
 { id: 'IT-2026-000001', subject: 'Laptop display flickering & HDMI port unresponsive', sla: '03h 12m remaining', status: 'IN_PROGRESS' },
 { id: 'IT-2026-000004', subject: 'Printer jam on 3rd floor office printer', sla: '07h 45m remaining', status: 'OPEN' },
 ].map((ticket) => (
 <div key={ticket.id} className="p-3.5 rounded-xl border border-slate-800 bg-[#1a2236]/40 flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="font-mono text-amber-400 font-semibold">{ticket.id}</span>
 <span className="text-slate-200 font-medium">{ticket.subject}</span>
 </div>
 <div className="text-[11px] text-rose-400 font-mono flex items-center gap-1">
 <Clock className="w-3 h-3" /> SLA Countdown: {ticket.sla}
 </div>
 </div>

 <Button variant="primary" size="sm">
 Open Workstation
 </Button>
 </div>
 ))}
 </div>
 </Card>
 </div>
 );
};
