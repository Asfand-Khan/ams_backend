import prisma from "../config/db";
import {
  ProjectCreate,
  ProjectUpdate,
} from "../validations/projectValidations";
import {
  ActivityAction,
  EntityType,
  ProjectStatus,
  AssignmentStatus,
} from "@prisma/client";

export const createProject = async (
  projectData: ProjectCreate,
  createdByEmployeeId: number,
) => {
  const newProject = await prisma.$transaction(
    async (tx) => {
      const now = new Date();

      // Create the project
      const project = await tx.project.create({
        data: {
          name: projectData.name.trim(),
          description: projectData.description?.trim() ?? null,
          status: projectData.status || ProjectStatus.active,
          created_by: createdByEmployeeId,
          is_active: true,
          is_deleted: false,
        },
      });

      // Log project creation
      await tx.teamActivityLog.create({
        data: {
          entity_type: EntityType.project,
          entity_id: project.id,
          action: ActivityAction.created,
          performed_by: createdByEmployeeId,
          performed_at: now,
        },
      });

      // Create default task statuses
      const defaultStatuses = [
        { name: "to do", color: "blue" },
        { name: "in process", color: "yellow" },
        { name: "completed", color: "green" },
      ];

      await tx.taskStatusMaster.createMany({
        data: defaultStatuses.map((status) => ({
          name: status.name,
          color: status.color,
          project_id: project.id,
          created_by: createdByEmployeeId,
          is_active: true,
        })),
        skipDuplicates: true,
      });

      // Log status creation
      const statusLogs = defaultStatuses.map((status) => ({
        entity_type: EntityType.project,
        entity_id: project.id,
        action: ActivityAction.status_added,
        field_name: status.name,
        new_value: status.color,
        performed_by: createdByEmployeeId,
        performed_at: now,
      }));

      if (statusLogs.length > 0) {
        await tx.teamActivityLog.createMany({ data: statusLogs });
      }

      // Assign employees
      if (projectData.assignee_ids?.length) {
        // Validate assignees
        const validCount = await tx.employee.count({
          where: {
            id: { in: projectData.assignee_ids },
            is_active: true,
            is_deleted: false,
          },
        });
        if (validCount !== projectData.assignee_ids.length) {
          throw new Error("One or more assignee IDs are invalid or inactive");
        }

        // Fetch employee details for logs
        const employees = await tx.employee.findMany({
          where: { id: { in: projectData.assignee_ids } },
          select: { id: true, full_name: true },
        });
        const employeeMap = new Map(employees.map((e) => [e.id, e.full_name]));

        // Create project assignments
        await tx.projectAssigner.createMany({
          data: projectData.assignee_ids.map((id) => ({
            project_id: project.id,
            employee_id: id,
            assigned_by: createdByEmployeeId,
            assigned_at: now,
            status: AssignmentStatus.active,
          })),
          skipDuplicates: true,
        });

        // Log assignments
        const assignLogs = projectData.assignee_ids.map((assigneeId) => ({
          entity_type: EntityType.project,
          entity_id: project.id,
          action: ActivityAction.assigned,
          field_name: `assigned_to:${assigneeId}`,
          new_value: employeeMap.get(assigneeId) || "Unknown",
          performed_by: createdByEmployeeId,
          target_user_id: assigneeId,
          performed_at: now,
        }));

        if (assignLogs.length > 0) {
          await tx.teamActivityLog.createMany({ data: assignLogs });
        }
      }

      return project;
    },
    { timeout: 25000 },
  );

  // Fetch full project details
  return prisma.project.findUniqueOrThrow({
    where: { id: newProject.id },
    select: {
      name: true,
      description: true,
      status: true,
      creator: {
        select: {
          id: true,
          full_name: true,
          profile_picture: true,
        },
      },
      assignments: {
        select: {
          employee: {
            select: {
              id: true,
              full_name: true,
              profile_picture: true,
            },
          },
        },
      },
    },
  });
};

