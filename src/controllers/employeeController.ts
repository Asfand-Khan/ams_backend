import { Request, Response } from "express";
import { z } from "zod";
import {
  employeeChangePasswordSchema,
  employeeProfileSchema,
  employeeSchema,
  employeeUpdateProfileSchema,
} from "../validations/employeeValidations";
import {
  changeEmployeePassword,
  createEmployee,
  getAllEmployees,
  getEmployeeByCnic,
  getEmployeeByCode,
  getEmployeeByEmail,
  getEmployeeById,
  getEmployeeByPhone,
  getEmployeeByUsername,
  getEmployeeProfileById,
  updateEmployeeProfile,
} from "../services/employeeServices";
import { comparePassword, getUserByEmployeeId } from "../services/authServices";
import { handleAppError } from "../utils/appErrorHandler";

// Module --> Employee
// Method --> POST (Protected)
// Endpoint --> /api/v1/employees
// Description --> Create employee
export const createEmployeeHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedEmployee = employeeSchema.parse(req.body);

    const employeeByCode = await getEmployeeByCode(
      parsedEmployee.employee_code
    );

    if (employeeByCode) {
      return res.status(400).json({
        status: 0,
        message: "Employee with this employee code already exists",
        payload: [],
      });
    }

    const employeeByUsername = await getEmployeeByUsername(
      parsedEmployee.username
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
      // await sendEmail({
      //   to: newEmployee.email,
      //   subject: "Employee Registration",
      //   html: getSignUpTemplate(
      //     newEmployee.full_name,
      //     newEmployee.username,
      //     newEmployee.password,
      //     "https://getorio.com/"
      //   ),
      // });
    }

    return res.status(201).json({
      status: 1,
      message: "Employee created successfully",
      payload: [newEmployee],
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

export const changeEmployeePasswordHandler = async (
  req: Request,
  res: Response
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
      user.password_hash
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

export const getEmployeeProfileHandler = async (
  req: Request,
  res: Response
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

export const updateEmployeeProfileHandler = async (
  req: Request,
  res: Response
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

export const getAllEmployeesHandler = async (req: Request, res: Response) => {
  try {
    const employees = await getAllEmployees();

    return res.status(200).json({
      status: 1,
      message: "All employees fetched successfully",
      payload: employees,
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
