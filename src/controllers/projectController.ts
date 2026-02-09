import { AuthRequest } from "../types/types";
import { Response } from "express";
import { handleAppError } from "../utils/appErrorHandler";
import prisma from "../config/db";
import {
  projectCreateSchema,
  projectUpdateSchema,
  projectAssigneesSchema,
  taskStatusSchema,
  projectCommentSchema,
  projectFilterSchema,
  projectLogFilterSchema,
} from "../validations/projectValidations";
import {
  addComment,
  addProjectStatus,
  createProject,
  getAllProjects,
  getCommentList,
  getFilteredProjectsList,
  getProjectEmployees,
  getProjectHistoryLogs,
  removeProjectStatus,
  updateProject,
  updateProjectAssignees,
} from "../services/projectServices";
import { formatProfessionalTimelineEntry } from "../utils/teamActivityLogsHelper";

// Module --> Project
// Method --> POST (Protected)
// Endpoint --> /api/v1/projects
// Description --> Create project with default statuses and assignments
export const createProjectHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userRecord?.id) {
      return res.status(401).json({
        status: 0,
        message: "Unauthorized user",
        payload: [],
      });
    }
    const parsed = projectCreateSchema.parse(req.body);

    const creatorExists = await prisma.employee.findFirst({
      where: {
        id: req.userRecord.id,
        is_active: true,
        is_deleted: false,
      },
      select: { id: true },
    });
    if (!creatorExists) {
      return res.status(401).json({
        status: 0,
        message: "Invalid user account",
        payload: [],
      });
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        name: parsed.name.toLowerCase(),
        is_active: true,
        is_deleted: false,
      },
      select: { id: true },
    });

    if (existingProject) {
      return res.status(409).json({
        status: 0,
        message: "Project with this name already exists",
        payload: [],
      });
    }

    if (parsed.assignee_ids?.length) {
      const validEmployees = await prisma.employee.count({
        where: {
          id: { in: parsed.assignee_ids },
          is_active: true,
          is_deleted: false,
        },
      });

      if (validEmployees !== parsed.assignee_ids.length) {
        return res.status(400).json({
          status: 0,
          message: "One or more assignee IDs are invalid",
          payload: [],
        });
      }
    }

    const project = await createProject(parsed, req.userRecord.id);

    return res.status(201).json({
      status: 1,
      message: "Project created successfully",
      payload: [project],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 500).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Project
// Method --> PUT (Protected)
// Endpoint --> /api/v1/projects/:id
// Description --> Update project
export const updateProjectHandler = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.id);
    if (isNaN(projectId))
      return res
        .status(400)
        .json({ status: 0, message: "Invalid project ID", payload: [] });

    const parsed = projectUpdateSchema.parse(req.body);

    const project = await updateProject(projectId, parsed, req.userRecord!.id);

    return res.status(200).json({
      status: 1,
      message: "Project updated successfully",
      payload: [project],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res
      .status(err.status || 400)
      .json({ status: 0, message: err.message, payload: [] });
  }
};

// Module --> Project
// Method --> POST (Protected)
// Endpoint --> /api/v1/:projectId/comments
// Description --> Add Comment
export const addCommentHandler = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    if (isNaN(projectId))
      return res
        .status(400)
        .json({ status: 0, message: "Invalid project ID", payload: [] });

    const parsed = projectCommentSchema.parse(req.body);

    const comment = await addComment(
      projectId,
      req.userRecord!.id,
      parsed.comment,
    );

    return res.status(201).json({
      status: 1,
      message: "Comment added successfully",
      payload: [comment],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res
      .status(err.status || 400)
      .json({ status: 0, message: err.message, payload: [] });
  }
};

