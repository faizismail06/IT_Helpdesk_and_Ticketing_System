import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
 children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
 return (
 <div
 className={clsx(
 'bg-[#111726] border border-slate-800/80 rounded-xl p-5 shadow-xl shadow-black/20 backdrop-blur-sm',
 className
 )}
 {...props}
 >
 {children}
 </div>
 );
};
