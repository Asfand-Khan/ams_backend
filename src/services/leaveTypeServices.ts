import prisma from "../config/db";
import {
  LeaveType,
  LeaveTypeUpdate,
} from "../validations/leaveTypeValidations";

export const getLeaveTypes = () => {
  return prisma.leaveType.findMany({
    where: { is_deleted: false },
  });
};

export const createLeaveType = async (data: LeaveType) => {
  const leaveType = await createLeaveTypeWithQuotas(data);
  return leaveType;
};

export const updateLeaveType = (data: LeaveTypeUpdate) => {
  return prisma.leaveType.update({
    where: { id: data.leave_type_id },
    data: {
      name: data.name,
      total_quota: data.total_quota,
    },
  });
};

export const deleteLeaveType = (id: number) => {
  return prisma.leaveType.update({
    where: { id },
    data: { is_deleted: true },
  });
};

export const createLeaveTypeWithQuotas = async (
  data: Omit<LeaveType, "id" | "created_at" | "updated_at">
) => {
  const currentYear = new Date().getFullYear();

  return await prisma.$transaction(async (tx) => {
    const leaveType = await tx.leaveType.create({
      data,
    });

    const employees = await tx.employee.findMany({
      where: {
        is_active: true,
        is_deleted: false,
      },
      select: { id: true },
    });

    const leaveQuotas = employees.map((employee) => ({
      employee_id: employee.id,
      leave_type_id: leaveType.id,
      year: currentYear,
      used_days: 0,
    }));

    if (leaveQuotas.length > 0) {
      await tx.employeeLeaveQuota.createMany({
        data: leaveQuotas,
        skipDuplicates: true,
      });
    }

    return leaveType;
  });
};

export const singleLeaveTypeById = (id: number) => {
  return prisma.leaveType.findUnique({
    where: { id },
  });
};