import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Dashboards
import { EmployeeDashboard } from './pages/dashboards/EmployeeDashboard';
import { HelpdeskDashboard } from './pages/dashboards/HelpdeskDashboard';
import { TechnicianDashboard } from './pages/dashboards/TechnicianDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';

// Tickets Pages
import { TicketListPage } from './pages/tickets/TicketListPage';
import { CreateTicketPage } from './pages/tickets/CreateTicketPage';
import { TicketDetailPage } from './pages/tickets/TicketDetailPage';

// Advanced Modules Pages
import { KnowledgeBasePage } from './pages/knowledgeBase/KnowledgeBasePage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { SlaRulesPage } from './pages/admin/SlaRulesPage';
import { ReportsPage } from './pages/reports/ReportsPage';

const queryClient = new QueryClient({
 defaultOptions: {
 queries: {
 refetchOnWindowFocus: false,
 retry: 1,
 },
 },
});

export const App: React.FC = () => {
 return (
 <QueryClientProvider client={queryClient}>
 <BrowserRouter>
 <AuthProvider>
 <SocketProvider>
 <Routes>
 {/* Public Auth Routes */}
 <Route path="/login" element={<LoginPage />} />
 <Route path="/unauthorized" element={<UnauthorizedPage />} />

 {/* Authenticated Layout Shell Routes */}
 <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'HELPDESK', 'TECHNICIAN', 'ADMIN']} />}>
 <Route element={<AppLayout />}>
 {/* Employee Dashboard */}
 <Route path="/employee" element={<EmployeeDashboard />} />

 {/* Helpdesk Dashboard */}
 <Route path="/helpdesk" element={<ProtectedRoute allowedRoles={['HELPDESK', 'ADMIN']} />}>
 <Route index element={<HelpdeskDashboard />} />
 </Route>

 {/* Technician Dashboard */}
 <Route path="/technician" element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']} />}>
 <Route index element={<TechnicianDashboard />} />
 </Route>

 {/* Admin Dashboard, User Management, SLA Rules & Audit Logs */}
 <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
 <Route index element={<AdminDashboard />} />
 <Route path="users" element={<AdminUsersPage />} />
 <Route path="sla" element={<SlaRulesPage />} />
 <Route path="audit" element={<AuditLogsPage />} />
 </Route>

 {/* Reports & Export */}
 <Route path="/reports" element={<ProtectedRoute allowedRoles={['HELPDESK', 'ADMIN']} />}>
 <Route index element={<ReportsPage />} />
 </Route>

 {/* Ticket Core Engine Routes */}
 <Route path="/tickets" element={<TicketListPage />} />
 <Route path="/tickets/new" element={<CreateTicketPage />} />
 <Route path="/tickets/:id" element={<TicketDetailPage />} />

 {/* Knowledge Base Route */}
 <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
 </Route>
 </Route>

 {/* Fallback redirect */}
 <Route path="*" element={<Navigate to="/login" replace />} />
 </Routes>
 </SocketProvider>
 </AuthProvider>
 </BrowserRouter>
 </QueryClientProvider>
 );
};

export default App;
