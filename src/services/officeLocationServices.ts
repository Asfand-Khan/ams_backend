import prisma from "../config/db";
import {
  OfficeLocation,
  OfficeLocationUpdate,
} from "../validations/officeLocationValidations";

export const getAllOfficeLocations = async () => {
  try {
    const allOffices = await prisma.officeLocation.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allOffices;
  } catch (error: any) {
    throw new Error(`Failed to fetch all office locations: ${error.message}`);
  }
};

export const createOfficeLocation = async (officeLocation: OfficeLocation) => {
  try {
    const data = {
      name: officeLocation.name,
      longitude: officeLocation.longitude,
      latitude: officeLocation.latitude,
      radius_meters: officeLocation.radius_meters,
    } as any;

    if (officeLocation.address) {
      data["address"] = officeLocation.address;
    }

    const newOfficeLocation = await prisma.officeLocation.create({
      data,
    });
    return newOfficeLocation;
  } catch (error: any) {
    throw new Error(`Failed to create a office location: ${error.message}`);
  }
};

export const updateOfficeLocation = async (
  officeLocation: OfficeLocationUpdate
) => {
  try {
    const data = {
      name: officeLocation.name,
      longitude: officeLocation.longitude,
      latitude: officeLocation.latitude,
      radius_meters: officeLocation.radius_meters,
    } as any;

    if (officeLocation.address) {
      data["address"] = officeLocation.address;
    }

    const updatedOfficeLocation = await prisma.officeLocation.update({
      data,
      where: {
        id: officeLocation.office_id,
      },
    });
    return updatedOfficeLocation;
  } catch (error: any) {
    throw new Error(`Failed to update a office location: ${error.message}`);
  }
};

export const getOfficeLocationByName = async (name: string) => {
  return prisma.officeLocation.findUnique({
    where: { name: name.toLocaleLowerCase() },
  });
};

export const getOfficeLocationByLatitude = async (latitude: string) => {
  return prisma.officeLocation.findUnique({
    where: { latitude: latitude },
  });
};

export const getOfficeLocationByLongitude = async (longitude: string) => {
  return prisma.officeLocation.findUnique({
    where: { longitude: longitude },
  });
};

export const getOfficeLocationById = async (id: number) => {
  return prisma.officeLocation.findUnique({
    where: { id },
  });
};