// Module --> Project
// Method --> GET (Protected)
// Endpoint --> /api/v1/projects/list
// Description --> Get Project List With Filters
export const projectsListHandler = async (req: AuthRequest, res: Response) => {
  try {
    const filters = projectFilterSchema.parse(req.body);
    const shouldPaginate =
      filters.page !== undefined && filters.limit !== undefined;

    const { projects, total } = await getFilteredProjectsList(
      req.userRecord,
      filters,
    );

    return res.status(200).json({
      status: 1,
      message: projects.length
        ? "Projects fetched successfully"
        : "No projects found",
      payload: projects,
      ...(shouldPaginate && {
        pagination: {
          total,
          page: filters.page!,
          limit: filters.limit!,
          totalPages: Math.ceil(total / filters.limit!),
          hasNext: filters.page! * filters.limit! < total,
          hasPrev: filters.page! > 1,
        },
      }),
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Project
// Method --> GET (Protected)
// Endpoint --> /api/v1/projects
// Description --> Get Project List
export const getAllProjectsHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const projects = await getAllProjects(
      req.userRecord,
      dateFrom as string,
      dateTo as string,
    );

    return res.status(200).json({
      status: 1,
      message: "Projects listed successfully",
      payload: projects,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res
      .status(err.status || 400)
      .json({ status: 0, message: err.message, payload: [] });
  }
};

// Module --> Project
// Method --> GET (Protected)
// Endpoint --> /api/v1/:projectId/comments
// Description --> Get Project Comments
export const getCommentListHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const projectId = Number(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({
        status: 0,
        message: "Invalid project ID",
        payload: [],
      });
    }
    const page =
      typeof req.body.page === "number" &&
      Number.isInteger(req.body.page) &&
      req.body.page > 0
        ? req.body.page
        : undefined;
    const limit =
      typeof req.body.limit === "number" &&
      Number.isInteger(req.body.limit) &&
      req.body.limit > 0 &&
      req.body.limit <= 100
        ? req.body.limit
        : undefined;
    const shouldPaginate = page !== undefined && limit !== undefined;
    projectFilterSchema.parse(req.body);
    const { comments, total } = await getCommentList(projectId, {
      page,
      limit,
    });
    const response: any = {
      status: 1,
      message: comments.length
        ? "Comments listed successfully"
        : "No comments found",
      payload: comments,
    };
    if (shouldPaginate) {
      response.pagination = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// ── Update Project Assignees ─────────────────────────────────────────
export const updateProjectAssigneesHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const projectId = Number(req.params.projectId);
    if (isNaN(projectId))
      return res
        .status(400)
        .json({ status: 0, message: "Invalid project ID", payload: [] });

    const parsed = projectAssigneesSchema.parse(req.body);

    const project = await updateProjectAssignees(
      projectId,
      parsed.add,
      parsed.remove,
      req.userRecord!.id,
    );

    return res.status(200).json({
      status: 1,
      message: "Members assigned/removed successfully",
      payload: [project],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res
      .status(err.status || 400)
      .json({ status: 0, message: err.message, payload: [] });
  }
};

// ── Add Project Status ───────────────────────────────────────────────
export const addProjectStatusHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const projectId = Number(req.params.projectId);
    if (isNaN(projectId))
      return res
        .status(400)
        .json({ status: 0, message: "Invalid project ID", payload: [] });

    const parsed = taskStatusSchema.parse(req.body);

    const status = await addProjectStatus(
      projectId,
      parsed.name,
      parsed.color,
      req.userRecord!.id,
    );

    return res.status(201).json({
      status: 1,
      message: "Project status added successfully",
      payload: [status],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res
      .status(err.status || 400)
      .json({ status: 0, message: err.message, payload: [] });
  }
};

// ── Remove Project Status ────────────────────────────────────────────
export const removeProjectStatusHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const projectId = Number(req.params.projectId);
    const statusId = Number(req.params.statusId);
    if (isNaN(projectId) || isNaN(statusId))
      return res
        .status(400)
        .json({ status: 0, message: "Invalid IDs", payload: [] });

    const result = await removeProjectStatus(
      statusId,
      projectId,
      req.userRecord!.id,
    );

    return res.status(200).json({
      status: 1,
      message: result.message,
      payload: [],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res
      .status(err.status || 400)
      .json({ status: 0, message: err.message, payload: [] });
  }
};

// ── Get Project Employees ────────────────────────────────────────────
export const getProjectEmployeesHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employees = await getProjectEmployees(req.userRecord);

    return res.status(200).json({
      status: 1,
      message: "Project employees listed successfully",
      payload: employees,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res
      .status(err.status || 400)
      .json({ status: 0, message: err.message, payload: [] });
  }
};

export const getProjectHistoryLogsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);

    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project identifier",
        payload: null,
      });
    }

    const filters = projectLogFilterSchema.parse(req.body);

    const { logs, total } = await getProjectHistoryLogs(
      projectId,
      filters,
      req.userRecord!,
    );

    const timeline = logs.map(formatProfessionalTimelineEntry);

    const isPaginated = filters.page !== undefined && filters.limit !== undefined;

    return res.status(200).json({
      success: true,
      message: timeline.length
        ? "Project activity timeline retrieved successfully"
        : "No activity records found for this project",
      payload: timeline,
      ...(isPaginated && {
        pagination: {
          total,
          page: filters.page!,
          limit: filters.limit!,
          totalPages: Math.ceil(total / filters.limit!),
          hasNext: filters.page! * filters.limit! < total,
          hasPrev: filters.page! > 1,
        },
      }),
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      success: false,
      message: err.message || "Failed to retrieve project activity timeline",
      payload: null,
    });
  }
};