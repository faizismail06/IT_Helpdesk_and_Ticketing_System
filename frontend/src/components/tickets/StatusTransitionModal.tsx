import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../../api/workflow';
import { TicketStatus } from '../../types/ticket';
import { Button } from '../ui/Button';
import { X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface StatusTransitionModalProps {
 ticketId: string;
 targetStatus: TicketStatus;
 isOpen: boolean;
 onClose: () => void;
}

export const StatusTransitionModal: React.FC<StatusTransitionModalProps> = ({
 ticketId,
 targetStatus,
 isOpen,
 onClose,
}) => {
 const queryClient = useQueryClient();
 const [reason, setReason] = useState('');
 const [workTimeMins, setWorkTimeMins] = useState<number>(0);
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 const transitionMutation = useMutation({
 mutationFn: () =>
 workflowApi.changeStatus(ticketId, {
 status: targetStatus,
 reason: reason.trim() || undefined,
 workTimeMins: Number(workTimeMins) || 0,
 }),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
 queryClient.invalidateQueries({ queryKey: ['tickets'] });
 onClose();
 },
 onError: (err: any) => {
 setErrorMsg(err.response?.data?.message || 'Failed to update status');
 },
 });

 if (!isOpen) return null;

 const isResolveAction = targetStatus === 'RESOLVED';

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
 <div className="w-full max-w-md bg-[#111726] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 relative">
 <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
 <X className="w-5 h-5" />
 </button>

 <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
 <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
 <CheckCircle2 className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-base font-bold text-white">Transition to {targetStatus}</h2>
 <p className="text-xs text-slate-400">Confirm status update & log resolution notes</p>
 </div>
 </div>

 {errorMsg && (
 <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{errorMsg}</span>
 </div>
 )}

 <div className="space-y-3 text-xs">
 <div>
 <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">
 {isResolveAction ? 'Resolution Details / Notes *' : 'Update Reason / Notes (Optional)'}
 </label>
 <textarea
 rows={3}
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 placeholder={
 isResolveAction
 ? 'Describe technical fix provided (e.g. Replaced RAM stick, updated driver to v2.4)...'
 : 'Add context for status change...'
 }
 className="w-full bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 />
 </div>

 {(isResolveAction || targetStatus === 'IN_PROGRESS') && (
 <div>
 <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] flex items-center gap-1">
 <Clock className="w-3.5 h-3.5 text-blue-400" /> Log Work Effort (Minutes)
 </label>
 <input
 type="number"
 min={0}
 value={workTimeMins}
 onChange={(e) => setWorkTimeMins(Number(e.target.value))}
 className="w-full bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
 />
 </div>
 )}
 </div>

 <div className="pt-2 flex items-center gap-2">
 <Button variant="outline" className="w-1/2" onClick={onClose}>
 Cancel
 </Button>
 <Button
 variant="primary"
 className="w-1/2"
 isLoading={transitionMutation.isPending}
 onClick={() => transitionMutation.mutate()}
 >
 Confirm Status Update
 </Button>
 </div>
 </div>
 </div>
 );
};
