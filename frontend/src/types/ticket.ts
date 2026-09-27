export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketImpact = 'INDIVIDUAL' | 'TEAM' | 'DEPARTMENT' | 'ORGANIZATION';
export type TicketUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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

export interface TicketAttachment {
 id: string;
 originalFilename: string;
 mimeType: string;
 fileSize: number;
 uploadedById: string;
 uploadedAt: string;
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
 impact: TicketImpact;
 urgency: TicketUrgency;
 suggestedPriority: TicketPriority;
 priority: TicketPriority;
 isPriorityReviewed: boolean;
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
 attachments?: TicketAttachment[];
 history?: TicketHistory[];
 rating?: {
 id: string;
 score: number;
 feedback?: string | null;
 } | null;
}

export interface TicketPagination {
 total: number;
 page: number;
 limit: number;
 totalPages: number;
}
