import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketApi } from '../../api/tickets';
import { TicketStatusBadge } from '../../components/tickets/TicketStatusBadge';
import { TicketPriorityBadge } from '../../components/tickets/TicketPriorityBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { TicketPriority, TicketStatus } from '../../types/ticket';
import { Search, PlusCircle, Filter, ChevronLeft, ChevronRight, Loader2, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const TicketListPage: React.FC = () => {
 const navigate = useNavigate();
 const { user } = useAuth();
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('');
 const [selectedPriority, setSelectedPriority] = useState<TicketPriority | ''>('');
 const [selectedCategory, setSelectedCategory] = useState('');
 const [page, setPage] = useState(1);

 const { data: categories = [] } = useQuery({
 queryKey: ['categories'],
 queryFn: ticketApi.getCategories,
 });

 const { data, isLoading, refetch, isFetching } = useQuery({
 queryKey: ['tickets', searchQuery, selectedStatus, selectedPriority, selectedCategory, page],
 queryFn: () =>
 ticketApi.getTickets({
 q: searchQuery || undefined,
 status: (selectedStatus as TicketStatus) || undefined,
 priority: (selectedPriority as TicketPriority) || undefined,
 categoryId: selectedCategory || undefined,
 page,
 limit: 10,
 }),
 });

 const tickets = data?.tickets || [];
 const pagination = data?.pagination;

 return (
 <div className="space-y-5 animate-in fade-in duration-200">
 {/* Top Header Controls */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl font-bold text-white">IT Service Ticket Center</h1>
 <p className="text-xs text-slate-400">Search, filter, triage, and track resolution lifecycles</p>
 </div>

 <div className="flex items-center gap-2">
 <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching}>
 <RefreshCw className="w-3.5 h-3.5" />
 Refresh
 </Button>
 {user?.role === 'EMPLOYEE' && <Button variant="primary" size="sm" onClick={() => navigate('/tickets/new')}>
 <PlusCircle className="w-4 h-4" />
 Submit New Ticket
 </Button>}
 </div>
 </div>

 {/* Search & Filter Bar */}
 <Card className="p-4 space-y-3">
 <div className="flex flex-col md:flex-row items-center gap-3">
 <div className="w-full md:w-80">
 <Input
 placeholder="Search ID (e.g. IT-2026-000001), subject..."
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setPage(1);
 }}
 icon={<Search className="w-4 h-4" />}
 />
 </div>

 <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
 {/* Status Selector */}
 <select
 value={selectedStatus}
 onChange={(e) => {
 setSelectedStatus(e.target.value as TicketStatus);
 setPage(1);
 }}
 className="bg-[#1a2236] border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
 >
 <option value="">All Statuses</option>
 <option value="NEW">NEW</option>
 <option value="OPEN">OPEN</option>
 <option value="IN_PROGRESS">IN PROGRESS</option>
 <option value="PENDING">PENDING</option>
 <option value="RESOLVED">RESOLVED</option>
 <option value="CLOSED">CLOSED</option>
 </select>

 {/* Priority Selector */}
 <select
 value={selectedPriority}
 onChange={(e) => {
 setSelectedPriority(e.target.value as TicketPriority);
 setPage(1);
 }}
 className="bg-[#1a2236] border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
 >
 <option value="">All Priorities</option>
 <option value="CRITICAL">CRITICAL</option>
 <option value="HIGH">HIGH</option>
 <option value="MEDIUM">MEDIUM</option>
 <option value="LOW">LOW</option>
 </select>

 {/* Category Selector */}
 <select
 value={selectedCategory}
 onChange={(e) => {
 setSelectedCategory(e.target.value);
 setPage(1);
 }}
 className="bg-[#1a2236] border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
 >
 <option value="">All Categories</option>
 {categories.map((c) => (
 <option key={c.id} value={c.id}>
 {c.name}
 </option>
 ))}
 </select>

 {(selectedStatus || selectedPriority || selectedCategory || searchQuery) && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => {
 setSearchQuery('');
 setSelectedStatus('');
 setSelectedPriority('');
 setSelectedCategory('');
 setPage(1);
 }}
 >
 Clear Filters
 </Button>
 )}
 </div>
 </div>
 </Card>

 {/* Dense Data Table */}
 <Card className="p-0 overflow-hidden border-slate-800">
 {isLoading ? (
 <div className="p-12 text-center text-slate-400 space-y-2">
 <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
 <p className="text-xs font-medium">Querying IT Helpdesk records...</p>
 </div>
 ) : tickets.length === 0 ? (
 <div className="p-12 text-center text-slate-400 space-y-3">
 <Filter className="w-10 h-10 mx-auto text-slate-600" />
 <h3 className="text-sm font-semibold text-slate-200">No Tickets Found</h3>
 <p className="text-xs text-slate-500 max-w-sm mx-auto">
 No tickets match your query criteria. Try adjusting filters or create a new ticket.
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="bg-[#1a2236]/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
 <th className="py-3 px-4">Ticket Number</th>
 <th className="py-3 px-4">Subject</th>
 <th className="py-3 px-4">Category</th>
 <th className="py-3 px-4">Priority</th>
 <th className="py-3 px-4">Status</th>
 <th className="py-3 px-4">Requester</th>
 <th className="py-3 px-4">SLA Deadline</th>
 <th className="py-3 px-4 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60">
 {tickets.map((t) => {
 const formattedSla = new Date(t.slaDeadline).toLocaleString('en-US', {
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 });

 return (
 <tr
 key={t.id}
 onClick={() => navigate(`/tickets/${t.id}`)}
 className="hover:bg-[#1a2236]/60 cursor-pointer transition-colors group"
 >
 <td className="py-3.5 px-4 font-mono font-semibold text-blue-400 group-hover:text-blue-300">
 {t.ticketNumber}
 </td>
 <td className="py-3.5 px-4 font-medium text-slate-100 max-w-xs truncate">
 {t.subject}
 </td>
 <td className="py-3.5 px-4 text-slate-400">
 {t.category?.name || 'Uncategorized'}
 </td>
 <td className="py-3.5 px-4">
 <TicketPriorityBadge priority={t.priority} />
 </td>
 <td className="py-3.5 px-4">
 <TicketStatusBadge status={t.status} />
 </td>
 <td className="py-3.5 px-4">
 <div className="text-slate-200 font-medium">{t.requester.fullName}</div>
 <div className="text-[10px] text-slate-500">{t.requester.department?.name}</div>
 </td>
 <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
 <div className="flex items-center gap-1.5">
 <Clock className="w-3.5 h-3.5 text-slate-500" />
 <span>{formattedSla}</span>
 </div>
 </td>
 <td className="py-3.5 px-4 text-right">
 <span className="text-xs text-blue-400 group-hover:underline font-medium">
 View details {'->'}
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}

 {/* Pagination Footer */}
 {pagination && pagination.totalPages > 1 && (
 <div className="p-4 bg-[#090d16] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
 <div>
 Showing <span className="font-semibold text-slate-200">{(page - 1) * pagination.limit + 1}</span> to{' '}
 <span className="font-semibold text-slate-200">
 {Math.min(page * pagination.limit, pagination.total)}
 </span>{' '}
 of <span className="font-semibold text-slate-200">{pagination.total}</span> tickets
 </div>

 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 disabled={page === 1}
 >
 <ChevronLeft className="w-4 h-4" /> Previous
 </Button>
 <span className="font-mono text-xs px-2">
 Page {page} of {pagination.totalPages}
 </span>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
 disabled={page >= pagination.totalPages}
 >
 Next <ChevronRight className="w-4 h-4" />
 </Button>
 </div>
 </div>
 )}
 </Card>
 </div>
 );
};
