import { Prisma } from "@prisma/client";
import prisma from "../config/db";
import { Holiday, HolidayUpdate } from "../validations/holidayValidations";

export const getAllHolidays = async () => {
  const holidays = await prisma.holiday.findMany({
    where: {
      is_deleted: false,
    },
  });
  return holidays;
};

export const createHoliday = async (holiday: Holiday) => {
  return await prisma.$transaction(async (tx) => {
    const newHoliday = await tx.holiday.create({
      data: {
        holiday_date: holiday.holiday_date,
        title: holiday.title,
        description: holiday.description ?? null,
      },
    });

    const employees = await tx.employee.findMany({
      where: {
        is_active: true,
        is_deleted: false,
      },
      select: { id: true },
    });

    if (employees.length === 0) {
      return newHoliday;
    }

    const attendanceRecords: Prisma.AttendanceCreateManyInput[] = employees.map((emp) => ({
      employee_id: emp.id,
      date: holiday.holiday_date,
      day_status: "holiday",
    }));

    await tx.attendance.createMany({
      data: attendanceRecords,
      skipDuplicates: true,
    });

    return newHoliday;
  });
};

export const updateHoliday = async (holiday: HolidayUpdate) => {
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
};

export const deleteHoliday = async (id: number) => {
  const deletedHoliday = await prisma.holiday.update({
    where: { id },
    data: { is_deleted: true },
  });
  return deletedHoliday;
};

export const getHolidayById = async (id: number) => {
  const holiday = await prisma.holiday.findUnique({
    where: { id },
  });
  return holiday;
};

export const getHolidayByDate = async (date: string) => {
  const holiday = await prisma.holiday.findUnique({
    where: {
      holiday_date: date,
    },
  });
  return holiday;
};
