-- CreateEnum
CREATE TYPE "TicketImpact" AS ENUM ('INDIVIDUAL', 'TEAM', 'DEPARTMENT', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "TicketUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Ticket"
ADD COLUMN "impact" "TicketImpact" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN "urgency" "TicketUrgency" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN "suggestedPriority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN "isPriorityReviewed" BOOLEAN NOT NULL DEFAULT false;

-- Preserve the priority already assigned to existing tickets.
UPDATE "Ticket" SET "suggestedPriority" = "priority";
