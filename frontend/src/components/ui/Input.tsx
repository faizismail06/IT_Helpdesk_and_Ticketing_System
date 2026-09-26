import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
 icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
 ({ label, error, icon, className, ...props }, ref) => {
 return (
 <div className="w-full">
 {label && (
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
 {label}
 </label>
 )}
 <div className="relative">
 {icon && (
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
 {icon}
 </div>
 )}
 <input
 ref={ref}
 className={clsx(
 'w-full bg-[#111726] border text-slate-100 placeholder-slate-500 text-sm rounded-lg transition-all focus:outline-none focus:ring-2',
 icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5',
 error
 ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
 : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20',
 className
 )}
 {...props}
 />
 </div>
 {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
 </div>
 );
 }
);

Input.displayName = 'Input';
