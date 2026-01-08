import { Prisma } from "@prisma/client";
import prisma from "../config/db";
import { Holiday, HolidayUpdate } from "../validations/holidayValidations";

export const getAllHolidays = async () => {
  const holidays = await prisma.holiday.findMany({
    where: {
      is_deleted: false,
    },
    orderBy: { created_at: "desc" },
  });
  return holidays;
};

export const createHoliday = async (holiday: Holiday) => {
  return await prisma.$transaction(async (tx) => {
    const newHoliday = await tx.holiday.create({
      data: {
        start_date: holiday.start_date,
        end_date: holiday.end_date,
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

    const start = new Date(holiday.start_date);
    const end = new Date(holiday.end_date);
    const attendanceRecords: Prisma.AttendanceCreateManyInput[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD

      employees.forEach((emp) => {
        attendanceRecords.push({
          employee_id: emp.id,
          date: dateStr,
          day_status: "holiday",
        });
      });
    }

    if (attendanceRecords.length > 0) {
      await tx.attendance.createMany({
        data: attendanceRecords,
        skipDuplicates: true,
      });
    }

    return newHoliday;
  });
};

export const updateHoliday = async (holiday: HolidayUpdate) => {
  const data: any = {};

  if (holiday.title) data.title = holiday.title;
  if (holiday.start_date) data.start_date = holiday.start_date;
  if (holiday.end_date) data.end_date = holiday.end_date;
  if (holiday.description) data.description = holiday.description;

  const updatedHoliday = await prisma.holiday.update({
    where: {
      id: holiday.holiday_id,
    },
    data,
  });

  // TODO: Handle attendance update if dates changed. This might require deleting old attendance and creating new.

  return updatedHoliday;
};

export const deleteHoliday = async (id: number) => {
  const deletedHoliday = await prisma.holiday.update({
    where: { id },
    data: { is_deleted: true },
  });
  // TODO: Consider deleting/reverting attendance records associated with this holiday?
  return deletedHoliday;
};

export const getHolidayById = async (id: number) => {
  const holiday = await prisma.holiday.findUnique({
    where: { id },
  });
  return holiday;
};

export const getHolidayByDate = async (date: string) => {
  const holiday = await prisma.holiday.findFirst({
    where: {
      start_date: { lte: date },
      end_date: { gte: date },
      is_deleted: false,
    },
  });
  return holiday;
};
