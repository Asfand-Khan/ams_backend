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
  ProjectFilter,
} from "../validations/projectValidations";
import {
  addComment,
  addProjectStatus,
  createProject,
  getAllProjects,
  getCommentList,
  getFilteredProjectsList,
  getProjectEmployees,
  removeProjectStatus,
  updateProject,
  updateProjectAssignees,
} from "../services/projectServices";

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
    const filters: ProjectFilter = projectFilterSchema.parse(req.body);
    const { projects, total } = await getFilteredProjectsList(req.userRecord, filters);
    return res.status(200).json({
      status: 1,
      message: projects.length ? "Projects fetched successfully" : "No projects found",
      data: projects,
      meta: { total, filteredCount: projects.length },
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      data: [],
      meta: { total: 0, filteredCount: 0 },
    });
  }
};

// Module --> Project
// Method --> GET (Protected)
// Endpoint --> /api/v1/projects
// Description --> Get Project List
export const getAllProjectsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query; // e.g., ?dateFrom=2026-01-01&dateTo=2026-01-31
    const projects = await getAllProjects(req.userRecord, dateFrom as string, dateTo as string);

    return res.status(200).json({
      status: 1,
      message: "Projects listed successfully",
      data: projects, // changed to data for consistency
    });
  } catch (error) {
    const err = handleAppError(error);
    return res
      .status(err.status || 400)
      .json({ status: 0, message: err.message, data: [] });
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
    if (isNaN(projectId))
      return res
        .status(400)
        .json({ status: 0, message: "Invalid project ID", payload: [] });

    const comments = await getCommentList(projectId);

    return res.status(200).json({
      status: 1,
      message: "Comments listed successfully",
      payload: comments,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res
      .status(err.status || 400)
      .json({ status: 0, message: err.message, payload: [] });
  }
};

// ASSIGN / REMOVE MEMBER
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

// ADD PROJECT STATUS
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

// REMOVE PROJECT STATUS
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
export const getProjectEmployeesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const employees = await getProjectEmployees(req.userRecord);

    return res.status(200).json({
      status: 1,
      message: "Project employees listed successfully",
      data: employees,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res
      .status(err.status || 400)
      .json({ status: 0, message: err.message, data: [] });
  }
};
