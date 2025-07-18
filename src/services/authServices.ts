import prisma from "../config/db";
import crypto from "crypto";

export const login = async () => {
  try {
    const allDepartments = await prisma.department.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allDepartments;
  } catch (error: any) {
    throw new Error(`Failed to fetch all Departments: ${error.message}`);
  }
};

export const getUserByUsername = (username: string) => {
  try {
    return prisma.user.findUnique({
      where: { username },
      include: { employee: true },
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user by username: ${error.message}`);
  }
};

export const comparePassword = (password: string, oldPassword: string) => {
  try {
    return password === oldPassword;
  } catch (error: any) {
    throw new Error(`Failed to compare password: ${error.message}`);
  }
};

export const generateOTP = async (username: string) => {
  return await prisma.user.update({
    select: { otp_token: true },
    where: { username },
    data: {
      otp_token: crypto.randomInt(100000, 1000000).toString(),
    },
  });
};

export const verifyOTP = async (
  otp: number,
  systemOtp: number,
  username: string
) => {
  if (otp !== systemOtp) return false;
  await prisma.user.update({
    select: { otp_token: true },
    where: { username },
    data: {
      otp_token: null,
    },
  });
  return true;
};
