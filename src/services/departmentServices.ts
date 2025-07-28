import prisma from "../config/db";
import {
  Department,
  DepartmentUpdate,
} from "../validations/departmentValidations";

export const getAllDepartments = async () => {
  const allDepartments = await prisma.department.findMany({
    where: {
      is_deleted: false,
    },
  });
  return allDepartments;
};

export const createDepartment = async (department: Department) => {
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
};

export const updateDepartment = async (department: DepartmentUpdate) => {
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
