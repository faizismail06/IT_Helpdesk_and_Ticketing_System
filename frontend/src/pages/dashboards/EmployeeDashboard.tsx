import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Loader2, PlusCircle, Ticket } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TicketStatusBadge } from '../../components/tickets/TicketStatusBadge';

export const EmployeeDashboard: React.FC = () => {
 const navigate = useNavigate();
 const { user } = useAuth();
 const { data, isLoading, isError, error, refetch } = useQuery({
 queryKey: ['dashboard', user?.id, user?.role],
 queryFn: dashboardApi.getStats,
 enabled: Boolean(user),
 });

 if (isLoading) {
 return <div className="min-h-[50vh] flex items-center justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /></div>;
 }

 if (isError) {
 return <DashboardError message={(error as any)?.response?.data?.message} onRetry={() => refetch()} />;
 }

 const stats = [
 { title: 'Total Tickets', value: data?.total ?? 0, icon: Ticket, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
 { title: 'Open Tickets', value: data?.open ?? 0, icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
 { title: 'In Progress', value: data?.inProgress ?? 0, icon: AlertCircle, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
 { title: 'Resolved & Closed', value: (data?.resolved ?? 0) + (data?.closed ?? 0), icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
 ];

 return (
 <div className="space-y-6 animate-in fade-in duration-200">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
 <div><h1 className="text-xl font-bold text-white">Employee Service Portal</h1><p className="text-xs text-slate-400">Submit IT issues and track their resolution.</p></div>
 <Button variant="primary" onClick={() => navigate('/tickets/new')}><PlusCircle className="w-4 h-4" />Create New Ticket</Button>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {stats.map(({ title, value, icon: Icon, color }) => <Card key={title} className="flex items-center gap-4"><div className={`p-3 rounded-lg border ${color}`}><Icon className="w-6 h-6" /></div><div><div className="text-2xl font-bold text-white">{value}</div><div className="text-xs text-slate-400">{title}</div></div></Card>)}
 </div>
 <Card className="space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-slate-800"><div><h2 className="text-sm font-bold text-white">Recent Tickets</h2><p className="text-xs text-slate-400">Your latest submitted requests</p></div><Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>View All <ArrowRight className="w-3.5 h-3.5" /></Button></div>
 <div className="divide-y divide-slate-800/80">
 {(data?.recentTickets ?? []).length === 0 ? <p className="py-8 text-center text-xs text-slate-500">No tickets submitted yet.</p> : data.recentTickets.map((item: any) => (
 <button key={item.id} onClick={() => navigate(`/tickets/${item.id}`)} className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-slate-900/50 rounded-lg">
 <div><div className="flex items-center gap-2"><span className="font-mono text-blue-400 font-semibold text-xs">{item.ticketNumber}</span><span className="text-slate-200 text-xs">{item.subject}</span></div><span className="text-[11px] text-slate-500">{item.category?.name}</span></div>
 <TicketStatusBadge status={item.status} />
 </button>
 ))}
 </div>
 </Card>
 </div>
 );
};

const DashboardError = ({ message, onRetry }: { message?: string; onRetry: () => void }) => (
 <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center"><AlertCircle className="w-8 h-8 text-rose-400" /><div><h2 className="text-sm font-semibold text-white">Unable to load dashboard</h2><p className="text-xs text-slate-400">{message || 'The server could not return dashboard data.'}</p></div><Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button></div>
);
