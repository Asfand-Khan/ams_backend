import prisma from '../config/db';
import { LeaveType } from '../validations/leaveTypeValidations';

export const getLeaveTypes = () => {
  return prisma.leaveType.findMany({
    where: { is_deleted: false }
  });
};

export const createLeaveType = (data: LeaveType) => {
  return prisma.leaveType.create({ data });
};

export const updateLeaveType = (id: number, data: LeaveType) => {
  return prisma.leaveType.update({ where: { id }, data });
};

export const deleteLeaveType = (id: number) => {
  return prisma.leaveType.update({
    where: { id },
    data: { is_deleted: true }
  });
};