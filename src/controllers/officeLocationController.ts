import { Request, Response } from "express";
import { z } from "zod";
import { createDepartment, getAllDepartments, getDepartmentById, getDepartmentByName, updateDepartment } from "../services/departmentServices";
import { DepartmentSchema, DepartmentUpdateSchema } from "../validations/departmentValidations";
import { getAllOfficeLocations } from "../services/officeLocationServices";

// Module --> Office Locations
// Method --> GET (Protected)
// Endpoint --> /api/v1/office-locations
// Description --> Fetch all office locations
export const getAllOfficeLocationsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const locations = await getAllOfficeLocations();
    return res.status(200).json({
      status: 1,
      message: "Office locations fetched successfully",
      payload: locations,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
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

    const departmentByName = await getDepartmentByName(
      parsedDepartment.name
    );

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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Office Location
// Method --> GET (Protected)
// Endpoint --> /api/v1/office-locations/:id
// Description --> Get single department
export const getSingleDepartmentHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const deptId = parseInt(req.params.id);

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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
