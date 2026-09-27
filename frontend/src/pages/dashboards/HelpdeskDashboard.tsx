import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Headset, Users, ShieldAlert, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

export const HelpdeskDashboard: React.FC = () => {
 const navigate = useNavigate();
 const { user } = useAuth();

 const { data: stats, isLoading, isError, error, refetch } = useQuery({
 queryKey: ['dashboard', user?.id, user?.role],
 queryFn: dashboardApi.getStats,
 enabled: Boolean(user),
 });

 if (isLoading) {
 return (
 <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-2 text-slate-400">
 <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
 <p className="text-xs">Loading live operational stats...</p>
 </div>
 );
 }

 if (isError) {
 return (
 <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center">
 <AlertTriangle className="w-8 h-8 text-rose-400" />
 <div><h2 className="text-sm font-semibold text-white">Unable to load helpdesk queue</h2><p className="text-xs text-slate-400">{(error as any)?.response?.data?.message || 'The server could not return dashboard data.'}</p></div>
 <Button variant="secondary" size="sm" onClick={() => refetch()}>Retry</Button>
 </div>
 );
 }

 const statCards = [
 { title: 'Total Queue', value: stats?.total || 0, icon: Headset, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
 { title: 'Unassigned Queue', value: stats?.unassigned || 0, icon: Users, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
 { title: 'SLA Overdue', value: stats?.overdue || 0, icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
 { title: 'Resolved / Closed', value: (stats?.resolved || 0) + (stats?.closed || 0), icon: Clock, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
 ];

 return (
 <div className="space-y-6 animate-in fade-in duration-200">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#111726] to-[#111726] border border-blue-500/20 shadow-xl">
 <div className="space-y-1">
 <h1 className="text-xl font-bold text-white">Helpdesk Operations & Triage Workstation</h1>
 <p className="text-xs text-slate-400">
 Monitor incoming tickets, manage technician assignments, and enforce SLA rules.
 </p>
 </div>
 <Button variant="secondary" size="md" onClick={() => navigate('/tickets')}>
 <ShieldAlert className="w-4 h-4" />
 Unassigned Queue ({stats?.unassigned || 0})
 </Button>
 </div>

 {/* Stats Cards */}
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

 {/* Visual Analytics */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card className="space-y-3">
 <h3 className="text-sm font-bold text-white">Tickets Volume by Category</h3>
 <div className="h-56">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={stats?.byCategory || []}>
 <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
 <YAxis stroke="#64748b" fontSize={10} />
 <Tooltip contentStyle={{ backgroundColor: '#111726', borderColor: '#1e293b', fontSize: '12px' }} />
 <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </Card>

 <Card className="space-y-3">
 <h3 className="text-sm font-bold text-white">Weekly Ticket Volume Trend</h3>
 <div className="h-56">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={stats?.volumeTrend || []}>
 <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
 <YAxis stroke="#64748b" fontSize={10} />
 <Tooltip contentStyle={{ backgroundColor: '#111726', borderColor: '#1e293b', fontSize: '12px' }} />
 <Bar dataKey="tickets" fill="#10b981" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </Card>
 </div>
 </div>
 );
};
