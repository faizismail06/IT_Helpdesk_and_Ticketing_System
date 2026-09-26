import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../../api/workflow';
import { TicketComment } from '../../types/ticket';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Lock, Send, User, AlertCircle } from 'lucide-react';

interface ConversationThreadProps {
 ticketId: string;
 comments?: TicketComment[];
}

export const ConversationThread: React.FC<ConversationThreadProps> = ({ ticketId, comments = [] }) => {
 const queryClient = useQueryClient();
 const { user: currentUser } = useAuth();
 const [message, setMessage] = useState('');
 const [isInternal, setIsInternal] = useState(false);
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 const isStaffRole = ['HELPDESK', 'TECHNICIAN', 'ADMIN'].includes(currentUser?.role || '');

 // Filter internal notes if user is an Employee
 const visibleComments = comments.filter((c) => {
 if (c.isInternal && currentUser?.role === 'EMPLOYEE') {
 return false;
 }
 return true;
 });

 const commentMutation = useMutation({
 mutationFn: () => workflowApi.addComment(ticketId, { message, isInternal }),
 onSuccess: () => {
 setMessage('');
 setIsInternal(false);
 queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
 },
 onError: (err: any) => {
 setErrorMsg(err.response?.data?.message || 'Failed to post comment');
 },
 });

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!message.trim()) return;
 setErrorMsg(null);
 commentMutation.mutate();
 };

 return (
 <div className="space-y-4">
 {/* Existing Comments List */}
 <div className="space-y-3">
 {visibleComments.length === 0 ? (
 <div className="p-6 text-center text-xs text-slate-500 bg-[#090d16] rounded-xl border border-slate-800/60">
 No public notes or comments posted yet.
 </div>
 ) : (
 visibleComments.map((comment) => {
 const isSelf = comment.user.id === currentUser?.id;
 const isInternalNote = comment.isInternal;

 return (
 <div
 key={comment.id}
 className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
 isInternalNote
 ? 'border-amber-500/30 bg-amber-500/5'
 : isSelf
 ? 'border-blue-500/30 bg-blue-500/5'
 : 'border-slate-800 bg-[#090d16]'
 }`}
 >
 <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
 <User className="w-3.5 h-3.5" />
 </div>
 <span className="font-semibold text-slate-200">{comment.user.fullName}</span>
 <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
 {comment.user.role}
 </span>
 {isInternalNote && (
 <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
 <Lock className="w-3 h-3" /> IT INTERNAL NOTE
 </span>
 )}
 </div>
 <span className="text-[10px] text-slate-500 font-mono">
 {new Date(comment.createdAt).toLocaleString()}
 </span>
 </div>
 <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{comment.message}</p>
 </div>
 );
 })
 )}
 </div>

 {/* Add Comment Form */}
 <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
 {errorMsg && (
 <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{errorMsg}</span>
 </div>
 )}

 {isStaffRole && (
 <div className="flex items-center gap-2 text-xs">
 <button
 type="button"
 onClick={() => setIsInternal(false)}
 className={`px-3 py-1.5 rounded-lg font-medium border transition-colors ${
 !isInternal
 ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
 : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
 }`}
 >
 Public Reply
 </button>
 <button
 type="button"
 onClick={() => setIsInternal(true)}
 className={`px-3 py-1.5 rounded-lg font-medium border transition-colors flex items-center gap-1.5 ${
 isInternal
 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
 : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
 }`}
 >
 <Lock className="w-3.5 h-3.5" /> Internal IT Note
 </button>
 </div>
 )}

 <textarea
 rows={3}
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 placeholder={
 isInternal
 ? 'Add internal technical notes (visible only to IT Support)...'
 : 'Write a response or update...'
 }
 className="w-full bg-[#111726] border border-slate-800 text-slate-100 placeholder-slate-500 text-xs rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 />

 <div className="flex justify-end">
 <Button
 type="submit"
 variant={isInternal ? 'secondary' : 'primary'}
 size="sm"
 disabled={!message.trim()}
 isLoading={commentMutation.isPending}
 >
 <Send className="w-3.5 h-3.5" />
 {isInternal ? 'Post Internal Note' : 'Send Reply'}
 </Button>
 </div>
 </form>
 </div>
 );
};
