import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketApi } from '../../api/tickets';
import { TicketStatusBadge } from '../../components/tickets/TicketStatusBadge';
import { TicketPriorityBadge } from '../../components/tickets/TicketPriorityBadge';
import { SlaCountdownMeter } from '../../components/tickets/SlaCountdownMeter';
import { TriageAssignModal } from '../../components/tickets/TriageAssignModal';
import { StatusTransitionModal } from '../../components/tickets/StatusTransitionModal';
import { ConversationThread } from '../../components/tickets/ConversationThread';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { TicketStatus } from '../../types/ticket';
import {
 ArrowLeft,
 User,
 Shield,
 MessageSquare,
 FileText,
 Loader2,
 AlertTriangle,
 History,
 Wrench,
 CheckCircle2,
 RotateCcw,
} from 'lucide-react';

export const TicketDetailPage: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { user: currentUser } = useAuth();

 const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
 const [transitionTargetStatus, setTransitionTargetStatus] = useState<TicketStatus | null>(null);

 const { data: ticket, isLoading, isError, error } = useQuery({
 queryKey: ['ticket', id],
 queryFn: () => ticketApi.getTicketById(id!),
 enabled: Boolean(id),
 });

 if (isLoading) {
 return (
 <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 text-slate-400">
 <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
 <p className="text-xs font-medium">Fetching ticket details...</p>
 </div>
 );
 }

 if (isError || !ticket) {
 return (
 <div className="p-8 text-center space-y-4 max-w-md mx-auto">
 <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 w-fit mx-auto border border-rose-500/20">
 <AlertTriangle className="w-8 h-8" />
 </div>
 <h2 className="text-lg font-bold text-white">Ticket Not Found or Access Denied</h2>
 <p className="text-xs text-slate-400">
 {(error as any)?.response?.data?.message || 'Unable to retrieve ticket details.'}
 </p>
 <Button variant="secondary" onClick={() => navigate('/tickets')}>
 Return to Ticket Queue
 </Button>
 </div>
 );
 }

 const assignedTech =
 ticket.assignments && ticket.assignments.length > 0 ? ticket.assignments[0].technician : null;

 const isHelpdeskOrAdmin = ['HELPDESK', 'ADMIN'].includes(currentUser?.role || '');
 const isTechnician = currentUser?.role === 'TECHNICIAN';
 const isRequester = currentUser?.id === ticket.requesterId;

 return (
 <div className="space-y-6 animate-in fade-in duration-200">
 {/* Top Control Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
 <div className="flex items-center gap-3">
 <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
 <ArrowLeft className="w-4 h-4" /> Back
 </Button>
 <div className="h-4 w-[1px] bg-slate-800" />
 <span className="font-mono text-lg font-bold text-blue-400 tracking-wider">
 {ticket.ticketNumber}
 </span>
 <TicketStatusBadge status={ticket.status} />
 <TicketPriorityBadge priority={ticket.priority} />
 </div>

 {/* Quick Workflow Action Buttons */}
 <div className="flex flex-wrap items-center gap-2">
 {/* Helpdesk Assignment Trigger */}
 {isHelpdeskOrAdmin && !['RESOLVED', 'CLOSED'].includes(ticket.status) && (
 <Button variant="primary" size="sm" onClick={() => setIsAssignModalOpen(true)}>
 <Wrench className="w-3.5 h-3.5" />
 {assignedTech ? 'Reassign Technician' : 'Assign Technician'}
 </Button>
 )}

 {/* Technician Action Buttons */}
 {(isTechnician || isHelpdeskOrAdmin) && ticket.status === 'OPEN' && (
 <Button variant="primary" size="sm" onClick={() => setTransitionTargetStatus('IN_PROGRESS')}>
 Start Work (In Progress)
 </Button>
 )}

 {(isTechnician || isHelpdeskOrAdmin) && ticket.status === 'IN_PROGRESS' && (
 <>
 <Button variant="secondary" size="sm" onClick={() => setTransitionTargetStatus('PENDING')}>
 Mark Pending Input
 </Button>
 <Button variant="primary" size="sm" onClick={() => setTransitionTargetStatus('RESOLVED')}>
 <CheckCircle2 className="w-3.5 h-3.5" /> Submit Resolution
 </Button>
 </>
 )}

 {/* Requester Confirm Resolution or Reopen */}
 {(isRequester || isHelpdeskOrAdmin) && ticket.status === 'RESOLVED' && (
 <>
 <Button variant="primary" size="sm" onClick={() => setTransitionTargetStatus('CLOSED')}>
 <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Close Ticket
 </Button>
 <Button variant="danger" size="sm" onClick={() => setTransitionTargetStatus('REOPENED')}>
 <RotateCcw className="w-3.5 h-3.5" /> Reopen Ticket
 </Button>
 </>
 )}
 </div>
 </div>

 {/* Main Grid Layout */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Left Column: Problem Details & Activity Thread */}
 <div className="lg:col-span-2 space-y-6">
 {/* Problem Statement Card */}
 <Card className="space-y-4">
 <div>
 <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
 Category: {ticket.category?.name || 'Uncategorized'}
 </span>
 <h1 className="text-xl font-bold text-white mt-1 leading-snug">{ticket.subject}</h1>
 </div>

 <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800/80 space-y-2">
 <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
 <FileText className="w-4 h-4 text-blue-400" />
 Problem Statement & Issue Details
 </div>
 <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
 {ticket.description}
 </p>
 </div>
 </Card>

 {/* Activity & Conversation Thread */}
 <Card className="space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-slate-800">
 <h2 className="text-sm font-bold text-white flex items-center gap-2">
 <MessageSquare className="w-4 h-4 text-blue-400" />
 Communication Thread & Work Logs
 </h2>
 </div>

 <ConversationThread ticketId={ticket.id} comments={ticket.comments} />
 </Card>

 {/* Audit History Timeline */}
 {ticket.history && ticket.history.length > 0 && (
 <Card className="space-y-3">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
 <History className="w-4 h-4 text-slate-400" />
 System Lifecycle Audit History
 </h3>
 <div className="space-y-2">
 {ticket.history.map((h) => (
 <div
 key={h.id}
 className="p-3 rounded-lg bg-[#090d16] border border-slate-800/60 text-xs flex items-center justify-between"
 >
 <div className="flex items-center gap-2 text-slate-300">
 <span className="font-semibold text-slate-200">{h.actor.fullName}</span>
 <span className="text-slate-400">{h.newValue || h.action}</span>
 </div>
 <span className="text-[10px] text-slate-500 font-mono">
 {new Date(h.timestamp).toLocaleString()}
 </span>
 </div>
 ))}
 </div>
 </Card>
 )}
 </div>

 {/* Right Column: Metadata Panel */}
 <div className="space-y-4">
 {/* SLA Dynamic Countdown Meter */}
 <SlaCountdownMeter
 createdAt={ticket.createdAt}
 slaDeadline={ticket.slaDeadline}
 isOverdue={ticket.isOverdue}
 status={ticket.status}
 />

 {/* Requester Info Card */}
 <Card className="space-y-3 text-xs">
 <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
 <User className="w-4 h-4 text-blue-400" />
 Requester Profile
 </h3>
 <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-1.5">
 <div className="font-semibold text-slate-100">{ticket.requester.fullName}</div>
 <div className="text-slate-400">{ticket.requester.email}</div>
 <div className="text-[11px] font-mono text-slate-500">
 Department: {ticket.requester.department?.name || 'N/A'}
 </div>
 </div>
 </Card>

 {/* Assigned Technician Info */}
 <Card className="space-y-3 text-xs">
 <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
 <Shield className="w-4 h-4 text-emerald-400" />
 Assigned IT Specialist
 </h3>
 {assignedTech ? (
 <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-1">
 <div className="font-semibold text-emerald-300">{assignedTech.fullName}</div>
 <div className="text-slate-400">{assignedTech.email}</div>
 </div>
 ) : (
 <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800/60 text-slate-500 italic text-center">
 Unassigned (Awaiting Triage)
 </div>
 )}
 </Card>

 {/* Work Effort & System Dates */}
 <Card className="space-y-2 text-xs text-slate-400 font-mono text-[11px]">
 <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
 <span>Created Date:</span>
 <span className="text-slate-200">{new Date(ticket.createdAt).toLocaleDateString()}</span>
 </div>
 <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
 <span>Updated Date:</span>
 <span className="text-slate-200">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
 </div>
 <div className="flex items-center justify-between py-1">
 <span>Work Time Logged:</span>
 <span className="text-slate-200 font-bold text-amber-400">{ticket.workTimeMins || 0} mins</span>
 </div>
 </Card>
 </div>
 </div>

 {/* Modals */}
 <TriageAssignModal
 ticketId={ticket.id}
 isOpen={isAssignModalOpen}
 onClose={() => setIsAssignModalOpen(false)}
 />

 {transitionTargetStatus && (
 <StatusTransitionModal
 ticketId={ticket.id}
 targetStatus={transitionTargetStatus}
 isOpen={Boolean(transitionTargetStatus)}
 onClose={() => setTransitionTargetStatus(null)}
 />
 )}
 </div>
 );
};
