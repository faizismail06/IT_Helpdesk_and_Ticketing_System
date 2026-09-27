import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, FolderPlus, Plus, Power, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { kbApi } from '../../api/kb';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export const ContentManagementPage: React.FC = () => {
 const queryClient = useQueryClient();
 const [categoryName, setCategoryName] = useState('');
 const [title, setTitle] = useState('');
 const [category, setCategory] = useState('');
 const [content, setContent] = useState('');
 const [tags, setTags] = useState('');
 const { data: categories = [] } = useQuery({ queryKey: ['admin-categories'], queryFn: adminApi.getCategories });
 const { data: articles = [] } = useQuery({ queryKey: ['admin-kb'], queryFn: () => kbApi.getArticles() });
 const createCategory = useMutation({ mutationFn: adminApi.createCategory, onSuccess: () => { setCategoryName(''); queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); queryClient.invalidateQueries({ queryKey: ['categories'] }); } });
 const toggleCategory = useMutation({ mutationFn: ({ id, isActive }: any) => adminApi.updateCategory(id, { isActive }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }) });
 const createArticle = useMutation({ mutationFn: kbApi.createArticle, onSuccess: () => { setTitle(''); setCategory(''); setContent(''); setTags(''); queryClient.invalidateQueries({ queryKey: ['admin-kb'] }); } });
 const toggleArticle = useMutation({ mutationFn: ({ id, isPublished }: any) => kbApi.updateArticle(id, { isPublished }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-kb'] }) });
 const deleteArticle = useMutation({ mutationFn: kbApi.deleteArticle, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-kb'] }) });

 return <div className="space-y-6">
 <div><h1 className="text-xl font-bold text-white">Service Content Management</h1><p className="text-xs text-slate-400">Maintain ticket categories and employee self-service articles.</p></div>
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
 <Card className="space-y-4">
 <h2 className="text-sm font-bold text-white flex items-center gap-2"><FolderPlus className="w-4 h-4 text-blue-400" />Ticket Categories</h2>
 <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); if (categoryName.trim()) createCategory.mutate({ name: categoryName.trim() }); }}><Input placeholder="New category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} /><Button type="submit" aria-label="Add category" title="Add category"><Plus className="w-4 h-4" /></Button></form>
 <div className="divide-y divide-slate-800">{categories.map((item: any) => <div key={item.id} className="py-3 flex items-center justify-between"><div><div className="text-xs font-semibold text-slate-200">{item.name}</div><div className="text-[10px] text-slate-500">{item._count?.tickets || 0} tickets</div></div><Button size="sm" variant="ghost" title={item.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleCategory.mutate({ id: item.id, isActive: !item.isActive })}><Power className={`w-4 h-4 ${item.isActive ? 'text-emerald-400' : 'text-slate-500'}`} /></Button></div>)}</div>
 </Card>
 <Card className="space-y-4">
 <h2 className="text-sm font-bold text-white flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-400" />New Knowledge Article</h2>
 <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (title && category && content) createArticle.mutate({ title, category, content, tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean), isPublished: true }); }}>
 <Input placeholder="Article title" value={title} onChange={(e) => setTitle(e.target.value)} />
 <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
 <textarea className="w-full min-h-32 bg-[#090d16] border border-slate-800 rounded-lg p-3 text-xs text-slate-100" placeholder="Verified troubleshooting procedure" value={content} onChange={(e) => setContent(e.target.value)} />
 <Input placeholder="Tags, separated by commas" value={tags} onChange={(e) => setTags(e.target.value)} />
 <Button type="submit" isLoading={createArticle.isPending}><Plus className="w-4 h-4" />Publish Article</Button>
 </form>
 </Card>
 </div>
 <Card className="space-y-3"><h2 className="text-sm font-bold text-white">Knowledge Articles</h2><div className="divide-y divide-slate-800">{articles.map((article) => <div key={article.id} className="py-3 flex items-center justify-between gap-4"><div className="min-w-0"><div className="text-xs font-semibold text-slate-200 truncate">{article.title}</div><div className="text-[10px] text-slate-500">{article.category}</div></div><div className="flex gap-1"><Button size="sm" variant="ghost" title={(article as any).isPublished ? 'Unpublish' : 'Publish'} onClick={() => toggleArticle.mutate({ id: article.id, isPublished: !(article as any).isPublished })}><Power className={`w-4 h-4 ${(article as any).isPublished ? 'text-emerald-400' : 'text-slate-500'}`} /></Button><Button size="sm" variant="ghost" title="Delete article" onClick={() => { if (confirm(`Delete ${article.title}?`)) deleteArticle.mutate(article.id); }}><Trash2 className="w-4 h-4 text-rose-400" /></Button></div></div>)}</div></Card>
 </div>;
};
