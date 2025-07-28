import prisma from "../config/db";
import {
  Designation,
  DesignationUpdate,
} from "../validations/designationValidations";

export const getAllDesignations = async () => {
  const allDesignations = await prisma.designation.findMany({
    where: {
      is_deleted: false,
    },
  });
  return allDesignations;
};

export const createDesignation = async (designation: Designation) => {
  const data = {
    level: designation.level,
    title: designation.title,
  } as any;

  if (designation.description) {
    data["description"] = designation.description;
  }

  if (designation.department_id) {
    data["department_id"] = designation.department_id;
  }

  const newDesignation = await prisma.designation.create({
    data,
  });
  return newDesignation;
};

export const updateDesignation = async (designation: DesignationUpdate) => {
  const data = {
    level: designation.level,
    title: designation.title,
  } as any;

  if (designation.description) {
    data["description"] = designation.description;
  }

  if (designation.department_id) {
    data["department_id"] = designation.department_id;
  }

  const updatedDesignation = await prisma.designation.update({
    data,
    where: {
      id: designation.designation_id,
    },
  });
  return updatedDesignation;
};

export const getDesignationByTitle = async (title: string) => {
  return prisma.designation.findUnique({
    where: { title: title.toLocaleLowerCase() },
  });
};

export const getDesignationById = async (id: number) => {
  return prisma.designation.findUnique({
    where: { id },
  });
};
