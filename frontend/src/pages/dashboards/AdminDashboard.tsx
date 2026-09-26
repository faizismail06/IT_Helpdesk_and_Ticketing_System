import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard';
import { Card } from '../../components/ui/Card';
import { Users, Settings, ShieldAlert, Loader2, Star } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
 const { data: stats, isLoading } = useQuery({
 queryKey: ['dashboard-admin-stats'],
 queryFn: dashboardApi.getStats,
 });

 if (isLoading) {
 return (
 <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-2 text-slate-400">
 <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
 <p className="text-xs">Loading admin console analytics...</p>
 </div>
 );
 }

 const statCards = [
 { title: 'Total System Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
 { title: 'SLA Compliance Rate', value: `${stats?.slaComplianceRate || 100}%`, icon: Settings, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
 { title: 'Audit Log Entries', value: stats?.auditLogsCount || 0, icon: ShieldAlert, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
 { title: 'Avg System Rating', value: `${stats?.avgSystemRating || 5.0} `, icon: Star, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
 ];

 return (
 <div className="space-y-6 animate-in fade-in duration-200">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-[#111726] to-[#111726] border border-emerald-500/20 shadow-xl">
 <div className="space-y-1">
 <h1 className="text-xl font-bold text-white">System Administration & Audit Console</h1>
 <p className="text-xs text-slate-400">
 Full system control: user account provisioning, role matrix management, SLA rules, and immutable audit logs.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {statCards.map((s) => {
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

 {/* Technician Performance Matrix */}
 <Card className="space-y-3 p-0 overflow-hidden">
 <div className="p-4 bg-[#1a2236]/40 border-b border-slate-800 flex items-center justify-between">
 <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
 Technician Performance & SLA Resolution Matrix
 </h3>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="bg-[#1a2236] text-slate-400 font-mono text-[10px] uppercase">
 <th className="py-2.5 px-4">Technician Name</th>
 <th className="py-2.5 px-4">Email</th>
 <th className="py-2.5 px-4">Assigned Tickets</th>
 <th className="py-2.5 px-4">Resolved Tickets</th>
 <th className="py-2.5 px-4">Avg Work Time</th>
 <th className="py-2.5 px-4">Avg Requester Rating</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60">
 {(stats?.techPerformance || []).map((tech: any) => (
 <tr key={tech.id} className="hover:bg-slate-900/40">
 <td className="py-3 px-4 font-semibold text-white">{tech.name}</td>
 <td className="py-3 px-4 font-mono text-slate-400">{tech.email}</td>
 <td className="py-3 px-4 font-mono text-slate-300">{tech.assignedCount}</td>
 <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">{tech.resolvedCount}</td>
 <td className="py-3 px-4 font-mono text-slate-300">{tech.avgMins} mins</td>
 <td className="py-3 px-4 font-mono text-amber-400 font-bold">{tech.avgRating} </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 );
};
