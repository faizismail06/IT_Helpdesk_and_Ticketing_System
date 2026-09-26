import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, KeyRound, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const loginSchema = z.object({
 email: z.string().email('Standard company email format required'),
 password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
 const navigate = useNavigate();
 const { login } = useAuth();
 const [errorMsg, setErrorMsg] = useState<string | null>(null);
 const [isLoading, setIsLoading] = useState(false);

 const {
 register,
 handleSubmit,
 setValue,
 formState: { errors },
 } = useForm<LoginFormValues>({
 resolver: zodResolver(loginSchema),
 defaultValues: {
 email: 'helpdesk@company.com',
 password: 'Helpdesk123!',
 },
 });

 const onSubmit = async (data: LoginFormValues) => {
 setIsLoading(true);
 setErrorMsg(null);
 try {
 const response = await api.post('/auth/login', data);
 const { token, user } = response.data.data;
 login(token, user);

 // Redirect based on user role
 switch (user.role) {
 case 'ADMIN':
 navigate('/admin');
 break;
 case 'HELPDESK':
 navigate('/helpdesk');
 break;
 case 'TECHNICIAN':
 navigate('/technician');
 break;
 default:
 navigate('/employee');
 break;
 }
 } catch (err: any) {
 const msg = err.response?.data?.message || 'Failed to authenticate. Please verify credentials.';
 setErrorMsg(msg);
 } finally {
 setIsLoading(false);
 }
 };

 const handleQuickFill = (email: string, pass: string) => {
 setValue('email', email);
 setValue('password', pass);
 setErrorMsg(null);
 };

 return (
 <div className="min-h-screen flex items-center justify-center p-4 bg-[#090d16] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]">
 <div className="w-full max-w-md space-y-6">
 {/* Brand Header */}
 <div className="text-center space-y-2">
 <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2 shadow-lg shadow-blue-500/10">
 <Shield className="w-8 h-8" />
 </div>
 <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
 Enterprise IT Helpdesk
 </h1>
 <p className="text-xs text-slate-400">
 Internal Service Management & Incident Resolution System
 </p>
 </div>

 {/* Card Form */}
 <Card className="border-slate-800/90 shadow-2xl">
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 {errorMsg && (
 <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{errorMsg}</span>
 </div>
 )}

 <Input
 label="Corporate Email"
 type="email"
 placeholder="user@company.com"
 icon={<Mail className="w-4 h-4" />}
 error={errors.email?.message}
 {...register('email')}
 />

 <Input
 label="Password"
 type="password"
 placeholder="••••••••"
 icon={<KeyRound className="w-4 h-4" />}
 error={errors.password?.message}
 {...register('password')}
 />

 <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
 Sign In to Workstation
 </Button>
 </form>

 {/* Quick Demo Credentials Switcher */}
 <div className="mt-6 pt-5 border-t border-slate-800/80">
 <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
 <Sparkles className="w-3.5 h-3.5 text-amber-400" />
 <span>Demo Account Quick Selector</span>
 </div>
 <div className="grid grid-cols-2 gap-2 text-xs">
 <button
 type="button"
 onClick={() => handleQuickFill('budi.employee@company.com', 'User123!')}
 className="px-2.5 py-1.5 rounded-md bg-[#1a2236] hover:bg-[#25304c] text-slate-300 text-left border border-slate-700/50 transition-colors"
 >
 <div className="font-semibold text-slate-200">Employee</div>
 <div className="text-[10px] text-slate-400 truncate">budi.employee@...</div>
 </button>
 <button
 type="button"
 onClick={() => handleQuickFill('helpdesk@company.com', 'Helpdesk123!')}
 className="px-2.5 py-1.5 rounded-md bg-[#1a2236] hover:bg-[#25304c] text-slate-300 text-left border border-slate-700/50 transition-colors"
 >
 <div className="font-semibold text-blue-400">Helpdesk (Triage)</div>
 <div className="text-[10px] text-slate-400 truncate">helpdesk@...</div>
 </button>
 <button
 type="button"
 onClick={() => handleQuickFill('technician.ahmad@company.com', 'Tech123!')}
 className="px-2.5 py-1.5 rounded-md bg-[#1a2236] hover:bg-[#25304c] text-slate-300 text-left border border-slate-700/50 transition-colors"
 >
 <div className="font-semibold text-amber-400">Technician</div>
 <div className="text-[10px] text-slate-400 truncate">technician.ahmad@...</div>
 </button>
 <button
 type="button"
 onClick={() => handleQuickFill('admin@company.com', 'Admin123!')}
 className="px-2.5 py-1.5 rounded-md bg-[#1a2236] hover:bg-[#25304c] text-slate-300 text-left border border-slate-700/50 transition-colors"
 >
 <div className="font-semibold text-emerald-400">Admin</div>
 <div className="text-[10px] text-slate-400 truncate">admin@...</div>
 </button>
 </div>
 </div>
 </Card>

 <p className="text-center text-xs text-slate-500">
 Enterprise IT Helpdesk & Ticketing System v1.0.0
 </p>
 </div>
 </div>
 );
};
