export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus =
 | 'NEW'
 | 'OPEN'
 | 'IN_PROGRESS'
 | 'PENDING'
 | 'RESOLVED'
 | 'CLOSED'
 | 'REOPENED'
 | 'OVERDUE';

export interface TicketCategory {
 id: string;
 name: string;
 description?: string | null;
 isActive: boolean;
}

export interface TicketRequester {
 id: string;
 fullName: string;
 email: string;
 avatarUrl?: string | null;
 department: {
 id?: string;
 name: string;
 code: string;
 };
}

export interface TicketAssignment {
 id: string;
 technician: {
 id: string;
 fullName: string;
 email: string;
 avatarUrl?: string | null;
 };
 assignedBy?: {
 id: string;
 fullName: string;
 };
 assignedAt: string;
}

export interface TicketComment {
 id: string;
 message: string;
 isInternal: boolean;
 user: {
 id: string;
 fullName: string;
 role: string;
 avatarUrl?: string | null;
 };
 createdAt: string;
}

export interface TicketHistory {
 id: string;
 action: string;
 oldValue?: string | null;
 newValue?: string | null;
 timestamp: string;
 actor: {
 id: string;
 fullName: string;
 role: string;
 };
}

export interface Ticket {
 id: string;
 ticketNumber: string;
 subject: string;
 description: string;
 categoryId: string;
 category: TicketCategory;
 priority: TicketPriority;
 status: TicketStatus;
 requesterId: string;
 requester: TicketRequester;
 slaDeadline: string;
 isOverdue: boolean;
 workTimeMins: number;
 createdAt: string;
 updatedAt: string;
 assignments?: TicketAssignment[];
 comments?: TicketComment[];
 history?: TicketHistory[];
}

export interface TicketPagination {
 total: number;
 page: number;
 limit: number;
 totalPages: number;
}
