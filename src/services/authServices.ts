import prisma from "../config/db";
import crypto from "crypto";
import { FCMToken } from "../validations/authValidations";

export const getUserByUsername = (username: string) => {
  return prisma.user.findUnique({
    where: { username },
    include: { employee: true },
  });
};

export const getUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const comparePassword = (password: string, oldPassword: string) => {
  return password === oldPassword;
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

export const getUserMenus = async (userId: number) => {
  const userMenus = await prisma.userMenuRight.findMany({
    where: {
      user_id: userId,
    },
    include: {
      menu: true,
    },
  });

  // Transform to desired response
  const formattedMenus = userMenus.map((userMenu) => ({
    menu_id: userMenu.menu.id,
    menu_name: userMenu.menu.name,
    icon: userMenu.menu.icon,
    sorting: userMenu.menu.sorting,
    url: userMenu.menu.url,
    parent_id: userMenu.menu.parent_id,
    can_view: userMenu.can_view ? "1" : "0",
    can_create: userMenu.can_create ? "1" : "0",
    can_edit: userMenu.can_edit ? "1" : "0",
    can_delete: userMenu.can_delete ? "1" : "0",
  }));

  return formattedMenus;
};

export const getUserByEmployeeId = async (employeeId: number) => {
  return prisma.user.findFirst({
    where: { employee_id: employeeId },
  });
};

export const createToken = async (data: FCMToken, user_id: number) => {
  const exists = await prisma.fCMToken.findUnique({
    where: { token: data.token },
  });

  let token = null;
  if (!exists) {
    token = await prisma.fCMToken.create({
      data: {
        token: data.token,
        user: { connect: { id: user_id } },
      },
    });

    return token;
  }
};
