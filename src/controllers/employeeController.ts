import prisma from "../config/db";
import { NextFunction, Request, Response } from "express";
import {
  employeeChangePasswordSchema,
  employeeDocumentCreateSchema,
  employeeDocumentUpdateSchema,
  employeeProfileSchema,
  employeeSchema,
  employeeUpdateAdminSchema,
  employeeUpdateProfileSchema,
} from "../validations/employeeValidations";
import {
  changeEmployeePassword,
  createEmployee,
  getAllEmployees,
  getAllUsersWithEmployee,
  getEmployeeByCnic,
  getEmployeeByCode,
  getEmployeeByEmail,
  getEmployeeById,
  getEmployeeByPhone,
  getEmployeeByUsername,
  getEmployeeDocuments,
  getEmployeeProfileById,
  getSingleEmployeeFullDetails,
  updateEmployeeAdmin,
  updateEmployeeDocument,
  updateEmployeeProfile,
  updateEmployeeStatusAndSyncUser,
  uploadEmployeeDocuments,
} from "../services/employeeServices";
import { comparePassword, getUserByEmployeeId } from "../services/authServices";
import { handleAppError } from "../utils/appErrorHandler";
import { sendEmail } from "../utils/sendEmail";
import { getSignUpTemplate } from "../utils/signUpTemplate";
import { AuthRequest } from "../types/types";