export const updateProject = async (
  projectId: number,
  updateData: ProjectUpdate,
  updatedByEmployeeId: number,
) => {
  const now = new Date();

  const updatedProject = await prisma.$transaction(
    async (tx) => {
      // Fetch existing project
      const existing = await tx.project.findUnique({
        where: { id: projectId },
      });
      if (!existing) throw new Error("Project not found");

      // Update project fields
      const project = await tx.project.update({
        where: { id: projectId },
        data: {
          name: updateData.name?.trim(),
          description:
            updateData.description !== undefined
              ? (updateData.description?.trim() ?? null)
              : undefined,
          status: updateData.status,
        },
      });

      const logs: any[] = [];

      // Field-level logs for name & description
      if (updateData.name && updateData.name.trim() !== existing.name) {
        logs.push({
          entity_type: EntityType.project,
          entity_id: projectId,
          action: ActivityAction.updated,
          field_name: "name",
          old_value: existing.name,
          new_value: updateData.name.trim(),
          performed_by: updatedByEmployeeId,
          performed_at: now,
        });
      }

      if (
        updateData.description !== undefined &&
        (updateData.description?.trim() ?? null) !== existing.description
      ) {
        logs.push({
          entity_type: EntityType.project,
          entity_id: projectId,
          action: ActivityAction.updated,
          field_name: "description",
          old_value: existing.description,
          new_value: updateData.description?.trim() ?? null,
          performed_by: updatedByEmployeeId,
          performed_at: now,
        });
      }

      // Status change log
      if (updateData.status && updateData.status !== existing.status) {
        logs.push({
          entity_type: EntityType.project,
          entity_id: projectId,
          action: ActivityAction.status_changed,
          field_name: "status",
          old_value: existing.status,
          new_value: updateData.status,
          performed_by: updatedByEmployeeId,
          performed_at: now,
        });
      }

      // Handle assignees (add new, keep existing, revoke removed)
      if (updateData.assignee_ids !== undefined) {
        // Current assignments
        const currentAssignments = await tx.projectAssigner.findMany({
          where: { project_id: projectId },
          select: { employee_id: true, id: true, status: true },
        });

        const currentIds = new Set(
          currentAssignments
            .filter((a) => a.status === AssignmentStatus.active)
            .map((a) => a.employee_id),
        );
        const newIds = new Set(updateData.assignee_ids);

        // New assignees
        const assigneesToAdd = updateData.assignee_ids.filter(
          (id) => !currentIds.has(id),
        );
        if (assigneesToAdd.length > 0) {
          const validCount = await tx.employee.count({
            where: {
              id: { in: assigneesToAdd },
              is_active: true,
              is_deleted: false,
            },
          });
          if (validCount !== assigneesToAdd.length) {
            throw new Error(
              "One or more new assignee IDs are invalid or inactive",
            );
          }

          const employees = await tx.employee.findMany({
            where: { id: { in: assigneesToAdd } },
            select: { id: true, full_name: true },
          });
          const employeeMap = new Map(
            employees.map((e) => [e.id, e.full_name]),
          );

          await tx.projectAssigner.createMany({
            data: assigneesToAdd.map((id) => ({
              project_id: projectId,
              employee_id: id,
              assigned_by: updatedByEmployeeId,
              assigned_at: now,
              status: AssignmentStatus.active,
            })),
            skipDuplicates: true,
          });

          logs.push(
            ...assigneesToAdd.map((id) => ({
              entity_type: EntityType.project,
              entity_id: projectId,
              action: ActivityAction.assigned,
              field_name: `assigned_to:${id}`,
              new_value: employeeMap.get(id) || "Unknown",
              performed_by: updatedByEmployeeId,
              target_user_id: id,
              performed_at: now,
            })),
          );
        }

        // Revoke removed assignees
        const assignmentsToRevoke = currentAssignments.filter(
          (a) =>
            a.status === AssignmentStatus.active && !newIds.has(a.employee_id),
        );
        if (assignmentsToRevoke.length > 0) {
          const revokedIds = assignmentsToRevoke.map((a) => a.employee_id);

          await tx.projectAssigner.updateMany({
            where: { project_id: projectId, employee_id: { in: revokedIds } },
            data: { status: AssignmentStatus.revoked, revoked_at: now },
          });

          const employees = await tx.employee.findMany({
            where: { id: { in: revokedIds } },
            select: { id: true, full_name: true },
          });
          const employeeMap = new Map(
            employees.map((e) => [e.id, e.full_name]),
          );

          logs.push(
            ...revokedIds.map((id) => ({
              entity_type: EntityType.project,
              entity_id: projectId,
              action: ActivityAction.revoked,
              field_name: `revoked_from:${id}`,
              new_value: employeeMap.get(id) || "Unknown",
              performed_by: updatedByEmployeeId,
              target_user_id: id,
              performed_at: now,
            })),
          );
        }
      }

      // Save all logs
      if (logs.length > 0) {
        await tx.teamActivityLog.createMany({ data: logs });
      }

      return project;
    },
    { timeout: 25000 },
  );
  // Fetch full project details
  return prisma.project.findUniqueOrThrow({
    where: { id: updatedProject.id },
    select: {
      name: true,
      description: true,
      status: true,
      creator: {
        select: {
          id: true,
          full_name: true,
          profile_picture: true,
        },
      },
      assignments: {
        select: {
          employee: {
            select: {
              id: true,
              full_name: true,
              profile_picture: true,
            },
          },
        },
      },
    },
  });
};

