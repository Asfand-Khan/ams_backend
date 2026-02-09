// services/activityService.ts

import { PrismaClient, EntityType, AssignmentStatus } from '@prisma/client';

type ActivityFilters = {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  actions?: string[];
  performedByIds?: number[];
};

export async function getEntityActivityLogs(
  entityType: EntityType,
  entityId: number,
  filters: ActivityFilters,
  currentUser: any,
  prisma: PrismaClient
) {
  const { page, limit, ...logFilters } = filters;
  const shouldPaginate = page !== undefined && limit !== undefined;

  // ── Permission check ───────────────────────────────────────────────
  let canAccess = false;

  const userRecord = await prisma.user.findFirst({
    where: { employee_id: currentUser.id },
    select: { type: true },
  });

  if (!userRecord) throw new Error("User not found");
  const userType = userRecord.type;

  let entity: { id: number; created_by: number } | null = null;

  if (entityType === EntityType.project) {
    entity = await prisma.project.findUnique({
      where: { id: entityId },
      select: { id: true, created_by: true },
    });
  } else if (entityType === EntityType.task) {
    entity = await prisma.task.findUnique({
      where: { id: entityId },
      select: { id: true, created_by: true },
    });
  } else if (entityType === EntityType.ticket) {
    entity = await prisma.ticket.findUnique({
      where: { id: entityId },
      select: { id: true, created_by: true },
    });
  }

  if (!entity) throw new Error(`${entityType} not found`);

  if (["admin", "hr", "manager"].includes(userType)) {
    canAccess = true;
  } else if (["lead", "employee"].includes(userType)) {
    if (entity.created_by === currentUser.id) {
      canAccess = true;
    } else {
      // Check direct assignment
      let assignmentWhere: any = {
        employee_id: currentUser.id,
        status: AssignmentStatus.active,
      };

      if (entityType === EntityType.project) {
        assignmentWhere.project_id = entityId;
        const assignment = await prisma.projectAssigner.findFirst({ where: assignmentWhere });
        if (assignment) canAccess = true;
      } else if (entityType === EntityType.task) {
        assignmentWhere.task_id = entityId;
        const assignment = await prisma.taskAssignment.findFirst({ where: assignmentWhere });
        if (assignment) canAccess = true;
      } else if (entityType === EntityType.ticket) {
        assignmentWhere.ticket_id = entityId;
        const assignment = await prisma.ticketAssignment.findFirst({ where: assignmentWhere });
        if (assignment) canAccess = true;
      }

      // Lead can see if any team member is assigned
      if (userType === "lead" && !canAccess) {
        const teamMembers = await prisma.teamMember.findMany({
          where: {
            team: { team_lead_id: currentUser.id },
            is_active: true,
            is_deleted: false,
          },
          select: { employee_id: true },
        });
        const teamIds = teamMembers.map(m => m.employee_id);

        let teamAssignmentWhere: any = {
          employee_id: { in: teamIds },
          status: AssignmentStatus.active,
        };

        if (entityType === EntityType.project) {
          teamAssignmentWhere.project_id = entityId;
          const teamAssignment = await prisma.projectAssigner.findFirst({ where: teamAssignmentWhere });
          if (teamAssignment) canAccess = true;
        } else if (entityType === EntityType.task) {
          teamAssignmentWhere.task_id = entityId;
          const teamAssignment = await prisma.taskAssignment.findFirst({ where: teamAssignmentWhere });
          if (teamAssignment) canAccess = true;
        } else if (entityType === EntityType.ticket) {
          teamAssignmentWhere.ticket_id = entityId;
          const teamAssignment = await prisma.ticketAssignment.findFirst({ where: teamAssignmentWhere });
          if (teamAssignment) canAccess = true;
        }
      }
    }
  }

  if (!canAccess) throw new Error("Unauthorized to view logs");

  // ── Query logs ──────────────────────────────────────────────────────
  let where: any = {
    entity_type: entityType,
    entity_id: entityId,
  };

  if (logFilters.startDate || logFilters.endDate) {
    where.performed_at = {
      gte: logFilters.startDate ? new Date(`${logFilters.startDate}T00:00:00.000Z`) : undefined,
      lte: logFilters.endDate ? new Date(`${logFilters.endDate}T23:59:59.999Z`) : undefined,
    };
  }

  if (logFilters.actions?.length) where.action = { in: logFilters.actions };
  if (logFilters.performedByIds?.length) where.performed_by = { in: logFilters.performedByIds };

  const total = await prisma.teamActivityLog.count({ where });

  const logs = await prisma.teamActivityLog.findMany({
    where,
    select: {
      id: true,
      action: true,
      field_name: true,
      old_value: true,
      new_value: true,
      performed_at: true,
      ip_address: true,
      device_info: true,
      extra_payload: true,
      actor: {
        select: {
          id: true,
          full_name: true,
          profile_picture: true,
        },
      },
      targetUser: {
        select: {
          id: true,
          full_name: true,
          profile_picture: true,
        },
      },
    },
    orderBy: { id: "desc" },
    skip: shouldPaginate ? (page! - 1) * limit! : undefined,
    take: shouldPaginate ? limit! : undefined,
  });

  return { logs, total };
}