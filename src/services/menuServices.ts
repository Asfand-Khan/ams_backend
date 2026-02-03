import prisma from "../config/db";
import { MenuType } from "@prisma/client";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  url: string;
  icon: string | null;
  sorting: number;
  type: string;
};

type MenuOutput = {
  menu_id: number;
  name: string;
  url: string;
  icon: string | null;
  parent_id: number | null;
  sorting: number;
  description: string;
  type: string;
  childs: ChildItem[];
};

type ChildItem = {
   menu_id: number; 
  name: string;
  url: string;
  icon: string | null;
  parent_id: number;
  sorting: number;
  type: string;
  description: string;
};

function transformMenu(flatMenu: MenuItem[]): MenuOutput[] {
  const menuMap: { [key: number]: MenuOutput } = {};

  flatMenu.forEach((item) => {
    const { id, name, url, icon, parent_id, sorting, description,type } = item;

    if (parent_id === null) {
      menuMap[id] = {
        menu_id: id,
        name,
        url,
        icon,
        parent_id,
        sorting,
        description,
        type,
        childs: [],
      };
    }
  });

  flatMenu.forEach((item) => {
    const { id, name, url, icon, parent_id, sorting, description,type } = item;

    if (parent_id !== null && menuMap[parent_id]) {
      menuMap[parent_id].childs.push({
        menu_id : id,
        name,
        url,
        icon,
        parent_id,
        sorting,
        type,
        description,
      });
    }
  });

  // Sort parents and their children by sorting value
  Object.values(menuMap).forEach((menu) => {
    menu.childs.sort((a, b) => a.sorting - b.sorting);
  });

  return Object.values(menuMap).sort((a, b) => a.sorting - b.sorting);
}

export const allMenus = async () => {
  const menus = await prisma.menu.findMany();
  const nestedMenus = transformMenu(menus as MenuItem[]);
  return nestedMenus;
};
// ────────────────────────────────────────────────
// Get Single Menu (by ID)
// ────────────────────────────────────────────────
export const getSingleMenu = async (menuId: number) => {
  const menu = await prisma.menu.findUnique({
    where: {
      id: menuId,
      is_deleted: false,
    },
    select: {
      id: true,
      name: true,
      description: true,
      parent_id: true,
      url: true,
      icon: true,
      sorting: true,
      type: true,
      is_active: true,
      created_at: true,
      updated_at: true,
      created_by: true,
    },
  });

  if (!menu) {
    throw new Error("Menu item not found or has been deleted");
  }

  return menu;
};

// ────────────────────────────────────────────────
// Create New Menu Item
// ────────────────────────────────────────────────
export const createMenuItem = async (
  data: {
    name: string;
    description?: string;
    parent_id?: number | null;
    url?: string;
    icon?: string | null;
    sorting?: number;
    type?: MenuType;
  },
  createdBy: number
) => {
  // Optional: check if parent exists (if provided)
  if (data.parent_id) {
    const parent = await prisma.menu.findUnique({
      where: { id: data.parent_id, is_deleted: false },
    });
    if (!parent) throw new Error("Parent menu item does not exist");
  }

  // Default sorting = 0 if not provided
  const sorting = data.sorting ?? 0;

  const newMenu = await prisma.menu.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() ?? null,
      parent_id: data.parent_id ?? null,
      url: data.url?.trim() ?? null,
      icon: data.icon ?? null,
      sorting,
      type: data.type ?? MenuType.hrm,
      created_by: createdBy,
      is_active: true,
      is_deleted: false,
    },
  });

  return newMenu;
};

// ────────────────────────────────────────────────
// Update Existing Menu Item
// ────────────────────────────────────────────────
export const updateMenuItem = async (
  menuId: number,
  data: {
    name?: string;
    description?: string | null;
    parent_id?: number | null;
    url?: string | null;
    icon?: string | null;
    sorting?: number;
    type?: MenuType;
    is_active?: boolean;
  },
  updatedBy: number
) => {
  const existing = await prisma.menu.findUnique({
    where: { id: menuId, is_deleted: false },
  });

  if (!existing) throw new Error("Menu item not found or deleted");

  // Prevent changing parent to non-existent
  if (data.parent_id !== undefined && data.parent_id !== null) {
    const parent = await prisma.menu.findUnique({
      where: { id: data.parent_id, is_deleted: false },
    });
    if (!parent) throw new Error("New parent menu does not exist");
  }

  const updated = await prisma.menu.update({
    where: { id: menuId },
    data: {
      name: data.name ? data.name.trim() : undefined,
      description: data.description !== undefined ? (data.description?.trim() ?? null) : undefined,
      parent_id: data.parent_id !== undefined ? data.parent_id : undefined,
      url: data.url !== undefined ? (data.url?.trim() ?? null) : undefined,
      icon: data.icon !== undefined ? data.icon : undefined,
      sorting: data.sorting !== undefined ? data.sorting : undefined,
      type: data.type,
      is_active: data.is_active,
      updated_at: new Date(),
    },
  });

  return updated;
};

// ────────────────────────────────────────────────
// Bulk Update Menu Sorting (re-ordering)
// Expects array of { id: number, sorting: number }
// ────────────────────────────────────────────────
export const updateMenuSorting = async (
  items: Array<{ id: number; sorting: number }>,
  updatedBy: number
) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No sorting items provided");
  }

  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      await tx.menu.updateMany({
        where: {
          id: item.id,
          is_deleted: false,
        },
        data: {
          sorting: item.sorting,
          updated_at: new Date(),
        },
      });
    }
  });

  return { message: "Menu sorting updated successfully", updatedCount: items.length };
};