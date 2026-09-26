import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
 const navigate = useNavigate();
 return (
 <div className="min-h-screen flex items-center justify-center bg-[#090d16] p-4">
 <div className="text-center space-y-4 max-w-md">
 <div className="inline-flex p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
 <ShieldAlert className="w-12 h-12" />
 </div>
 <h1 className="text-2xl font-bold text-white">403 - Access Denied</h1>
 <p className="text-sm text-slate-400">
 You do not have permission to view this section of the IT Helpdesk Workstation.
 </p>
 <Button variant="secondary" onClick={() => navigate(-1)}>
 Go Back
 </Button>
 </div>
 </div>
 );
};
