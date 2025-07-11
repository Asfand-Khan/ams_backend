import prisma from "../config/db";
import { Shift, ShiftUpdate } from "../validations/shiftValidations";

export const getAllShifts = async () => {
  try {
    const allShifts = await prisma.shift.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allShifts;
  } catch (error: any) {
    throw new Error(`Failed to fetch all shifts: ${error.message}`);
  }
};

export const createShift = async (shift: Shift) => {
  try {
    const data = {
      name: shift.name,
      end_time: shift.end_time,
      start_time: shift.start_time,
    } as any;

    if (shift.break_duration_minutes) {
      data["break_duration_minutes"] = shift.break_duration_minutes;
    }

    if (shift.early_leave_threshold_minutes) {
      data["early_leave_threshold_minutes"] =
        shift.early_leave_threshold_minutes;
    }

    if (shift.grace_minutes) {
      data["grace_minutes"] = shift.grace_minutes;
    }

    if (shift.half_day_hours) {
      data["half_day_hours"] = shift.half_day_hours;
    }

    const newShift = await prisma.shift.create({
      data,
    });
    return newShift;
  } catch (error: any) {
    throw new Error(`Failed to create a shift: ${error.message}`);
  }
};

export const updateShift = async (shift: ShiftUpdate) => {
  try {
    const data = {
      name: shift.name,
      end_time: shift.end_time,
      start_time: shift.start_time,
    } as any;

    if (shift.break_duration_minutes) {
      data["break_duration_minutes"] = shift.break_duration_minutes;
    }

    if (shift.early_leave_threshold_minutes) {
      data["early_leave_threshold_minutes"] =
        shift.early_leave_threshold_minutes;
    }

    if (shift.grace_minutes) {
      data["grace_minutes"] = shift.grace_minutes;
    }

    if (shift.half_day_hours) {
      data["half_day_hours"] = shift.half_day_hours;
    }

    const updatedShift = await prisma.shift.update({
      data,
      where:{
        id: shift.shift_id
      }
    });
    return updatedShift;
  } catch (error: any) {
    throw new Error(`Failed to update a shift: ${error.message}`);
  }
};

export const getShiftByName = async (name: string) => {
  return prisma.shift.findUnique({
    where: { name: name.toLocaleLowerCase() },
  });
};

export const getShiftById = async (id: number) => {
  return prisma.shift.findUnique({
    where: { id },
  });
};

export const checkIfEndTimeIsGreaterThanStartTime = (start_time: string, end_time: string) => {
  const start = Date.parse(`1970-01-01T${start_time}Z`);
  const end = Date.parse(`1970-01-01T${end_time}Z`);
  return end > start;
};