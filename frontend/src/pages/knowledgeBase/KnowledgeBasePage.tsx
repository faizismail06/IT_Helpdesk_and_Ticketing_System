import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { kbApi, KnowledgeArticle } from '../../api/kb';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { BookOpen, Search, Eye, Tag, X, FileText, Loader2 } from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('');
 const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);

 const { data: articles = [], isLoading } = useQuery({
 queryKey: ['kb-articles', searchQuery, selectedCategory],
 queryFn: () => kbApi.getArticles(searchQuery, selectedCategory),
 });

 const categoriesList = [
 'Account & Access',
 'Network & VPN',
 'Printer & Scanner',
 'Hardware Issue',
 'Software Bug & License',
 'Email & Communication',
 ];

 return (
 <div className="space-y-6 animate-in fade-in duration-200">
 {/* Top Banner & Search */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#111726] to-[#111726] border border-blue-500/20 shadow-xl">
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
 <BookOpen className="w-4 h-4" /> IT Knowledge Base & Self-Service
 </div>
 <h1 className="text-xl font-bold text-white">IT Service Knowledge Hub</h1>
 <p className="text-xs text-slate-400 max-w-xl">
 Browse verified troubleshooting guides, self-service solutions, and IT setup procedures.
 </p>
 </div>

 </div>

 {/* Search & Category Pills */}
 <div className="space-y-3">
 <Card className="p-3">
 <Input
 placeholder="Search KB articles (e.g. WiFi, email password, printer jam)..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 icon={<Search className="w-4 h-4 text-slate-500" />}
 />
 </Card>

 {/* Category Pills */}
 <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
 <button
 onClick={() => setSelectedCategory('')}
 className={`px-3 py-1.5 rounded-lg border font-medium transition-colors shrink-0 ${
 !selectedCategory
 ? 'bg-blue-600 border-blue-500 text-white'
 : 'bg-[#111726] border-slate-800 text-slate-400 hover:text-slate-200'
 }`}
 >
 All Categories
 </button>
 {categoriesList.map((cat) => (
 <button
 key={cat}
 onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
 className={`px-3 py-1.5 rounded-lg border font-medium transition-colors shrink-0 ${
 selectedCategory === cat
 ? 'bg-blue-600 border-blue-500 text-white'
 : 'bg-[#111726] border-slate-800 text-slate-400 hover:text-slate-200'
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 {/* Articles Grid */}
 {isLoading ? (
 <div className="p-12 text-center text-slate-400 space-y-2">
 <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
 <p className="text-xs">Loading Knowledge Base directory...</p>
 </div>
 ) : articles.length === 0 ? (
 <Card className="p-12 text-center text-slate-400 space-y-3">
 <FileText className="w-10 h-10 mx-auto text-slate-600" />
 <h3 className="text-sm font-semibold text-slate-200">No Articles Found</h3>
 <p className="text-xs text-slate-500">Try adjusting your search terms or category selection.</p>
 </Card>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {articles.map((art) => (
 <Card
 key={art.id}
 onClick={() => setActiveArticle(art)}
 className="hover:border-slate-700 cursor-pointer transition-all space-y-3 flex flex-col justify-between group"
 >
 <div className="space-y-2">
 <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
 <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
 {art.category}
 </span>
 <span className="flex items-center gap-1">
 <Eye className="w-3 h-3 text-slate-400" /> {art.viewsCount} views
 </span>
 </div>
 <h2 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
 {art.title}
 </h2>
 <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{art.content}</p>
 </div>

 <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
 <span>By {art.author.fullName}</span>
 <span className="text-blue-400 font-medium group-hover:underline">Read Article {'->'}</span>
 </div>
 </Card>
 ))}
 </div>
 )}

 {/* Article Reader Modal */}
 {activeArticle && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
 <div className="w-full max-w-2xl bg-[#111726] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 relative max-h-[85vh] overflow-y-auto">
 <button
 onClick={() => setActiveArticle(null)}
 className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
 >
 <X className="w-5 h-5" />
 </button>

 <div className="space-y-2 border-b border-slate-800 pb-4">
 <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
 {activeArticle.category}
 </span>
 <h1 className="text-xl font-bold text-white leading-snug">{activeArticle.title}</h1>
 <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
 <span>Author: {activeArticle.author.fullName}</span>
 <span>•</span>
 <span>Views: {activeArticle.viewsCount}</span>
 </div>
 </div>

 <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
 {activeArticle.content}
 </div>

 {activeArticle.tags && activeArticle.tags.length > 0 && (
 <div className="flex items-center gap-1.5 text-xs text-slate-400">
 <Tag className="w-3.5 h-3.5 text-slate-500" />
 {activeArticle.tags.map((t) => (
 <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
 #{t}
 </span>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 </div>
 );
};
