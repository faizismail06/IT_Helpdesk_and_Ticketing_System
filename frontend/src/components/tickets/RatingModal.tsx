import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/axios';
import { Button } from '../ui/Button';
import { Star, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface RatingModalProps {
 ticketId: string;
 isOpen: boolean;
 onClose: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ ticketId, isOpen, onClose }) => {
 const queryClient = useQueryClient();
 const [score, setScore] = useState<number>(5);
 const [hoverScore, setHoverScore] = useState<number | null>(null);
 const [feedback, setFeedback] = useState('');
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 const ratingMutation = useMutation({
 mutationFn: () => api.post(`/tickets/${ticketId}/rating`, { score, feedback }),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
 onClose();
 },
 onError: (err: any) => {
 setErrorMsg(err.response?.data?.message || 'Failed to submit rating');
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
 <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
 <Star className="w-5 h-5 fill-amber-400" />
 </div>
 <div>
 <h2 className="text-base font-bold text-white">Rate IT Support Resolution</h2>
 <p className="text-xs text-slate-400">Share your experience to help improve IT services</p>
 </div>
 </div>

 {errorMsg && (
 <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{errorMsg}</span>
 </div>
 )}

 <div className="text-center py-3 space-y-2">
 <div className="text-xs font-semibold text-slate-300">How satisfied were you with the resolution?</div>
 <div className="flex items-center justify-center gap-2">
 {[1, 2, 3, 4, 5].map((star) => {
 const active = (hoverScore || score) >= star;
 return (
 <button
 key={star}
 type="button"
 onClick={() => setScore(star)}
 onMouseEnter={() => setHoverScore(star)}
 onMouseLeave={() => setHoverScore(null)}
 className="p-1.5 focus:outline-none transition-transform hover:scale-110"
 >
 <Star
 className={`w-7 h-7 ${
 active ? 'text-amber-400 fill-amber-400' : 'text-slate-700 fill-slate-800'
 }`}
 />
 </button>
 );
 })}
 </div>
 <div className="text-xs font-mono font-bold text-amber-400">
 {score === 5 && '⭐⭐⭐⭐⭐ Excellent Support'}
 {score === 4 && '⭐⭐⭐⭐ Good Service'}
 {score === 3 && '⭐⭐⭐ Satisfactory'}
 {score === 2 && '⭐⭐ Needs Improvement'}
 {score === 1 && '⭐ Poor Experience'}
 </div>
 </div>

 <div className="space-y-1">
 <label className="block text-xs font-semibold uppercase text-slate-400">
 Feedback Comment (Optional)
 </label>
 <textarea
 rows={3}
 value={feedback}
 onChange={(e) => setFeedback(e.target.value)}
 placeholder="e.g. Masalah terselesaikan dengan cepat dan teknisi sangat profesional."
 className="w-full bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 />
 </div>

 <div className="pt-2 flex items-center gap-2">
 <Button variant="outline" className="w-1/2" onClick={onClose}>
 Skip
 </Button>
 <Button
 variant="primary"
 className="w-1/2"
 isLoading={ratingMutation.isPending}
 onClick={() => ratingMutation.mutate()}
 >
 <CheckCircle2 className="w-3.5 h-3.5" /> Submit Rating
 </Button>
 </div>
 </div>
 </div>
 );
};
