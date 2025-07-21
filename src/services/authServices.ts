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