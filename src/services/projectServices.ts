import prisma from "../config/db";
import {
  ProjectCreate,
  ProjectFilter,
  ProjectLogFilter,
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
      if (updateData.assignee_ids !== undefined) {
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
      if (logs.length > 0) {
        await tx.teamActivityLog.createMany({ data: logs });
      }

      return project;
    },
    { timeout: 25000 },
  );
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
    const created = await tx.projectComment.create({
      data: {
        project_id: projectId,
        employee_id: employeeId,
        comment: comment.trim(),
      },
    });

    const logComment =
      comment.length > 800 ? comment.substring(0, 97) + "..." : comment;
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

export const getCommentList = async (
  projectId: number,
  filters: { page?: number; limit?: number },
) => {
  const { page, limit } = filters;
  const shouldPaginate = page !== undefined && limit !== undefined;

  const total = await prisma.projectComment.count({
    where: { project_id: projectId, is_active: true },
  });

  const comments = await prisma.projectComment.findMany({
    where: {
      project_id: projectId,
      is_active: true,
    },
    select: {
      id: true,
      comment: true,
      created_at: true,
      employee: {
        select: {
          id: true,
          full_name: true,
          profile_picture: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
    skip: shouldPaginate ? (page! - 1) * limit! : undefined,
    take: shouldPaginate ? limit! : undefined,
  });

  return { comments, total };
};

export const getFilteredProjectsList = async (
  user: any,
  filters: ProjectFilter,
) => {
  const { page, limit, ...filterParams } = filters;
  const shouldPaginate = page !== undefined && limit !== undefined;
  const userRecord = await prisma.user.findFirst({
    where: { employee_id: user.id },
    select: { type: true },
  });

  if (!userRecord) throw new Error("User not found");
  const userType = userRecord.type;

  let visibleProjectIds: number[] = [];

  if (userType === "employee" || userType === "lead") {
    const createdByMe = await prisma.project.findMany({
      where: {
        created_by: user.id,
        is_active: true,
        is_deleted: false,
      },
      select: { id: true },
    });
    const createdByMeIds = createdByMe.map((p) => p.id);

    const assignedToMe = await prisma.projectAssigner.findMany({
      where: {
        employee_id: user.id,
        status: AssignmentStatus.active,
      },
      select: { project_id: true },
    });
    const assignedToMeIds = assignedToMe.map((a) => a.project_id);

    visibleProjectIds = [...new Set([...createdByMeIds, ...assignedToMeIds])];

    if (userType === "lead") {
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

      const createdByTeam = await prisma.project.findMany({
        where: {
          created_by: { in: teamEmployeeIds },
          is_active: true,
          is_deleted: false,
        },
        select: { id: true },
      });
      const createdByTeamIds = createdByTeam.map((p) => p.id);

      const assignedToTeam = await prisma.projectAssigner.findMany({
        where: {
          employee_id: { in: teamEmployeeIds },
          status: AssignmentStatus.active,
        },
        select: { project_id: true },
        distinct: ["project_id"],
      });
      const assignedToTeamIds = assignedToTeam.map((a) => a.project_id);

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

  let whereClause: any = {
    is_active: true,
    is_deleted: false,
  };

  if (visibleProjectIds.length > 0) {
    whereClause.id = { in: visibleProjectIds };
  }
  if (filterParams.startDate || filterParams.endDate) {
    whereClause.created_at = {
      gte: filterParams.startDate
        ? new Date(`${filterParams.startDate}T00:00:00.000Z`)
        : undefined,
      lte: filterParams.endDate
        ? new Date(`${filterParams.endDate}T23:59:59.999Z`)
        : undefined,
    };
  }

  if (filterParams.statuses?.length) {
    whereClause.status = { in: filterParams.statuses };
  }

  if (filterParams.createdByIds?.length) {
    whereClause.created_by = { in: filterParams.createdByIds };
  }

  if (filterParams.assigneeIds?.length) {
    const assigneeProjects = await prisma.projectAssigner.findMany({
      where: {
        employee_id: { in: filterParams.assigneeIds },
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
  }

  const total = await prisma.project.count({ where: whereClause });

  const projects = await prisma.project.findMany({
    where: whereClause,
    skip: shouldPaginate ? (page! - 1) * limit! : undefined,
    take: shouldPaginate ? limit! : undefined,
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      created_at: true,
      creator: {
        select: {
          id: true,
          full_name: true,
          profile_picture: true,
        },
      },
      assignments: {
        where: { status: AssignmentStatus.active },
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
    orderBy: { created_at: "desc" },
  });

  return { projects, total };
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
    teamIds.push(user.id);

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
      if (addIds.length > 0) {
        const employees = await tx.employee.findMany({
          where: { id: { in: addIds }, is_active: true, is_deleted: false },
          select: { id: true, full_name: true },
        });
        const employeeMap = new Map(employees.map((e) => [e.id, e.full_name]));
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
          logs.push({
            entity_type: EntityType.project,
            entity_id: projectId,
            action: ActivityAction.reassigned,
            performed_by: performedBy,
            performed_at: now,
          });
        }
      }
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
      if (logs.length > 0) {
        await tx.teamActivityLog.createMany({ data: logs });
      }

      return project;
    },
    { timeout: 25000 },
  );
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
    const teams = await prisma.teamMember.findMany({
      where: { employee_id: user.id, is_active: true, is_deleted: false },
      select: { team_id: true },
    });
    const teamIds = teams.map((t) => t.team_id);

    if (teamIds.length === 0) {
      employeeIds = [user.id];
    } else {
      const members = await prisma.teamMember.findMany({
        where: { team_id: { in: teamIds }, is_active: true, is_deleted: false },
        select: { employee_id: true },
      });
      employeeIds = [...new Set(members.map((m) => m.employee_id))];
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
    employeeIds.push(user.id);
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

export const getProjectHistoryLogs = async (
  projectId: number,
  filters: ProjectLogFilter,
  currentUser: any,
) => {
  const { page, limit, ...logFilters } = filters;
  const shouldPaginate = page !== undefined && limit !== undefined;

  // Permission check
  const userRecord = await prisma.user.findFirst({
    where: { employee_id: currentUser.id },
    select: { type: true },
  });

  if (!userRecord) throw new Error("User not found");
  const userType = userRecord.type;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, created_by: true },
  });
  if (!project) throw new Error("Project not found");

  let canAccess = false;
  if (["admin", "hr", "manager"].includes(userType)) {
    canAccess = true;
  } else if (["lead", "employee"].includes(userType)) {
    if (project.created_by === currentUser.id) canAccess = true;
    else {
      const assignment = await prisma.projectAssigner.findFirst({
        where: {
          project_id: projectId,
          employee_id: currentUser.id,
          status: AssignmentStatus.active,
        },
      });
      if (assignment) canAccess = true;

      if (userType === "lead" && !canAccess) {
        const teamMembers = await prisma.teamMember.findMany({
          where: {
            team: { team_lead_id: currentUser.id },
            is_active: true,
            is_deleted: false,
          },
          select: { employee_id: true },
        });
        const teamIds = teamMembers.map((m) => m.employee_id);

        const teamAssignment = await prisma.projectAssigner.findFirst({
          where: {
            project_id: projectId,
            employee_id: { in: teamIds },
            status: AssignmentStatus.active,
          },
        });
        if (teamAssignment) canAccess = true;
      }
    }
  }

  if (!canAccess) throw new Error("Unauthorized to view project logs");

  let where: any = {
    entity_type: EntityType.project,
    entity_id: projectId,
  };
  if (logFilters.startDate || logFilters.endDate) {
    where.performed_at = {
      gte: logFilters.startDate
        ? new Date(`${logFilters.startDate}T00:00:00.000Z`)
        : undefined,
      lte: logFilters.endDate
        ? new Date(`${logFilters.endDate}T23:59:59.999Z`)
        : undefined,
    };
  }

  if (logFilters.actions?.length) where.action = { in: logFilters.actions };
  if (logFilters.performedByIds?.length)
    where.performed_by = { in: logFilters.performedByIds };

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
};
