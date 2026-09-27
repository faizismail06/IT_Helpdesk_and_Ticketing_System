import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '../../api/tickets';
import { kbApi } from '../../api/kb';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PlusCircle, ArrowLeft, BookOpen, AlertCircle, Search } from 'lucide-react';

const ticketFormSchema = z.object({
 subject: z.string().min(5, 'Subject must be at least 5 characters long').max(200),
 description: z.string().min(10, 'Detailed description must be at least 10 characters long'),
 categoryId: z.string().min(1, 'Please select an IT category'),
 impact: z.enum(['INDIVIDUAL', 'TEAM', 'DEPARTMENT', 'ORGANIZATION']),
 urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
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
 impact: 'INDIVIDUAL',
 urgency: 'MEDIUM',
 },
 });

 const subjectWatch = watch('subject');
 const impactWatch = watch('impact');
 const urgencyWatch = watch('urgency');

 const priorityMatrix = {
 INDIVIDUAL: { LOW: 'LOW', MEDIUM: 'LOW', HIGH: 'MEDIUM', CRITICAL: 'HIGH' },
 TEAM: { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CRITICAL: 'HIGH' },
 DEPARTMENT: { LOW: 'MEDIUM', MEDIUM: 'HIGH', HIGH: 'HIGH', CRITICAL: 'CRITICAL' },
 ORGANIZATION: { LOW: 'HIGH', MEDIUM: 'HIGH', HIGH: 'CRITICAL', CRITICAL: 'CRITICAL' },
 } as const;
 const suggestedPriority = priorityMatrix[impactWatch][urgencyWatch];
 const { data: suggestedArticles = [], isFetching: isSearchingKb } = useQuery({
 queryKey: ['kb-suggestions', subjectWatch],
 queryFn: () => kbApi.getArticles(subjectWatch),
 enabled: subjectWatch.trim().length >= 4,
 });

 const createMutation = useMutation({
 mutationFn: ticketApi.createTicket,
 onSuccess: (newTicket) => {
 queryClient.invalidateQueries({ queryKey: ['tickets'] });
 queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Impact Scope *</label>
 <select {...register('impact')} className="w-full bg-[#111726] border border-slate-800 text-slate-100 text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
 <option value="INDIVIDUAL">Only me</option>
 <option value="TEAM">Several people / one team</option>
 <option value="DEPARTMENT">An entire department</option>
 <option value="ORGANIZATION">The whole organization</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Operational Urgency *</label>
 <select {...register('urgency')} className="w-full bg-[#111726] border border-slate-800 text-slate-100 text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
 <option value="LOW">Work can continue normally</option>
 <option value="MEDIUM">Work is disrupted; workaround exists</option>
 <option value="HIGH">Core work is blocked</option>
 <option value="CRITICAL">Critical service or security incident</option>
 </select>
 </div>
 </div>

 <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#090d16] text-xs">
 <div><div className="font-semibold text-slate-200">System priority recommendation</div><div className="text-slate-500">Helpdesk will review this during triage.</div></div>
 <span className="font-mono font-bold text-blue-400">{suggestedPriority}</span>
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
 <Search className="w-4 h-4" />
 <span>Knowledge Base Suggestions</span>
 </div>
 <p className="text-xs text-slate-400 leading-relaxed">
 As you type your subject, relevant Knowledge Base troubleshooting articles will automatically be suggested here to help resolve your issue instantly.
 </p>

 {subjectWatch.trim().length >= 4 && <div className="space-y-2 text-xs">{isSearchingKb && <p className="text-slate-500">Searching articles...</p>}{suggestedArticles.slice(0, 3).map((article) => <button type="button" key={article.id} onClick={() => navigate('/knowledge-base')} className="w-full text-left p-3 rounded-lg bg-[#111726] border border-slate-800 hover:border-blue-500/40"><span className="flex items-center gap-1.5 text-slate-200 font-semibold"><BookOpen className="w-3.5 h-3.5 text-blue-400" />{article.title}</span><span className="block text-[10px] text-slate-500 mt-1">{article.category}</span></button>)}{!isSearchingKb && suggestedArticles.length === 0 && <p className="text-slate-500">No matching article found.</p>}</div>}
 </Card>

 <Card className="space-y-2 text-xs">
 <h3 className="font-semibold text-slate-200">Priority and SLA</h3>
 <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
 <li>Final priority is confirmed by Helpdesk during triage.</li>
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
