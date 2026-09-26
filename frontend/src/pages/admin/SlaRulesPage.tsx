import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, SlaRule } from '../../api/admin';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Clock, ShieldAlert, CheckCircle2, AlertTriangle, Save, Sparkles, RefreshCw } from 'lucide-react';

export const SlaRulesPage: React.FC = () => {
 const queryClient = useQueryClient();
 const [editingValues, setEditingValues] = useState<Record<string, number>>({});
 const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);

 const { data: slaRules = [], isLoading, refetch } = useQuery({
 queryKey: ['sla-rules'],
 queryFn: adminApi.getSlaRules,
 });

 const updateMutation = useMutation({
 mutationFn: ({ id, hours }: { id: string; hours: number }) =>
 adminApi.updateSlaRule(id, hours),
 onSuccess: (updatedRule) => {
 queryClient.invalidateQueries({ queryKey: ['sla-rules'] });
 setSaveSuccessId(updatedRule.id);
 setTimeout(() => setSaveSuccessId(null), 3000);
 },
 });

 const handleValueChange = (id: string, valueStr: string) => {
 const val = parseInt(valueStr, 10);
 if (!isNaN(val) && val >= 1) {
 setEditingValues((prev) => ({ ...prev, [id]: val }));
 }
 };

 const handleSave = (rule: SlaRule) => {
 const hours = editingValues[rule.id] ?? rule.resolutionHours;
 updateMutation.mutate({ id: rule.id, hours });
 };

 const getPriorityTheme = (priority: string) => {
 switch (priority) {
 case 'CRITICAL':
 return {
 bg: 'bg-rose-500/10',
 border: 'border-rose-500/30',
 text: 'text-rose-400',
 badgeBg: 'bg-rose-500/20',
 accent: 'from-rose-500/20 via-[#111726] to-[#111726]',
 icon: ShieldAlert,
 };
 case 'HIGH':
 return {
 bg: 'bg-amber-500/10',
 border: 'border-amber-500/30',
 text: 'text-amber-400',
 badgeBg: 'bg-amber-500/20',
 accent: 'from-amber-500/20 via-[#111726] to-[#111726]',
 icon: AlertTriangle,
 };
 case 'MEDIUM':
 return {
 bg: 'bg-blue-500/10',
 border: 'border-blue-500/30',
 text: 'text-blue-400',
 badgeBg: 'bg-blue-500/20',
 accent: 'from-blue-500/20 via-[#111726] to-[#111726]',
 icon: Clock,
 };
 default:
 return {
 bg: 'bg-slate-500/10',
 border: 'border-slate-500/30',
 text: 'text-slate-400',
 badgeBg: 'bg-slate-500/20',
 accent: 'from-slate-500/20 via-[#111726] to-[#111726]',
 icon: Clock,
 };
 }
 };

 return (
 <div className="space-y-6 animate-in fade-in duration-200">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#111726] to-[#111726] border border-blue-500/20 shadow-xl">
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
 <Clock className="w-4 h-4" /> Service Level Agreement Configurator
 </div>
 <h1 className="text-xl font-bold text-white">SLA Resolution Target Rules</h1>
 <p className="text-xs text-slate-400">
 Configure automated resolution deadline thresholds based on ticket priority levels.
 </p>
 </div>

 <Button variant="outline" size="sm" onClick={() => refetch()} className="self-start sm:self-auto">
 <RefreshCw className="w-4 h-4" /> Refresh Rules
 </Button>
 </div>

 {/* Rules Grid */}
 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {[1, 2, 3, 4].map((i) => (
 <Card key={i} className="p-6 h-48 animate-pulse bg-slate-900/40 border-slate-800">
 <div />
 </Card>
 ))}
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {slaRules.map((rule) => {
 const theme = getPriorityTheme(rule.priority);
 const Icon = theme.icon;
 const currentVal = editingValues[rule.id] ?? rule.resolutionHours;
 const isDirty = currentVal !== rule.resolutionHours;
 const isSaving = updateMutation.isPending && updateMutation.variables?.id === rule.id;
 const isSaved = saveSuccessId === rule.id;

 return (
 <Card
 key={rule.id}
 className={`p-6 relative overflow-hidden bg-gradient-to-br ${theme.accent} border ${theme.border} space-y-5 shadow-xl`}
 >
 {/* Header info */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.text} border ${theme.border}`}>
 <Icon className="w-5 h-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${theme.badgeBg} ${theme.text} border ${theme.border}`}>
 {rule.priority}
 </span>
 <span className="text-[11px] font-mono text-slate-400">Priority Level</span>
 </div>
 <h3 className="text-sm font-bold text-white mt-0.5">
 Target: {rule.resolutionHours} Hours {rule.resolutionHours >= 24 ? `(${(rule.resolutionHours / 24).toFixed(1)} Days)` : ''}
 </h3>
 </div>
 </div>

 {isSaved && (
 <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
 <CheckCircle2 className="w-3.5 h-3.5" /> Updated
 </span>
 )}
 </div>

 {/* Input & Quick Controls */}
 <div className="space-y-3 pt-2 border-t border-slate-800/80">
 <label className="block text-[11px] font-semibold text-slate-300">
 Resolution Time Limit (Hours)
 </label>
 
 <div className="flex items-center gap-3">
 <Input
 type="number"
 min={1}
 max={720}
 value={currentVal}
 onChange={(e) => handleValueChange(rule.id, e.target.value)}
 className="w-32 font-mono text-sm"
 />

 <Button
 variant={isDirty ? 'primary' : 'outline'}
 size="md"
 onClick={() => handleSave(rule)}
 disabled={!isDirty || isSaving}
 >
 <Save className="w-4 h-4" />
 {isSaving ? 'Saving...' : 'Save Rule'}
 </Button>
 </div>

 {/* Quick Presets */}
 <div className="flex items-center gap-2 pt-1">
 <span className="text-[10px] text-slate-500 font-mono">Presets:</span>
 {[2, 4, 8, 24, 48, 72].map((preset) => (
 <button
 key={preset}
 type="button"
 onClick={() => handleValueChange(rule.id, preset.toString())}
 className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
 currentVal === preset
 ? 'bg-blue-600 text-white font-bold'
 : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
 }`}
 >
 {preset}h
 </button>
 ))}
 </div>
 </div>

 {/* Status indicator bar */}
 <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
 <Sparkles className="w-3 h-3 text-blue-400" />
 <span>Tickets created under {rule.priority} priority automatically calculate countdown meters based on this value.</span>
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>
 );
};

export default SlaRulesPage;