// Module --> Employee
// Method --> POST (Protected)
// Endpoint --> /api/v1/employees
// Description --> Create employee
export const createEmployeeHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const parsedEmployee = employeeSchema.parse(req.body);

    const employeeByCode = await getEmployeeByCode(
      parsedEmployee.employee_code,
    );

    if (employeeByCode) {
      return res.status(400).json({
        status: 0,
        message: "Employee with this employee code already exists",
        payload: [],
      });
    }

    const employeeByUsername = await getEmployeeByUsername(
      parsedEmployee.username,
    );

    if (employeeByUsername) {
      return res.status(400).json({
        status: 0,
        message: "Employee with this username already exists",
        payload: [],
      });
    }

    const employeeByEmail = await getEmployeeByEmail(parsedEmployee.email);

    if (employeeByEmail) {
      return res.status(400).json({
        status: 0,
        message: "Employee with this email already exists",
        payload: [],
      });
    }

    if (parsedEmployee.cnic) {
      const employeeByCnic = await getEmployeeByCnic(parsedEmployee.cnic);

      if (employeeByCnic) {
        return res.status(400).json({
          status: 0,
          message: "Employee with this cnic already exists",
          payload: [],
        });
      }
    }

    if (parsedEmployee.phone) {
      const employeeByPhone = await getEmployeeByPhone(parsedEmployee.phone);

      if (employeeByPhone) {
        return res.status(400).json({
          status: 0,
          message: "Employee with this phone number already exists",
          payload: [],
        });
      }
    }

    const newEmployee = await createEmployee(parsedEmployee);

    if (newEmployee) {
      await sendEmail({
        to: newEmployee.email,
        subject: "Orio Connect - Employee Registration",
        html: getSignUpTemplate(
          newEmployee.full_name,
          newEmployee.username,
          newEmployee.password,
          "https://play.google.com/apps/internaltest/4701019820844510404",
        ),
      });
    }

    return res.status(201).json({
      status: 1,
      message: "Employee created successfully",
      payload: [newEmployee],
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

export const changeEmployeePasswordHandler = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const parsedData = employeeChangePasswordSchema.parse(req.body);

    const employee = await getEmployeeById(parsedData.employee_id);
    if (!employee) {
      return res.status(404).json({
        status: 0,
        message: "Employee not found",
        payload: [],
      });
    }

    const user = await getUserByEmployeeId(parsedData.employee_id);
    if (!user) {
      return res.status(404).json({
        status: 0,
        message: "User associated with employee does not exists",
        payload: [],
      });
    }

    const isPasswordValid = comparePassword(
      parsedData.old_password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 0,
        message: "Invalid old password",
        payload: [],
      });
    }

    await changeEmployeePassword(user.id, parsedData.new_password);

    return res.status(200).json({
      status: 1,
      message: "Employee password changed successfully",
      payload: [employee],
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

export const getEmployeeProfileHandler = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const parsedData = employeeProfileSchema.parse(req.body);

    const employee = await getEmployeeProfileById(parsedData.employee_id);
    if (!employee) {
      return res.status(404).json({
        status: 0,
        message: "Employee not found",
        payload: [],
      });
    }

    return res.status(200).json({
      status: 1,
      message: "Employee profile fetched successfully",
      payload: employee,
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

export const updateEmployeeProfileHandler = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const parsedData = employeeUpdateProfileSchema.parse(req.body);

    const employee = await getEmployeeProfileById(parsedData.employee_id);
    if (!employee) {
      return res.status(404).json({
        status: 0,
        message: "Employee not found",
        payload: [],
      });
    }

    const updatedEmployee = await updateEmployeeProfile(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Employee profile updated successfully",
      payload: [updatedEmployee],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      success: 0,
      message: err.message,
      payload: [],
    });
  }
};

export const getAllEmployeesHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Ensure user is attached by authentication middleware
    if (!req.userRecord) {
      return res.status(401).json({
        status: 0,
        message: "User not authenticated",
        payload: [],
      });
    }

    const employees = await getAllEmployees(req.userRecord);
    return res.status(200).json({
      status: 1,
      message: "All employees fetched successfully",
      payload: employees,
    });
  } catch (error) {
    const err = handleAppError(error); // Assuming handleAppError is defined elsewhere
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

export const getAllUsersHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userRecord) {
      return res.status(401).json({
        status: 0,
        message: "User not authenticated",
        payload: [],
      });
    }

    const employees = await getAllUsersWithEmployee(req.userRecord);
    return res.status(200).json({
      status: 1,
      message: "All users fetched successfully",
      payload: employees,
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

// PUT /api/v1/employees/:id
export const updateEmployeeHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const employeeId = Number(req.params.id);
    if (isNaN(employeeId)) {
      return res.status(400).json({
        status: 0,
        message: "Invalid employee ID",
        payload: [],
      });
    }

    const parsedData = employeeUpdateAdminSchema.parse({
      ...req.body,
      employee_id: employeeId,
    });
    const currentUser = await prisma.user.findFirst({
      where: {
        employee_id: req.userRecord?.id,
      },
      select: {
        type: true,
      },
    });

    if (!currentUser) {
      return res.status(403).json({
        status: 0,
        message: "No user account found for the current logged-in employee",
        payload: [],
      });
    }

    if (!["admin", "hr", "lead"].includes(currentUser.type)) {
      return res.status(403).json({
        status: 0,
        message: "Unauthorized: Only admin or HR can update employees",
        payload: [],
      });
    }

    const updatedEmployee = await updateEmployeeAdmin(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Employee updated successfully",
      payload: [updatedEmployee],
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

// PUT /api/v1/employees/:id/status
export const updateEmployeeStatusHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const employeeId = Number(req.params.id);
    if (isNaN(employeeId)) {
      return res.status(400).json({
        status: 0,
        message: "Invalid employee ID",
        payload: [],
      });
    }

    const { status } = req.body;

    if (!["active", "inactive", "terminated"].includes(status)) {
      return res.status(400).json({
        status: 0,
        message: "Invalid status. Allowed: active, inactive, terminated",
        payload: [],
      });
    }
    const requestingUser = await prisma.user.findFirst({
      where: {
        employee_id: req.userRecord?.id,
      },
      select: {
        type: true,
      },
    });

    if (!requestingUser) {
      return res.status(403).json({
        status: 0,
        message: "No user account found for the current logged-in employee",
        payload: [],
      });
    }

    if (!["admin", "hr", "lead"].includes(requestingUser.type)) {
      return res.status(403).json({
        status: 0,
        message: "Only admin or HR can change employee status",
        payload: [],
      });
    }
    const updatedData = await updateEmployeeStatusAndSyncUser(
      employeeId,
      status as "active" | "inactive" | "terminated",
    );

    return res.status(200).json({
      status: 1,
      message: `Employee status updated to ${status} successfully`,
      payload: [updatedData],
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
export const getSingleEmployeeFullHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const employeeId = Number(req.params.id);
    if (isNaN(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        status: 0,
        message: "Invalid employee ID",
        payload: null,
      });
    }

    if (!req.userRecord) {
      return res.status(401).json({
        status: 0,
        message: "Unauthorized - user not authenticated",
        payload: null,
      });
    }

    // Optional: permission check
    const currentUserType = await prisma.user.findFirst({
      where: { employee_id: req.userRecord.id },
      select: { type: true },
    });

    const allowedTypes = ["admin", "hr", "lead"];
    const isSelf = req.userRecord.id === employeeId;

    if (!isSelf && !allowedTypes.includes(currentUserType?.type || "")) {
      return res.status(403).json({
        status: 0,
        message: "Unauthorized to view full employee details",
        payload: null,
      });
    }

    const fullData = await getSingleEmployeeFullDetails(employeeId);

    return res.status(200).json({
      status: 1,
      message: "Employee full details fetched successfully",
      payload: [fullData],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 404).json({
      status: 0,
      message: err.message || "Employee not found",
      payload: null,
    });
  }
};
// POST /api/v1/employees/documents
export const uploadEmployeeDocumentsHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.userRecord?.id) {
      return res
        .status(401)
        .json({ status: 0, message: "Unauthorized", payload: [] });
    }

    const parsed = employeeDocumentCreateSchema.parse(req.body);
    const documents = await uploadEmployeeDocuments(parsed, req.userRecord.id);

    return res.status(201).json({
      status: 1,
      message: "Documents uploaded successfully",
      payload: documents,
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

// PUT /api/v1/employees/documents/:id
export const updateEmployeeDocumentHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const docId = Number(req.params.id);
    if (isNaN(docId)) {
      return res
        .status(400)
        .json({ status: 0, message: "Invalid document ID", payload: [] });
    }

    if (!req.userRecord?.id) {
      return res
        .status(401)
        .json({ status: 0, message: "Unauthorized", payload: [] });
    }

    const parsed = employeeDocumentUpdateSchema.parse({
      ...req.body,
      document_id: docId,
    });
    const updatedDoc = await updateEmployeeDocument(parsed, req.userRecord.id);

    return res.status(200).json({
      status: 1,
      message: "Document updated successfully",
      payload: [updatedDoc],
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

// GET /api/v1/employees/:employeeId/documents
export const getEmployeeDocumentsHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (isNaN(employeeId)) {
      return res
        .status(400)
        .json({ status: 0, message: "Invalid employee ID", payload: [] });
    }

    const documents = await getEmployeeDocuments(employeeId);

    return res.status(200).json({
      status: 1,
      message: "Employee documents fetched successfully",
      payload: documents,
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
