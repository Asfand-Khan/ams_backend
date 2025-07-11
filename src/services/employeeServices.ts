import prisma from "../config/db";
import { Employee, EmployeeUpdate } from "../validations/employeeValidations";

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

    const newEmployee = await prisma.employee.create({
      data,
    });
    return newEmployee;
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
      where:{
        id: employee.employee_id
      }
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

export const getEmployeeById = async (id: number) => {
  return prisma.employee.findUnique({
    where: { id },
  });
};
