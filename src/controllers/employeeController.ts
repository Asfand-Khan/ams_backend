import { Request, Response } from "express";
import { z } from "zod";
import {
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
} from "../services/departmentServices";
import {
  DepartmentSchema,
  DepartmentUpdateSchema,
} from "../validations/departmentValidations";
import { employeeSchema } from "../validations/employeeValidations";
import {
  createEmployee,
  getEmployeeByCnic,
  getEmployeeByCode,
  getEmployeeByEmail,
  getEmployeeByPhone,
  getEmployeeByUsername,
} from "../services/employeeServices";
import { sendEmail } from "../utils/sendEmail";
import { getSignUpTemplate } from "../utils/signUpTemplate";

// Module --> Employee
// Method --> GET (Protected)
// Endpoint --> /api/v1/employees
// Description --> Fetch all employees
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
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

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
      await sendEmail({
        to: newEmployee.email,
        subject: "Employee Registration",
        html: getSignUpTemplate(newEmployee.full_name, newEmployee.username,newEmployee.password, "https://getorio.com/" ),
      });
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

// Module --> Department
// Method --> GET (Protected)
// Endpoint --> /api/v1/departments/:id
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
