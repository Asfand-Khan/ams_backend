import prisma from "../config/db";

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
  id: number;
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
        id,
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