export const addComment = async (
  projectId: number,
  employeeId: number,
  comment: string,
) => {
  if (!comment.trim()) throw new Error("Comment cannot be empty");

  const now = new Date();

  const newComment = await prisma.$transaction(async (tx) => {
    // Create the comment
    const created = await tx.projectComment.create({
      data: {
        project_id: projectId,
        employee_id: employeeId,
        comment: comment.trim(),
      },
    });

    const logComment =
      comment.length > 800 ? comment.substring(0, 97) + "..." : comment;

    // Log comment added
    await tx.teamActivityLog.create({
      data: {
        entity_type: EntityType.project,
        entity_id: projectId,
        action: ActivityAction.comment_added,
        field_name: "comment",
        new_value: logComment,
        performed_by: employeeId,
        performed_at: now,
        target_user_id: null,
      },
    });

    return created;
  });

  // comment details
  return prisma.projectComment.findUniqueOrThrow({
    where: { id: newComment.id },
    select: {
      project_id: true,
      comment: true,
      employee: {
        select: {
          id: true,
          full_name: true,
          profile_picture: true,
        },
      },
    },
  });
};

export const getCommentList = async (projectId: number) => {
  return prisma.projectComment.findMany({
    where: { 
      project_id: projectId, 
      is_active: true 
    },
    select: {
      id: true,                 
      comment: true,              
      project: {
        select: {
          id: true,        
          name: true,              
        },
      },
      employee: {
        select: {
          id: true,
          full_name: true,
          profile_picture: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

export const getFilteredProjectsList = async (user: any, filters: any) => {
  // Fetch user type from User table using employee_id
  const userRecord = await prisma.user.findFirst({
    where: { employee_id: user.id },
    select: { type: true },
  });

  if (!userRecord) throw new Error("User not found");
  const userType = userRecord.type;

  // Base where clause for active and non-deleted projects
  let whereClause: any = {
    is_active: true,
    is_deleted: false,
  };

  // Apply date range filter on created_at
  if (filters.startDate || filters.endDate) {
    whereClause.created_at = {};
    if (filters.startDate) {
      whereClause.created_at.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.created_at.lte = new Date(filters.endDate + "T23:59:59.999Z");
    }
  }

  // Apply status filter
  if (filters.statuses?.length) {
    whereClause.status = { in: filters.statuses };
  }

  // Apply created_by filter
  if (filters.createdByIds?.length) {
    whereClause.created_by = { in: filters.createdByIds };
  }

  // Determine visible project IDs based on user role
  let visibleProjectIds: number[] = [];

  if (userType === "employee" || userType === "lead") {
    // 1. Projects created by the current user
    const createdByMe = await prisma.project.findMany({
      where: {
        created_by: user.id,
        is_active: true,
        is_deleted: false,
      },
      select: { id: true },
    });
    const createdByMeIds = createdByMe.map((p) => p.id);

    // 2. Projects assigned directly to the current user
    const assignedToMe = await prisma.projectAssigner.findMany({
      where: {
        employee_id: user.id,
        status: AssignmentStatus.active,
      },
      select: { project_id: true },
    });
    const assignedToMeIds = assignedToMe.map((a) => a.project_id);

    // Combine for employee (created + assigned)
    visibleProjectIds = [...new Set([...createdByMeIds, ...assignedToMeIds])];

    // Extra logic for LEAD: include team members' projects
    if (userType === "lead") {
      // Get all team members under this lead (including self)
      const teamMembers = await prisma.teamMember.findMany({
        where: {
          team: { team_lead_id: user.id },
          is_active: true,
          is_deleted: false,
        },
        select: { employee_id: true },
      });
      const teamEmployeeIds = [
        ...teamMembers.map((m) => m.employee_id),
        user.id,
      ];

      // 3. Projects created by team members
      const createdByTeam = await prisma.project.findMany({
        where: {
          created_by: { in: teamEmployeeIds },
          is_active: true,
          is_deleted: false,
        },
        select: { id: true },
      });
      const createdByTeamIds = createdByTeam.map((p) => p.id);

      // 4. Projects assigned to team members
      const assignedToTeam = await prisma.projectAssigner.findMany({
        where: {
          employee_id: { in: teamEmployeeIds },
          status: AssignmentStatus.active,
        },
        select: { project_id: true },
        distinct: ["project_id"],
      });
      const assignedToTeamIds = assignedToTeam.map((a) => a.project_id);

      // Combine everything for lead (unique IDs)
      visibleProjectIds = [
        ...new Set([
          ...createdByMeIds,
          ...assignedToMeIds,
          ...createdByTeamIds,
          ...assignedToTeamIds,
        ]),
      ];
    }
  }
  // If employee/lead has no visible projects, return empty result
  if (
    (userType === "employee" || userType === "lead") &&
    visibleProjectIds.length === 0
  ) {
    return { projects: [], total: 0 };
  }

  // Apply visible projects filter (only for employee/lead)
  if (visibleProjectIds.length > 0) {
    whereClause.id = { in: visibleProjectIds };
  }

  // Optional assignee filter
  if (filters.assigneeIds?.length) {
    const assigneeProjects = await prisma.projectAssigner.findMany({
      where: {
        employee_id: { in: filters.assigneeIds },
        status: AssignmentStatus.active,
      },
      select: { project_id: true },
      distinct: ["project_id"],
    });
    const assigneeProjectIds = assigneeProjects.map((a) => a.project_id);

    if (visibleProjectIds.length > 0) {
      whereClause.id = {
        in: visibleProjectIds.filter((id) => assigneeProjectIds.includes(id)),
      };
    } else {
      whereClause.id = { in: assigneeProjectIds };
    }

    if (whereClause.id.in?.length === 0) {
      return { projects: [], total: 0 };
    }
  }

  // Fetch projects with all necessary relations for counts
  const projects = await prisma.project.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      // Creator info
      creator: {
        select: {
          id: true,
          full_name: true,
          profile_picture: true,
        },
      },
      // Assignments (only needed fields)
      assignments: {
        where: { status: AssignmentStatus.active },
        select: {
          assigner: {
            select: {
              id: true,
              full_name: true,
              profile_picture: true,
            },
          },
          employee: {
            select: {
              id: true,
              full_name: true,
              profile_picture: true,
            },
          },
        },
      },
      // For counts
      tasks: {
        select: {
          id: true,
          status: { select: { name: true } },
        },
      },
      tickets: {
        select: { id: true, status: true },
      },
      comments: true, // Only for project comments count
    },
    orderBy: { created_at: "desc" },
  });
  // Enrich each project with counts
  const enrichedProjects = projects.map((project) => {
    // Calculate task counts
    let pendingTasks = 0;
    let completedTasks = 0;
    project.tasks.forEach((task) => {
      const statusName = task.status?.name?.toLowerCase() || "";
      if (statusName === "completed") completedTasks++;
      else pendingTasks++;
    });

    // Calculate ticket counts
    let pendingTickets = 0;
    let completedTickets = 0;
    project.tickets.forEach((ticket) => {
      if (["resolved", "closed"].includes(ticket.status)) completedTickets++;
      else pendingTickets++;
    });

    const projectCommentsCount = project.comments.length;

    return {
      ...project,
      // Remove raw tasks/tickets to reduce response size
      tasks: undefined,
      tickets: undefined,
      counts: {
        tasks: {
          total: pendingTasks + completedTasks,
          pending: pendingTasks,
          completed: completedTasks,
        },
        tickets: {
          total: pendingTickets + completedTickets,
          pending: pendingTickets,
          completed: completedTickets,
        },
        comments: {
          project: projectCommentsCount,
          task: 0, // Will be updated in batch below
          ticket: 0, // Will be updated in batch below
          total: projectCommentsCount,
        },
      },
    };
  });

  // Batch calculate task and ticket comments count for all projects
  const projectIds = projects.map((p) => p.id);
  if (projectIds.length > 0) {
    // Task comments grouped by task_id
    const taskCommentsByProject = await prisma.taskComment.groupBy({
      by: ["task_id"],
      where: { task: { project_id: { in: projectIds } } },
      _count: { id: true },
    });

    const taskToProject = new Map<number, number>();
    projects.forEach((p) => {
      p.tasks.forEach((t) => taskToProject.set(t.id, p.id));
    });

    const taskCommentsMap = new Map<number, number>();
    taskCommentsByProject.forEach((group) => {
      const projId = taskToProject.get(group.task_id);
      if (projId) {
        taskCommentsMap.set(
          projId,
          (taskCommentsMap.get(projId) || 0) + group._count.id,
        );
      }
    });

    // Ticket comments grouped by ticket_id
    const ticketCommentsByProject = await prisma.ticketComment.groupBy({
      by: ["ticket_id"],
      where: { ticket: { project_id: { in: projectIds } } },
      _count: { id: true },
    });

    const ticketToProject = new Map<number, number>();
    projects.forEach((p) => {
      p.tickets.forEach((t) => ticketToProject.set(t.id, p.id));
    });

    const ticketCommentsMap = new Map<number, number>();
    ticketCommentsByProject.forEach((group) => {
      const projId = ticketToProject.get(group.ticket_id);
      if (projId) {
        ticketCommentsMap.set(
          projId,
          (ticketCommentsMap.get(projId) || 0) + group._count.id,
        );
      }
    });

    enrichedProjects.forEach((proj) => {
      const projId = proj.id;
      const taskCount = taskCommentsMap.get(projId) || 0;
      const ticketCount = ticketCommentsMap.get(projId) || 0;

      proj.counts.comments.task = taskCount;
      proj.counts.comments.ticket = ticketCount;
      proj.counts.comments.total =
        proj.counts.comments.project + taskCount + ticketCount;
    });
  }

  return { projects: enrichedProjects, total: enrichedProjects.length };
};

export const getAllProjects = async (
  user: any,
  dateFrom?: string,
  dateTo?: string,
) => {
  const userRecord = await prisma.user.findFirst({
    where: { employee_id: user.id },
    select: { type: true },
  });

  if (!userRecord) {
    throw new Error("User not found");
  }
  const userType = userRecord.type;

  let whereClause: any = {
    is_active: true,
    is_deleted: false,
  };

  if (dateFrom || dateTo) {
    whereClause.created_at = {};
    if (dateFrom) {
      whereClause.created_at.gte = new Date(dateFrom);
    }
    if (dateTo) {
      whereClause.created_at.lte = new Date(dateTo);
    }
  }

  let projectIds: number[] = [];

  if (userType === "employee") {
    // Only projects where user is assigned
    const assignments = await prisma.projectAssigner.findMany({
      where: {
        employee_id: user.id,
        status: AssignmentStatus.active,
      },
      select: { project_id: true },
    });
    projectIds = assignments.map((a) => a.project_id);
    if (projectIds.length === 0) return [];
    whereClause.id = { in: projectIds };
  } else if (userType === "lead") {
    // Projects where user is assigned or their team members are assigned
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        team: {
          team_lead_id: user.id,
        },
        is_active: true,
        is_deleted: false,
      },
      select: { employee_id: true },
    });
    const teamIds = teamMembers.map((m) => m.employee_id);
    teamIds.push(user.id); // include self

    const assignments = await prisma.projectAssigner.findMany({
      where: {
        employee_id: { in: teamIds },
        status: AssignmentStatus.active,
      },
      select: { project_id: true },
      distinct: ["project_id"],
    });
    projectIds = assignments.map((a) => a.project_id);
    if (projectIds.length === 0) return [];
    whereClause.id = { in: projectIds };
  }
  // For admin, hr, manager: no additional filter

  return prisma.project.findMany({
    where: whereClause,
    include: {
      assignments: {
        include: {
          employee: {
            select: {
              id: true,
              full_name: true,
              email: true,
              profile_picture: true,
            },
          },
          assigner: {
            select: { id: true, full_name: true, profile_picture: true },
          },
        },
      },
      taskStatuses: true,
    },
    orderBy: { created_at: "desc" },
  });
};
// ========================
// ASSIGN / REMOVE MEMBER (incremental )
// ========================
export const updateProjectAssignees = async (
  projectId: number,
  addIds: number[] = [],
  removeIds: number[] = [],
  performedBy: number,
) => {
  const now = new Date();

  const updated = await prisma.$transaction(
    async (tx) => {
      const project = await tx.project.findUnique({ where: { id: projectId } });
      if (!project) throw new Error("Project not found");

      const logs: any[] = [];

      // 1️⃣ ADD NEW ASSIGNEES ONLY (skip existing)
      if (addIds.length > 0) {
        const employees = await tx.employee.findMany({
          where: { id: { in: addIds }, is_active: true, is_deleted: false },
          select: { id: true, full_name: true },
        });
        const employeeMap = new Map(employees.map((e) => [e.id, e.full_name]));

        // Check existing active assignments
        const existing = await tx.projectAssigner.findMany({
          where: {
            project_id: projectId,
            employee_id: { in: addIds },
            status: AssignmentStatus.active,
          },
          select: { employee_id: true },
        });
        const existingIds = new Set(existing.map((a) => a.employee_id));

        const newToAdd = addIds.filter((id) => !existingIds.has(id));

        if (newToAdd.length > 0) {
          await tx.projectAssigner.createMany({
            data: newToAdd.map((employeeId) => ({
              project_id: projectId,
              employee_id: employeeId,
              assigned_by: performedBy,
              assigned_at: now,
              status: AssignmentStatus.active,
            })),
            skipDuplicates: true,
          });

          logs.push(
            ...newToAdd.map((assigneeId) => ({
              entity_type: EntityType.project,
              entity_id: projectId,
              action: ActivityAction.assigned,
              field_name: `assigned_to:${assigneeId}`,
              new_value: employeeMap.get(assigneeId) || "Unknown",
              performed_by: performedBy,
              target_user_id: assigneeId,
              performed_at: now,
            })),
          );

          // Reassigned log if any new assignments
          logs.push({
            entity_type: EntityType.project,
            entity_id: projectId,
            action: ActivityAction.reassigned,
            performed_by: performedBy,
            performed_at: now,
          });
        }
      }

      // 2️⃣ REVOKE (REMOVE) ASSIGNEES + LOG
      if (removeIds.length > 0) {
        const employees = await tx.employee.findMany({
          where: { id: { in: removeIds } },
          select: { id: true, full_name: true },
        });
        const employeeMap = new Map(employees.map((e) => [e.id, e.full_name]));

        await tx.projectAssigner.updateMany({
          where: {
            project_id: projectId,
            employee_id: { in: removeIds },
            status: AssignmentStatus.active,
          },
          data: {
            status: AssignmentStatus.revoked,
            revoked_at: now,
            revoked_by: performedBy,
          },
        });

        logs.push(
          ...removeIds.map((revokedId) => ({
            entity_type: EntityType.project,
            entity_id: projectId,
            action: ActivityAction.revoked,
            field_name: `revoked_from:${revokedId}`,
            old_value: employeeMap.get(revokedId) || "Unknown",
            performed_by: performedBy,
            target_user_id: revokedId,
            performed_at: now,
          })),
        );
      }

      // 3️⃣ Save all logs
      if (logs.length > 0) {
        await tx.teamActivityLog.createMany({ data: logs });
      }

      return project;
    },
    { timeout: 25000 },
  );

  // 4️⃣ Fetch full project details
  return prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: {
      assignments: {
        include: {
          employee: {
            select: {
              id: true,
              full_name: true,
              email: true,
              profile_picture: true,
            },
          },
          assigner: { select: { id: true, full_name: true } },
          revoker: { select: { id: true, full_name: true } },
        },
      },
      taskStatuses: true,
      comments: {
        include: {
          employee: {
            select: { id: true, full_name: true, profile_picture: true },
          },
        },
      },
    },
  });
};

