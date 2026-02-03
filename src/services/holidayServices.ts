import { Prisma } from "@prisma/client";
import prisma from "../config/db";
import { Holiday, HolidayUpdate } from "../validations/holidayValidations";
import { createCombinedNotification } from "./notificationServices";

export const getAllHolidays = async () => {
  const holidays = await prisma.holiday.findMany({
    where: {
      is_deleted: false,
    },
    orderBy: { created_at: "desc" },
  });
  return holidays;
};

export const getHolidayById = async (id: number) => {
  const holiday = await prisma.holiday.findUnique({
    where: { id },
  });
  return holiday;
};

export const createHoliday = async (holiday: Holiday) => {
  let newHoliday;
  await prisma.$transaction(async (tx) => {
    newHoliday = await tx.holiday.create({
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
        department_id: { not: 1 },
      },
      select: { id: true },
    });

    if (employees.length === 0) return;

    const employeeIds = employees.map((e) => e.id);

    const existingAttendances = await tx.attendance.findMany({
      where: {
        employee_id: { in: employeeIds },
        date: { gte: holiday.start_date, lte: holiday.end_date },
      },
      select: { employee_id: true, date: true },
    });

    const attendanceSet = new Set<string>();
    existingAttendances.forEach((att) => {
      attendanceSet.add(`${att.employee_id}_${att.date}`);
    });

    const attendanceRecords: Prisma.AttendanceCreateManyInput[] = [];

    const startDate = new Date(holiday.start_date);
    const endDate = new Date(holiday.end_date);
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];

      for (const emp of employees) {
        const key = `${emp.id}_${dateStr}`;
        if (!attendanceSet.has(key)) {
          attendanceRecords.push({
            employee_id: emp.id,
            date: dateStr,
            day_status: "holiday",
          });
        }
      }

      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (attendanceRecords.length > 0) {
      await tx.attendance.createMany({
        data: attendanceRecords,
        skipDuplicates: true,
      });
    }
  });

  if (newHoliday) {
    const employees = await prisma.employee.findMany({
      where: {
        is_active: true,
        is_deleted: false,
        department_id: { not: 1 },
      },
      select: { id: true },
    });

    if (employees.length > 0) {
      const userIds = employees.map((e) => e.id);

      await createCombinedNotification({
        user_id: userIds,
        title: holiday.notification_title || "New Holiday Announced!",
        message:
          holiday.notification_message ||
          `Holiday "${holiday.title}" has been declared from ${holiday.start_date} to ${holiday.end_date}.`,
        type: "holiday",
        priority: "medium",
      });
    }
  }

  return newHoliday;
};
export const updateHoliday = async (holiday: HolidayUpdate) => {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.holiday.findUnique({
      where: { id: holiday.holiday_id },
      select: { start_date: true, end_date: true },
    });

    if (!existing) {
      throw new Error("Holiday not found");
    }

    const data: any = {};
    if (holiday.title) data.title = holiday.title;
    if (holiday.start_date) data.start_date = holiday.start_date;
    if (holiday.end_date) data.end_date = holiday.end_date;
    if (holiday.description !== undefined)
      data.description = holiday.description;

    const updatedHoliday = await tx.holiday.update({
      where: {
        id: holiday.holiday_id,
      },
      data,
    });

    const datesChanged =
      (holiday.start_date && holiday.start_date !== existing.start_date) ||
      (holiday.end_date && holiday.end_date !== existing.end_date);

    if (datesChanged) {
      await tx.attendance.deleteMany({
        where: {
          day_status: "holiday",
          date: {
            gte: existing.start_date,
            lte: existing.end_date,
          },
        },
      });

      const employees = await tx.employee.findMany({
        where: {
          is_active: true,
          is_deleted: false,
          department_id: {
            not: 1,
          },
        },
        select: { id: true },
      });

      if (employees.length === 0) {
        return updatedHoliday;
      }

      const employeeIds = employees.map((e) => e.id);

      const newStart = holiday.start_date || existing.start_date;
      const newEnd = holiday.end_date || existing.end_date;

      const existingAttendances = await tx.attendance.findMany({
        where: {
          employee_id: { in: employeeIds },
          date: {
            gte: newStart,
            lte: newEnd,
          },
        },
        select: {
          employee_id: true,
          date: true,
        },
      });

      const attendanceSet = new Set<string>();
      existingAttendances.forEach((att) => {
        attendanceSet.add(`${att.employee_id}_${att.date}`);
      });

      const attendanceRecords: Prisma.AttendanceCreateManyInput[] = [];

      const startDate = new Date(newStart);
      const endDate = new Date(newEnd);

      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];

        for (const emp of employees) {
          const key = `${emp.id}_${dateStr}`;
          if (!attendanceSet.has(key)) {
            attendanceRecords.push({
              employee_id: emp.id,
              date: dateStr,
              day_status: "holiday",
            });
          }
        }

        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (attendanceRecords.length > 0) {
        await tx.attendance.createMany({
          data: attendanceRecords,
          skipDuplicates: true,
        });
      }
    }

    return updatedHoliday;
  });
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
