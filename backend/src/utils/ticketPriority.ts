import { TicketImpact, TicketPriority, TicketUrgency } from '@prisma/client';

const PRIORITY_MATRIX: Record<TicketImpact, Record<TicketUrgency, TicketPriority>> = {
 INDIVIDUAL: { LOW: TicketPriority.LOW, MEDIUM: TicketPriority.LOW, HIGH: TicketPriority.MEDIUM, CRITICAL: TicketPriority.HIGH },
 TEAM: { LOW: TicketPriority.LOW, MEDIUM: TicketPriority.MEDIUM, HIGH: TicketPriority.HIGH, CRITICAL: TicketPriority.HIGH },
 DEPARTMENT: { LOW: TicketPriority.MEDIUM, MEDIUM: TicketPriority.HIGH, HIGH: TicketPriority.HIGH, CRITICAL: TicketPriority.CRITICAL },
 ORGANIZATION: { LOW: TicketPriority.HIGH, MEDIUM: TicketPriority.HIGH, HIGH: TicketPriority.CRITICAL, CRITICAL: TicketPriority.CRITICAL },
};

export const calculateSuggestedPriority = (
 impact: TicketImpact,
 urgency: TicketUrgency
): TicketPriority => PRIORITY_MATRIX[impact][urgency];
