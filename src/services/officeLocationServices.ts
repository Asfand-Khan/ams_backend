import prisma from "../config/db";
import {
  OfficeLocation,
  OfficeLocationUpdate,
} from "../validations/officeLocationValidations";

export const getAllOfficeLocations = async () => {
  const allOffices = await prisma.officeLocation.findMany({
    where: {
      is_deleted: false,
    },
  });
  return allOffices;
};

export const createOfficeLocation = async (officeLocation: OfficeLocation) => {
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
};

export const updateOfficeLocation = async (
  officeLocation: OfficeLocationUpdate
) => {
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
