import prisma from "../config/db";
import {
  Department,
  DepartmentUpdate,
} from "../validations/departmentValidations";

export const getAllDepartments = async () => {
  try {
    const allDepartments = await prisma.department.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allDepartments;
  } catch (error: any) {
    throw new Error(`Failed to fetch all Departments: ${error.message}`);
  }
};

export const createDepartment = async (department: Department) => {
  try {
    const data = {
      name: department.name,
    } as any;

    if (department.description) {
      data["description"] = department.description;
    }

    const newDepartment = await prisma.department.create({
      data,
    });
    return newDepartment;
  } catch (error: any) {
    throw new Error(`Failed to create a department: ${error.message}`);
  }
};

export const updateDepartment = async (department: DepartmentUpdate) => {
  try {
    const data = {
      name: department.name,
    } as any;

    if (department.description) {
      data["description"] = department.description;
    }

    const updatedDepartment = await prisma.department.update({
      data,
      where: {
        id: department.dept_id,
      },
    });
    return updatedDepartment;
  } catch (error: any) {
    throw new Error(`Failed to update a department: ${error.message}`);
  }
};

export const getDepartmentByName = async (name: string) => {
  return prisma.department.findUnique({
    where: { name: name.toLocaleLowerCase() },
  });
};

export const getDepartmentById = async (id: number) => {
  return prisma.department.findUnique({
    where: { id },
  });
};