// ========================
// ADD PROJECT STATUS
// ========================
export const addProjectStatus = async (
  projectId: number,
  name: string,
  color: string = "gray",
  createdBy: number,
) => {
  const now = new Date();
  const trimmedName = name.trim();
  const lowerName = trimmedName.toLowerCase();
  const defaultNames = ["to do", "in process", "completed"];

  if (defaultNames.includes(lowerName)) {
    throw new Error(`Default status "${name}" cannot be added or modified`);
  }

  return prisma.$transaction(
    async (tx) => {
      const existing = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id 
    FROM TaskStatusMaster 
    WHERE project_id = ${projectId} 
    AND LOWER(TRIM(name)) = ${lowerName}
    LIMIT 1
  `;

      if (existing.length > 0) {
        throw new Error(`Status with name "${name}" already exists`);
      }

      const status = await tx.taskStatusMaster.create({
        data: {
          project_id: projectId,
          name: trimmedName,
          color,
          created_by: createdBy,
          is_active: true,
        },
      });

      // Log creation
      await tx.teamActivityLog.create({
        data: {
          entity_type: EntityType.project,
          entity_id: projectId,
          action: ActivityAction.status_added,
          field_name: trimmedName,
          new_value: trimmedName,
          performed_by: createdBy,
          target_user_id: null,
          performed_at: now,
        },
      });

      return status;
    },
    { timeout: 25000 },
  );
};

// ========================
// REMOVE PROJECT STATUS (soft delete + log)
// ========================
export const removeProjectStatus = async (
  statusId: number,
  projectId: number,
  deletedBy: number,
) => {
  const now = new Date();
  const defaultNames = ["to do", "in process", "completed"];

  return prisma.$transaction(
    async (tx) => {
      const status = await tx.taskStatusMaster.findUnique({
        where: { id: statusId },
      });

      if (!status) throw new Error("Status not found");
      if (status.project_id !== projectId)
        throw new Error("Status not in this project");

      if (defaultNames.includes(status.name.toLowerCase().trim())) {
        throw new Error(`Default status "${status.name}" cannot be deleted`);
      }

      // Soft delete
      await tx.taskStatusMaster.update({
        where: { id: statusId },
        data: {
          is_active: false,
          updated_at: now,
        },
      });

      // Log removal
      await tx.teamActivityLog.create({
        data: {
          entity_type: EntityType.project,
          entity_id: projectId,
          action: ActivityAction.status_deleted,
          field_name: status.name,
          performed_by: deletedBy,
          target_user_id: null,
          performed_at: now,
        },
      });

      return { message: `Status "${status.name}" removed successfully` };
    },
    { timeout: 25000 },
  );
};

// ========================
// CREATE PROJECT
// ========================
export const getProjectEmployees = async (user: any) => {
  const userRecord = await prisma.user.findFirst({
    where: { employee_id: user.id },
    select: { type: true },
  });

  if (!userRecord) {
    throw new Error("User not found");
  }
  const userType = userRecord.type;

  let employeeIds: number[] = [];

  if (userType === "employee") {
    // Members of their own teams, including self
    const teams = await prisma.teamMember.findMany({
      where: { employee_id: user.id, is_active: true, is_deleted: false },
      select: { team_id: true },
    });
    const teamIds = teams.map((t) => t.team_id);

    if (teamIds.length === 0) {
      // If no team, just self
      employeeIds = [user.id];
    } else {
      const members = await prisma.teamMember.findMany({
        where: { team_id: { in: teamIds }, is_active: true, is_deleted: false },
        select: { employee_id: true },
      });
      employeeIds = [...new Set(members.map((m) => m.employee_id))]; // unique
    }
  } else if (userType === "lead") {
    // Their team members
    const myTeamMembers = await prisma.teamMember.findMany({
      where: {
        team: { team_lead_id: user.id },
        is_active: true,
        is_deleted: false,
      },
      select: { employee_id: true },
    });
    employeeIds = myTeamMembers.map((m) => m.employee_id);
    employeeIds.push(user.id); // include self if needed

    // Leads of other teams
    const otherLeads = await prisma.team.findMany({
      where: {
        team_lead_id: { not: user.id },
        is_active: true,
        is_deleted: false,
      },
      select: { team_lead_id: true },
    });
    const otherLeadIds = otherLeads
      .map((l) => l.team_lead_id)
      .filter((id) => id !== null) as number[];
    employeeIds = [...new Set([...employeeIds, ...otherLeadIds])];
  } else {
    // admin, hr, manager: all
    const all = await prisma.employee.findMany({
      where: { is_active: true, is_deleted: false },
      select: { id: true },
    });
    employeeIds = all.map((e) => e.id);
  }

  if (employeeIds.length === 0) return [];

  return prisma.employee.findMany({
    where: { id: { in: employeeIds }, is_active: true, is_deleted: false },
    select: {
      id: true,
      full_name: true,
      profile_picture: true,
    },
    orderBy: { id: "asc" },
  });
};

// ========================
// CREATE PROJECT
// ========================
