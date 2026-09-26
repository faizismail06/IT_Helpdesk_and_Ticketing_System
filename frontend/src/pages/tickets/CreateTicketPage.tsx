import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '../../api/tickets';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PlusCircle, ArrowLeft, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

const ticketFormSchema = z.object({
 subject: z.string().min(5, 'Subject must be at least 5 characters long').max(200),
 description: z.string().min(10, 'Detailed description must be at least 10 characters long'),
 categoryId: z.string().min(1, 'Please select an IT category'),
 priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export const CreateTicketPage: React.FC = () => {
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 const { data: categories = [] } = useQuery({
 queryKey: ['categories'],
 queryFn: ticketApi.getCategories,
 });

 const {
 register,
 handleSubmit,
 watch,
 formState: { errors },
 } = useForm<TicketFormValues>({
 resolver: zodResolver(ticketFormSchema),
 defaultValues: {
 subject: '',
 description: '',
 categoryId: '',
 priority: 'MEDIUM',
 },
 });

 const subjectWatch = watch('subject');

 const createMutation = useMutation({
 mutationFn: ticketApi.createTicket,
 onSuccess: (newTicket) => {
 queryClient.invalidateQueries({ queryKey: ['tickets'] });
 navigate(`/tickets/${newTicket.id}`);
 },
 onError: (err: any) => {
 setErrorMsg(err.response?.data?.message || 'Failed to submit ticket. Please check input.');
 },
 });

 const onSubmit = (values: TicketFormValues) => {
 setErrorMsg(null);
 createMutation.mutate(values as any);
 };

 return (
 <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
 {/* Top Controls */}
 <div className="flex items-center justify-between">
 <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
 <ArrowLeft className="w-4 h-4" /> Back to Dashboard
 </Button>
 <div className="text-xs text-slate-400 font-mono">
 Ticket Format: <span className="text-blue-400">IT-2026-XXXXXX</span>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Main Form */}
 <div className="lg:col-span-2 space-y-4">
 <Card className="space-y-5">
 <div className="border-b border-slate-800 pb-3">
 <h1 className="text-lg font-bold text-white flex items-center gap-2">
 <PlusCircle className="w-5 h-5 text-blue-400" />
 Submit New IT Helpdesk Ticket
 </h1>
 <p className="text-xs text-slate-400">
 Provide comprehensive information so our helpdesk can triage and assign your ticket efficiently.
 </p>
 </div>

 {errorMsg && (
 <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{errorMsg}</span>
 </div>
 )}

 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 <Input
 label="Ticket Subject / Summary *"
 placeholder="e.g. Outlook email sync failing after password change"
 error={errors.subject?.message}
 {...register('subject')}
 />

 {/* Category Dropdown */}
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
 IT Issue Category *
 </label>
 <select
 {...register('categoryId')}
 className="w-full bg-[#111726] border border-slate-800 text-slate-100 text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 <option value="">-- Select Category --</option>
 {categories.map((c) => (
 <option key={c.id} value={c.id}>
 {c.name}
 </option>
 ))}
 </select>
 {errors.categoryId && (
 <p className="mt-1 text-xs text-rose-400 font-medium">{errors.categoryId.message}</p>
 )}
 </div>

 {/* Priority Selector */}
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
 Priority Level *
 </label>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
 {[
 { id: 'LOW', label: 'LOW (72h SLA)', color: 'border-emerald-500/30 text-emerald-400' },
 { id: 'MEDIUM', label: 'MEDIUM (24h SLA)', color: 'border-amber-500/30 text-amber-400' },
 { id: 'HIGH', label: 'HIGH (8h SLA)', color: 'border-orange-500/30 text-orange-400' },
 { id: 'CRITICAL', label: 'CRITICAL (4h SLA)', color: 'border-rose-500/30 text-rose-400' },
 ].map((p) => (
 <label
 key={p.id}
 className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-800 bg-[#1a2236]/40 hover:bg-[#1a2236] cursor-pointer text-xs font-medium text-slate-300"
 >
 <input
 type="radio"
 value={p.id}
 {...register('priority')}
 className="text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
 />
 <span className={p.color}>{p.label}</span>
 </label>
 ))}
 </div>
 </div>

 {/* Detailed Description */}
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
 Detailed Issue Description *
 </label>
 <textarea
 rows={5}
 placeholder="Describe error messages, symptoms, steps to reproduce, or affected hardware..."
 {...register('description')}
 className="w-full bg-[#111726] border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-lg p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 />
 {errors.description && (
 <p className="mt-1 text-xs text-rose-400 font-medium">{errors.description.message}</p>
 )}
 </div>

 <Button
 type="submit"
 variant="primary"
 className="w-full mt-2"
 isLoading={createMutation.isPending}
 >
 Submit IT Ticket
 </Button>
 </form>
 </Card>
 </div>

 {/* KB Deflection & Help Panel */}
 <div className="space-y-4">
 <Card className="border-blue-500/20 bg-blue-500/5 space-y-3">
 <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
 <Sparkles className="w-4 h-4 text-amber-400" />
 <span>Smart KB Deflection</span>
 </div>
 <p className="text-xs text-slate-400 leading-relaxed">
 As you type your subject, relevant Knowledge Base troubleshooting articles will automatically be suggested here to help resolve your issue instantly.
 </p>

 {subjectWatch && subjectWatch.length > 3 && (
 <div className="p-3 rounded-lg bg-[#111726] border border-slate-800 space-y-2 text-xs">
 <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
 <BookOpen className="w-3.5 h-3.5 text-blue-400" />
 Suggested Article:
 </div>
 <p className="text-slate-300 font-medium hover:underline cursor-pointer">
 How to reset company Outlook password & clear cached credentials
 </p>
 </div>
 )}
 </Card>

 <Card className="space-y-2 text-xs">
 <h3 className="font-semibold text-slate-200">SLA Resolution Times</h3>
 <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
 <li>• Critical: 4 Hours Response/Fix</li>
 <li>• High: 8 Hours Fix</li>
 <li>• Medium: 24 Hours Fix</li>
 <li>• Low: 72 Hours Fix</li>
 </ul>
 </Card>
 </div>
 </div>
 </div>
 );
};
