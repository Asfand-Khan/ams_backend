import prisma from "../config/db";
import { generateRandomHex } from "../utils/generateRandomHex";
import { Employee, EmployeeUpdate } from "../validations/employeeValidations";
import crypto from "crypto";

export const getAllEmployees = async () => {
  try {
    const allEmployees = await prisma.employee.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allEmployees;
  } catch (error: any) {
    throw new Error(`Failed to fetch all employees: ${error.message}`);
  }
};

export const createEmployee = async (employee: Employee) => {
  try {
    const data = {
      email: employee.email,
      employee_code: employee.employee_code,
      full_name: employee.full_name,
      designation_id: employee.designation_id,
      department_id: employee.department_id,
      status: employee.status,
    } as any;

    if (employee.address) {
      data["address"] = employee.address;
    }

    if (employee.cnic) {
      data["cnic"] = employee.cnic;
    }

    if (employee.phone) {
      data["phone"] = employee.phone;
    }

    if (employee.join_date) data["join_date"] = new Date(employee.join_date);
    if (employee.leave_date) data["leave_date"] = new Date(employee.leave_date);
    if (employee.dob) data["dob"] = new Date(employee.dob);

    if (employee.gender) {
      data["gender"] = employee.gender;
    }

    const result = await prisma.$transaction(async (tx) => {
      const newEmployee = await tx.employee.create({ data });

      const user = await tx.user.create({
        data: {
          username: employee.username,
          password_hash: generateRandomHex(16),
          employee_id: newEmployee.id,
          email: employee.email,
          type: employee.emp_type,
        },
      });

      await tx.employeeShift.create({
        data: {
          employee_id: newEmployee.id,
          shift_id: employee.shift_id,
          effective_from: new Date(),
        },
      });

      if (employee.team_id) {
        await tx.teamMember.create({
          data: {
            employee_id: newEmployee.id,
            team_id: employee.team_id,
          },
        });
      }

      return {
        ...newEmployee,
        username: user.username,
        password: user.password_hash
      };
    });

    return result;
  } catch (error: any) {
    throw new Error(`Failed to create a employee: ${error.message}`);
  }
};

export const updateEmployee = async (employee: EmployeeUpdate) => {
  try {
    const data = {
      email: employee.email,
      employee_code: employee.employee_code,
      full_name: employee.full_name,
      designation_id: employee.designation_id,
      department_id: employee.department_id,
      status: employee.status,
    } as any;

    if (employee.address) {
      data["address"] = employee.address;
    }

    if (employee.cnic) {
      data["cnic"] = employee.cnic;
    }

    if (employee.phone) {
      data["phone"] = employee.phone;
    }

    if (employee.join_date) {
      data["join_date"] = employee.join_date;
    }

    if (employee.leave_date) {
      data["leave_date"] = employee.leave_date;
    }

    if (employee.dob) {
      data["dob"] = employee.dob;
    }

    if (employee.gender) {
      data["gender"] = employee.gender;
    }

    const updatedEmployee = await prisma.employee.update({
      data,
      where: {
        id: employee.employee_id,
      },
    });
    return updatedEmployee;
  } catch (error: any) {
    throw new Error(`Failed to update a employee: ${error.message}`);
  }
};

export const getEmployeeByCode = async (code: string) => {
  return prisma.employee.findUnique({
    where: { employee_code: code },
  });
};

export const getEmployeeByEmail = async (email: string) => {
  return prisma.employee.findUnique({
    where: { email },
  });
};

export const getEmployeeByPhone = async (phone: string) => {
  return prisma.employee.findUnique({
    where: { phone },
  });
};

export const getEmployeeByCnic = async (cnic: string) => {
  return prisma.employee.findUnique({
    where: { cnic },
  });
};

export const getEmployeeByUsername = async (username: string) => {
  return prisma.user.findUnique({
    where: { username },
  });
};

export const getEmployeeById = async (id: number) => {
  return prisma.employee.findUnique({
    where: { id },
  });
};
