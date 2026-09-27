import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Users, PlusCircle, KeyRound, CheckCircle2, XCircle, X, Loader2, Mail, UserCheck, AlertCircle } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
 const queryClient = useQueryClient();
 const [isCreateOpen, setIsCreateOpen] = useState(false);
 const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

 // Form state
 const [email, setEmail] = useState('');
 const [fullName, setFullName] = useState('');
 const [password, setPassword] = useState('');
 const [role, setRole] = useState('EMPLOYEE');
 const [departmentId, setDepartmentId] = useState('');
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 const { data: users = [], isLoading } = useQuery({
 queryKey: ['admin-users'],
 queryFn: adminApi.getUsers,
 });

 const { data: departments = [] } = useQuery({
 queryKey: ['departments'],
 queryFn: adminApi.getDepartments,
 });

 const toggleStatusMutation = useMutation({
 mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
 adminApi.toggleUserStatus(id, isActive),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['admin-users'] });
 },
 });

 const resetPasswordMutation = useMutation({
 mutationFn: (userId: string) => adminApi.resetPassword(userId),
 onSuccess: (data) => {
 setResetSuccessMsg(`Password for ${data.email} reset to: ${data.defaultPassword}`);
 setTimeout(() => setResetSuccessMsg(null), 8000);
 },
 });

 const createUserMutation = useMutation({
 mutationFn: adminApi.createUser,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['admin-users'] });
 setIsCreateOpen(false);
 setEmail('');
 setFullName('');
 setErrorMsg(null);
 },
 onError: (err: any) => {
 setErrorMsg(err.response?.data?.message || 'Failed to create user');
 },
 });

 const handleCreateSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!email.trim() || !fullName.trim() || !departmentId) {
 setErrorMsg('Please fill in all required fields');
 return;
 }
 createUserMutation.mutate({
 email,
 fullName,
 password,
 role,
 departmentId,
 });
 };

 return (
 <div className="space-y-6 animate-in fade-in duration-200">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-[#111726] to-[#111726] border border-emerald-500/20 shadow-xl">
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
 <Users className="w-4 h-4" /> User Account Directory & RBAC Provisioning
 </div>
 <h1 className="text-xl font-bold text-white">User Administration Console</h1>
 <p className="text-xs text-slate-400">
 Provision user accounts, assign RBAC roles (*Employee*, *Helpdesk*, *Technician*, *Admin*), and manage account status.
 </p>
 </div>

 <Button variant="primary" size="md" onClick={() => setIsCreateOpen(true)}>
 <PlusCircle className="w-4 h-4" /> Provision New User
 </Button>
 </div>

 {resetSuccessMsg && (
 <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
 <UserCheck className="w-5 h-5 shrink-0 text-emerald-400" />
 <span className="font-mono font-medium">{resetSuccessMsg}</span>
 </div>
 )}

 {/* Users Table */}
 <Card className="p-0 overflow-hidden border-slate-800">
 {isLoading ? (
 <div className="p-12 text-center text-slate-400 space-y-2">
 <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
 <p className="text-xs">Loading user account directory...</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="bg-[#1a2236] text-slate-400 font-mono text-[10px] uppercase">
 <th className="py-3 px-4">User</th>
 <th className="py-3 px-4">Role</th>
 <th className="py-3 px-4">Department</th>
 <th className="py-3 px-4">Status</th>
 <th className="py-3 px-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60">
 {users.map((u: any) => (
 <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
 <td className="py-3 px-4">
 <div className="font-semibold text-white">{u.fullName}</div>
 <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
 </td>
 <td className="py-3 px-4">
 <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
 {u.role}
 </span>
 </td>
 <td className="py-3 px-4 text-slate-300 font-medium">
 {u.department?.name || 'N/A'}
 </td>
 <td className="py-3 px-4">
 {u.isActive ? (
 <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
 <CheckCircle2 className="w-3 h-3" /> ACTIVE
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
 <XCircle className="w-3 h-3" /> INACTIVE
 </span>
 )}
 </td>
 <td className="py-3 px-4 text-right space-x-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => toggleStatusMutation.mutate({ id: u.id, isActive: !u.isActive })}
 >
 {u.isActive ? 'Deactivate' : 'Activate'}
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => resetPasswordMutation.mutate(u.id)}
 isLoading={resetPasswordMutation.isPending}
 >
 <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Reset Pass
 </Button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </Card>

 {/* User Provisioning Modal */}
 {isCreateOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
 <div className="w-full max-w-md bg-[#111726] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 relative">
 <button
 onClick={() => setIsCreateOpen(false)}
 className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
 >
 <X className="w-5 h-5" />
 </button>

 <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
 <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
 <Users className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-base font-bold text-white">Provision User Account</h2>
 <p className="text-xs text-slate-400">Create new user profile & assign role</p>
 </div>
 </div>

 {errorMsg && (
 <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{errorMsg}</span>
 </div>
 )}

 <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
 <Input
 label="Full Name *"
 placeholder="e.g. Maya Indah"
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 />

 <Input
 label="Corporate Email *"
 type="email"
 placeholder="maya@company.com"
 icon={<Mail className="w-4 h-4" />}
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 />

 <div>
 <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">
 Assigned RBAC Role *
 </label>
 <select
 value={role}
 onChange={(e) => setRole(e.target.value)}
 className="w-full bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 <option value="EMPLOYEE">EMPLOYEE (Requester)</option>
 <option value="HELPDESK">HELPDESK (Triage Officer)</option>
 <option value="TECHNICIAN">TECHNICIAN (Tier 2/3 Specialist)</option>
 <option value="ADMIN">ADMIN (System Administrator)</option>
 </select>
 </div>

 <div>
 <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">
 Department *
 </label>
 <select
 value={departmentId}
 onChange={(e) => setDepartmentId(e.target.value)}
 className="w-full bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 <option value="">-- Select Department --</option>
 {departments.map((d: any) => (
 <option key={d.id} value={d.id}>
 {d.name} ({d.code})
 </option>
 ))}
 </select>
 </div>

 <Input
 label="Initial Default Password *"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 />

 <div className="pt-2 flex items-center gap-2">
 <Button type="button" variant="outline" className="w-1/2" onClick={() => setIsCreateOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" variant="primary" className="w-1/2" isLoading={createUserMutation.isPending}>
 Create User Account
 </Button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
};
