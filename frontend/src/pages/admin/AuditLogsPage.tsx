import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, Filter, ChevronLeft, ChevronRight, Loader2, User } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
 const [moduleFilter, setModuleFilter] = useState('');
 const [page, setPage] = useState(1);

 const { data, isLoading } = useQuery({
 queryKey: ['audit-logs', moduleFilter, page],
 queryFn: () => adminApi.getAuditLogs(moduleFilter || undefined, page),
 });

 const logs = data?.logs || [];
 const pagination = data?.pagination;

 return (
 <div className="space-y-6 animate-in fade-in duration-200">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#111726] to-[#111726] border border-amber-500/20 shadow-xl">
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
 <ShieldAlert className="w-4 h-4" /> Security & System Audit Trail
 </div>
 <h1 className="text-xl font-bold text-white">Immutable Audit Logs Console</h1>
 <p className="text-xs text-slate-400">
 System activity trail recording authentication events, privilege changes, ticket transitions, and SLA adjustments.
 </p>
 </div>
 </div>

 {/* Filter Bar */}
 <Card className="p-3 flex items-center gap-3 text-xs">
 <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Filter by Module:</span>
 <select
 value={moduleFilter}
 onChange={(e) => {
 setModuleFilter(e.target.value);
 setPage(1);
 }}
 className="bg-[#1a2236] border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 <option value="">All Modules</option>
 <option value="AUTH">AUTH</option>
 <option value="TICKET">TICKET</option>
 <option value="USER_MGMT">USER_MGMT</option>
 <option value="SLA">SLA</option>
 </select>
 </Card>

 {/* Audit Log Table */}
 <Card className="p-0 overflow-hidden border-slate-800">
 {isLoading ? (
 <div className="p-12 text-center text-slate-400 space-y-2">
 <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
 <p className="text-xs">Querying audit trail records...</p>
 </div>
 ) : logs.length === 0 ? (
 <div className="p-12 text-center text-slate-400 space-y-2">
 <Filter className="w-10 h-10 mx-auto text-slate-600" />
 <p className="text-xs">No audit log records found.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="bg-[#1a2236]/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
 <th className="py-3 px-4">Timestamp</th>
 <th className="py-3 px-4">Module</th>
 <th className="py-3 px-4">Action</th>
 <th className="py-3 px-4">Actor</th>
 <th className="py-3 px-4">Record ID</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60">
 {logs.map((log) => (
 <tr key={log.id} className="hover:bg-[#1a2236]/40 transition-colors">
 <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
 {new Date(log.timestamp).toLocaleString()}
 </td>
 <td className="py-3 px-4 font-mono text-[11px]">
 <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
 {log.module}
 </span>
 </td>
 <td className="py-3 px-4 text-slate-200 font-medium">{log.action}</td>
 <td className="py-3 px-4">
 {log.user ? (
 <div className="flex items-center gap-1.5 text-slate-300">
 <User className="w-3.5 h-3.5 text-slate-400" />
 <span>{log.user.fullName}</span>
 <span className="text-[10px] text-slate-500 font-mono">({log.user.role})</span>
 </div>
 ) : (
 <span className="text-slate-500 italic">SYSTEM</span>
 )}
 </td>
 <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">
 {log.recordId || '-'}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Pagination Footer */}
 {pagination && pagination.totalPages > 1 && (
 <div className="p-4 bg-[#090d16] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
 <div>
 Showing page <span className="font-semibold text-slate-200">{page}</span> of{' '}
 <span className="font-semibold text-slate-200">{pagination.totalPages}</span> ({pagination.total} total logs)
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
