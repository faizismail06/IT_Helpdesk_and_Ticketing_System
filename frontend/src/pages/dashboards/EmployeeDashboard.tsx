import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Ticket, PlusCircle, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployeeDashboard: React.FC = () => {
 const navigate = useNavigate();

 const stats = [
 { title: 'Total Tickets', value: '12', icon: Ticket, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
 { title: 'Open Tickets', value: '4', icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
 { title: 'In Progress', value: '3', icon: AlertCircle, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
 { title: 'Resolved & Closed', value: '5', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
 ];

 return (
 <div className="space-y-6 animate-in fade-in duration-200">
 {/* Top Welcome Banner */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#111726] to-[#111726] border border-blue-500/20 shadow-xl">
 <div className="space-y-1">
 <h1 className="text-xl font-bold text-white">Employee Service Portal</h1>
 <p className="text-xs text-slate-400">
 Submit IT issues, track resolution timelines, and communicate with support technicians.
 </p>
 </div>
 <Button variant="primary" size="md" onClick={() => navigate('/tickets/new')}>
 <PlusCircle className="w-4 h-4" />
 Create New Ticket
 </Button>
 </div>

 {/* Stats Cards */}
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

 {/* Active Tickets List */}
 <Card className="space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-slate-800">
 <div>
 <h2 className="text-sm font-bold text-white">My Active IT Tickets</h2>
 <p className="text-xs text-slate-400">Tickets requiring your response or currently being resolved</p>
 </div>
 <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>
 View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
 </Button>
 </div>

 <div className="divide-y divide-slate-800/80">
 {[
 { id: 'IT-2026-000001', subject: 'Laptop display flickering & HDMI port unresponsive', category: 'Hardware', status: 'IN_PROGRESS', priority: 'HIGH', updated: '15m ago' },
 { id: 'IT-2026-000003', subject: 'Request SAP ERP access for Finance department', category: 'Account & Access', status: 'OPEN', priority: 'MEDIUM', updated: '2h ago' },
 ].map((ticket) => (
 <div key={ticket.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-900/50 px-2 rounded-lg transition-colors">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="font-mono text-blue-400 font-semibold">{ticket.id}</span>
 <span className="text-slate-300 font-medium">{ticket.subject}</span>
 </div>
 <div className="flex items-center gap-2 text-[11px] text-slate-500">
 <span>Category: {ticket.category}</span>
 <span>•</span>
 <span>Updated {ticket.updated}</span>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
 {ticket.status}
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>
 );
};
