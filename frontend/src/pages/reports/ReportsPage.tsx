import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../../api/reports';
import { ticketApi } from '../../api/tickets';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BarChart3, Download, Filter, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const ReportsPage: React.FC = () => {
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');
 const [selectedPriority, setSelectedPriority] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('');

 const { data: categories = [] } = useQuery({
 queryKey: ['categories'],
 queryFn: ticketApi.getCategories,
 });

 const { data: reportData = [], isLoading } = useQuery({
 queryKey: ['report-export', startDate, endDate, selectedPriority, selectedCategory],
 queryFn: () =>
 reportApi.getExportData({
 startDate: startDate || undefined,
 endDate: endDate || undefined,
 priority: selectedPriority || undefined,
 categoryId: selectedCategory || undefined,
 }),
 });

 const handleExportExcel = async () => {
 if (!reportData || reportData.length === 0) return;

 const ExcelJS = await import('exceljs');
 const workbook = new ExcelJS.Workbook();
 workbook.creator = 'IT Helpdesk System';
 workbook.created = new Date();
 const worksheet = workbook.addWorksheet('Tickets', {
 views: [{ state: 'frozen', ySplit: 1 }],
 });

 const columns = [
 ['Ticket Number', 'ticketNumber'], ['Subject', 'subject'], ['Category', 'category'],
 ['Impact', 'impact'], ['Urgency', 'urgency'], ['Suggested Priority', 'suggestedPriority'],
 ['Final Priority', 'priority'], ['Priority Reviewed', 'priorityReviewed'], ['Status', 'status'],
 ['Requester', 'requester'], ['Department', 'department'], ['Technician', 'technician'],
 ['SLA Deadline', 'slaDeadline'], ['Overdue', 'isOverdue'], ['Work Time (Minutes)', 'workTimeMins'],
 ['Rating', 'ratingScore'], ['Rating Feedback', 'ratingFeedback'], ['Created Date', 'createdDate'],
 ] as const;

 worksheet.addTable({
 name: 'HelpdeskTickets',
 ref: 'A1',
 headerRow: true,
 totalsRow: false,
 style: { theme: 'TableStyleMedium2', showRowStripes: true },
 columns: columns.map(([name]) => ({ name, filterButton: true })),
 rows: reportData.map((row) => columns.map(([, key]) => row[key])),
 });

 const widths = [18, 42, 24, 16, 14, 20, 16, 18, 16, 24, 22, 24, 24, 12, 20, 12, 36, 24];
 worksheet.columns.forEach((column, index) => {
 column.width = widths[index];
 column.alignment = { vertical: 'top', wrapText: index === 1 || index === 16 };
 });
 worksheet.getRow(1).height = 24;

 const buffer = await workbook.xlsx.writeBuffer();
 const blob = new Blob([new Uint8Array(buffer)], {
 type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `IT_Helpdesk_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 };

 // Recharts Chart Aggregations
 const categoryChartData = React.useMemo(() => {
 const counts: Record<string, number> = {};
 reportData.forEach((row) => {
 counts[row.category] = (counts[row.category] || 0) + 1;
 });
 return Object.entries(counts).map(([name, count]) => ({ name, count }));
 }, [reportData]);

 const priorityChartData = React.useMemo(() => {
 const counts: Record<string, number> = {};
 reportData.forEach((row) => {
 counts[row.priority] = (counts[row.priority] || 0) + 1;
 });
 return Object.entries(counts).map(([name, count]) => ({ name, count }));
 }, [reportData]);

 const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#818cf8', '#ec4899'];

 return (
 <div className="space-y-6 animate-in fade-in duration-200">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#111726] to-[#111726] border border-blue-500/20 shadow-xl">
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
 <BarChart3 className="w-4 h-4" /> IT Operations Reporting Hub
 </div>
 <h1 className="text-xl font-bold text-white">System Reports & Data Exporter</h1>
 <p className="text-xs text-slate-400">
 Generate operational performance metrics, SLA compliance reports, and structured Excel workbooks.
 </p>
 </div>

 <Button variant="primary" size="md" onClick={handleExportExcel} disabled={reportData.length === 0}>
 <Download className="w-4 h-4" /> Export Excel ({reportData.length})
 </Button>
 </div>

 {/* Filter Control Card */}
 <Card className="p-4 space-y-3">
 <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
 <Filter className="w-4 h-4 text-blue-400" />
 <span>Report Filters</span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
 <div>
 <label className="block text-slate-400 font-semibold mb-1 text-[10px]">Start Date</label>
 <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
 </div>

 <div>
 <label className="block text-slate-400 font-semibold mb-1 text-[10px]">End Date</label>
 <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
 </div>

 <div>
 <label className="block text-slate-400 font-semibold mb-1 text-[10px]">Priority Level</label>
 <select
 value={selectedPriority}
 onChange={(e) => setSelectedPriority(e.target.value)}
 className="w-full bg-[#1a2236] border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 <option value="">All Priorities</option>
 <option value="CRITICAL">CRITICAL</option>
 <option value="HIGH">HIGH</option>
 <option value="MEDIUM">MEDIUM</option>
 <option value="LOW">LOW</option>
 </select>
 </div>

 <div>
 <label className="block text-slate-400 font-semibold mb-1 text-[10px]">Category</label>
 <select
 value={selectedCategory}
 onChange={(e) => setSelectedCategory(e.target.value)}
 className="w-full bg-[#1a2236] border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 <option value="">All Categories</option>
 {categories.map((c) => (
 <option key={c.id} value={c.id}>
 {c.name}
 </option>
 ))}
 </select>
 </div>
 </div>
 </Card>

 {/* Visual Analytics Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Category Breakdown Chart */}
 <Card className="space-y-3">
 <h2 className="text-sm font-bold text-white flex items-center gap-2">
 <FileSpreadsheet className="w-4 h-4 text-blue-400" />
 Tickets Volume by Category
 </h2>
 {categoryChartData.length === 0 ? (
 <div className="h-64 flex items-center justify-center text-xs text-slate-500">No chart data available</div>
 ) : (
 <div className="h-64">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={categoryChartData}>
 <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
 <YAxis stroke="#64748b" fontSize={10} />
 <Tooltip contentStyle={{ backgroundColor: '#111726', borderColor: '#1e293b', fontSize: '12px' }} />
 <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 )}
 </Card>

 {/* Priority Breakdown Pie Chart */}
 <Card className="space-y-3">
 <h2 className="text-sm font-bold text-white flex items-center gap-2">
 <BarChart3 className="w-4 h-4 text-amber-400" />
 Priority Distribution Breakdown
 </h2>
 {priorityChartData.length === 0 ? (
 <div className="h-64 flex items-center justify-center text-xs text-slate-500">No chart data available</div>
 ) : (
 <div className="h-64">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={priorityChartData}
 cx="50%"
 cy="50%"
 outerRadius={80}
 dataKey="count"
 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
 >
 {priorityChartData.map((_, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ backgroundColor: '#111726', borderColor: '#1e293b', fontSize: '12px' }} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 )}
 </Card>
 </div>

 {/* Raw Preview Table */}
 <Card className="p-0 overflow-hidden border-slate-800">
 <div className="p-4 bg-[#1a2236]/40 border-b border-slate-800 flex items-center justify-between">
 <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
 Report Raw Dataset Preview ({reportData.length} Records)
 </h3>
 </div>

 {isLoading ? (
 <div className="p-12 text-center text-slate-400">
 <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
 <p className="text-xs">Generating report preview...</p>
 </div>
 ) : reportData.length === 0 ? (
 <div className="p-8 text-center text-xs text-slate-500">No records match the report filter parameters.</div>
 ) : (
 <div className="overflow-x-auto max-h-80">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="bg-[#1a2236] text-slate-400 font-mono text-[10px] uppercase">
 <th className="py-2.5 px-3">Ticket ID</th>
 <th className="py-2.5 px-3">Subject</th>
 <th className="py-2.5 px-3">Category</th>
 <th className="py-2.5 px-3">Priority</th>
 <th className="py-2.5 px-3">Status</th>
 <th className="py-2.5 px-3">Requester</th>
 <th className="py-2.5 px-3">Technician</th>
 <th className="py-2.5 px-3">Overdue</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
 {reportData.slice(0, 15).map((row, idx) => (
 <tr key={idx} className="hover:bg-slate-900/40">
 <td className="py-2.5 px-3 text-blue-400 font-semibold">{row.ticketNumber}</td>
 <td className="py-2.5 px-3 font-sans text-slate-200 max-w-xs truncate">{row.subject}</td>
 <td className="py-2.5 px-3 text-slate-400">{row.category}</td>
 <td className="py-2.5 px-3 text-slate-300">{row.priority}</td>
 <td className="py-2.5 px-3 text-slate-300">{row.status}</td>
 <td className="py-2.5 px-3 font-sans text-slate-300">{row.requester}</td>
 <td className="py-2.5 px-3 font-sans text-slate-300">{row.technician}</td>
 <td className="py-2.5 px-3 text-slate-400">{row.isOverdue}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </Card>
 </div>
 );
};
