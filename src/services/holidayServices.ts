import prisma from "../config/db";
import { Holiday, HolidayUpdate } from "../validations/holidayValidations";


export const getAllHolidays = async () => {
  try {
    const holidays = await prisma.holiday.findMany({
      where: {
        is_deleted: false,
      },
    });
    return holidays;
  } catch (error: any) {
    throw new Error(`Failed to fetch all holidays: ${error.message}`);
  }
};


export const createHoliday = async (holiday: Holiday) => {
  try {
    const data: any = {
      holiday_date: new Date(holiday.holiday_date),
      title: holiday.title,
    };

    if (holiday.description) {
      data.description = holiday.description;
    }

    const newHoliday = await prisma.holiday.create({
      data,
    });
    return newHoliday;
  } catch (error: any) {
    throw new Error(`Failed to create a holiday: ${error.message}`);
  }
};

export const updateHoliday = async (holiday: HolidayUpdate) => {
  try {
    const data: any = {
      holiday_date: new Date(holiday.holiday_date),
      title: holiday.title,
    };

    if (holiday.description) {
      data.description = holiday.description;
    }

    const updatedHoliday = await prisma.holiday.update({
      where: {
        id: holiday.holiday_id,
      },
      data,
    });
    return updatedHoliday;
  } catch (error: any) {
    throw new Error(`Failed to update the holiday: ${error.message}`);
  }
};


export const deleteHoliday = async (id: number) => {
  try {
    const deletedHoliday = await prisma.holiday.update({
      where: { id },
      data: { is_deleted: true },
    });
    return deletedHoliday;
  } catch (error: any) {
    throw new Error(`Failed to delete the holiday: ${error.message}`);
  }
};


export const getHolidayById = async (id: number) => {
  try {
    const holiday = await prisma.holiday.findUnique({
      where: { id },
    });
    return holiday;
  } catch (error: any) {
    throw new Error(`Failed to fetch holiday by ID: ${error.message}`);
  }
};

export const getHolidayByDate = async (date: string) => {
  try {
    const holiday = await prisma.holiday.findUnique({
      where: {
        holiday_date: new Date(date),
      },
    });
    return holiday;
  } catch (error: any) {
    throw new Error(`Failed to fetch holiday by date: ${error.message}`);
  }
};
