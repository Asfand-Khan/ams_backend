import prisma from "../config/db";
import {
  Designation,
  DesignationUpdate,
} from "../validations/designationValidations";

export const getAllDesignations = async () => {
  try {
    const allDesignations = await prisma.designation.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allDesignations;
  } catch (error: any) {
    throw new Error(`Failed to fetch all Designations: ${error.message}`);
  }
};

export const createDesignation = async (designation: Designation) => {
  try {
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
  } catch (error: any) {
    throw new Error(`Failed to create a designation: ${error.message}`);
  }
};

export const updateDesignation = async (designation: DesignationUpdate) => {
  try {
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
  } catch (error: any) {
    throw new Error(`Failed to create a designation: ${error.message}`);
  }
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
