import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../../api/workflow';
import { Button } from '../ui/Button';
import { Wrench, X, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { TicketPriority } from '../../types/ticket';

interface TriageAssignModalProps {
 ticketId: string;
 isOpen: boolean;
 onClose: () => void;
 suggestedPriority: TicketPriority;
 currentPriority: TicketPriority;
}

export const TriageAssignModal: React.FC<TriageAssignModalProps> = ({ ticketId, isOpen, onClose, suggestedPriority, currentPriority }) => {
 const queryClient = useQueryClient();
 const [selectedTechId, setSelectedTechId] = useState('');
 const [finalPriority, setFinalPriority] = useState<TicketPriority>(currentPriority || suggestedPriority);
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 const { data: technicians = [], isLoading } = useQuery({
 queryKey: ['technicians'],
 queryFn: workflowApi.getTechnicians,
 enabled: isOpen,
 });

 const assignMutation = useMutation({
 mutationFn: () => workflowApi.assignTechnician(ticketId, { technicianId: selectedTechId, priority: finalPriority }),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
 queryClient.invalidateQueries({ queryKey: ['tickets'] });
 queryClient.invalidateQueries({ queryKey: ['dashboard'] });
 onClose();
 },
 onError: (err: any) => {
 setErrorMsg(err.response?.data?.message || 'Failed to assign technician');
 },
 });

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
 <div className="w-full max-w-md bg-[#111726] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 relative">
 <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
 <X className="w-5 h-5" />
 </button>

 <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
 <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
 <Wrench className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-base font-bold text-white">Triage and Assign Ticket</h2>
 <p className="text-xs text-slate-400">Confirm priority, SLA, and responsible technician</p>
 </div>
 </div>

 {errorMsg && (
 <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{errorMsg}</span>
 </div>
 )}

 <div className="space-y-2 text-xs">
 <div className="flex items-center justify-between text-slate-400"><span>System recommendation</span><span className="font-mono font-bold text-blue-400">{suggestedPriority}</span></div>
 <label className="block font-semibold text-slate-300">Final Priority</label>
 <select value={finalPriority} onChange={(event) => setFinalPriority(event.target.value as TicketPriority)} className="w-full bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
 <option value="LOW">LOW - 72 hour SLA</option>
 <option value="MEDIUM">MEDIUM - 24 hour SLA</option>
 <option value="HIGH">HIGH - 8 hour SLA</option>
 <option value="CRITICAL">CRITICAL - 4 hour SLA</option>
 </select>
 </div>

 <div className="space-y-2 max-h-60 overflow-y-auto">
 {isLoading ? (
 <div className="p-4 text-center text-xs text-slate-400">Loading technician directory...</div>
 ) : technicians.length === 0 ? (
 <div className="p-4 text-center text-xs text-slate-400">No available technicians found</div>
 ) : (
 technicians.map((tech: any) => {
 const isSelected = selectedTechId === tech.id;
 return (
 <button
 key={tech.id}
 onClick={() => setSelectedTechId(tech.id)}
 className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
 isSelected
 ? 'border-blue-500/50 bg-blue-500/10 text-white'
 : 'border-slate-800 bg-[#1a2236]/40 hover:bg-[#1a2236] text-slate-300'
 }`}
 >
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
 <User className="w-4 h-4" />
 </div>
 <div>
 <div className="font-semibold">{tech.fullName}</div>
 <div className="text-[10px] text-slate-400">{tech.email}</div>
 </div>
 </div>
 {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
 </button>
 );
 })
 )}
 </div>

 <div className="pt-2 flex items-center gap-2">
 <Button variant="outline" className="w-1/2" onClick={onClose}>
 Cancel
 </Button>
 <Button
 variant="primary"
 className="w-1/2"
 disabled={!selectedTechId}
 isLoading={assignMutation.isPending}
 onClick={() => assignMutation.mutate()}
 >
 Confirm Assignment
 </Button>
 </div>
 </div>
 </div>
 );
};
