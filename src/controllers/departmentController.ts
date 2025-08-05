import { Request, Response } from "express";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  getDepartmentByName,
  updateDepartment,
} from "../services/departmentServices";
import {
  DepartmentSchema,
  DepartmentUpdateSchema,
} from "../validations/departmentValidations";
import { handleAppError } from "../utils/appErrorHandler";

// Module --> Department
// Method --> GET (Protected)
// Endpoint --> /api/v1/departments
// Description --> Fetch all departments
export const getAllDepartmentsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const departments = await getAllDepartments();
    return res.status(200).json({
      status: 1,
      message: "Departments fetched successfully",
      payload: departments,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Departments
// Method --> POST (Protected)
// Endpoint --> /api/v1/departments
// Description --> Create Department
export const createDepartmentHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedDepartment = DepartmentSchema.parse(req.body);

    const departmentByName = await getDepartmentByName(parsedDepartment.name);

    if (departmentByName) {
      return res.status(400).json({
        status: 0,
        message: "Department with this name already exists",
        payload: [],
      });
    }

    const newDepartment = await createDepartment(parsedDepartment);

    return res.status(201).json({
      status: 1,
      message: "Department created successfully",
      payload: [newDepartment],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Department
// Method --> GET (Protected)
// Endpoint --> /api/v1/departments/:id
// Description --> Get single department
export const getSingleDepartmentHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const deptId = parseInt(req.body.id);

    if (isNaN(deptId) || deptId <= 0) {
      throw new Error("Invalid department id or department id can not be 0");
    }

    const singleDepartment = await getDepartmentById(deptId);

    if (!singleDepartment) {
      throw new Error("Department not found");
    }

    return res.status(200).json({
      status: 1,
      message: "Fetched single department successfully",
      payload: [singleDepartment],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Department
// Method --> PUT (Protected)
// Endpoint --> /api/v1/departments/
// Description --> Update department
export const updateDepartmentHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedDepartment = DepartmentUpdateSchema.parse(req.body);

    const updatedDepartment = await updateDepartment(parsedDepartment);

    return res.status(200).json({
      status: 1,
      message: "Department updated successfully",
      payload: [updatedDepartment],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
