import z from "zod";
import prisma from "../config/db";
import {
  extractImageAndExtension,
  saveBase64Image,
} from "../utils/base64Helpers";
import { generateRandomHex } from "../utils/generateRandomHex";
import {
  Employee,
  employeeDocumentCreateSchema,
  employeeDocumentUpdateSchema,
  EmployeeUpdate,
  EmployeeUpdateAdmin,
  EmployeeUpdateProfile,
} from "../validations/employeeValidations";

export const getAllEmployees = async (user: any) => {
  const userRecord = await prisma.user.findFirst({
    where: { employee_id: user.id },
    select: { type: true },
  });

  if (!userRecord) {
    throw new Error("User not found");
  }
  const userType = userRecord.type;
  let whereClause: any = {
    is_deleted: false,
  };
  if (userType === "employee") {
    whereClause.id = user.id;
  }
  if (userType === "lead") {
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        team: {
          team_lead_id: user.id,
        },
        is_active: true,
        is_deleted: false,
      },
      select: {
        employee_id: true,
      },
    });
    const employeeIds = teamMembers.map((member) => member.employee_id);
    if (employeeIds.length === 0) {
      return [];
    }
    whereClause.id = {
      in: employeeIds,
    };
  }

  const allEmployees = await prisma.employee.findMany({
    where: whereClause,
    select: {
      id: true,
      employee_code: true,
      full_name: true,
      father_name: true,
      email: true,
      phone: true,
      cnic: true,
      gender: true,
      dob: true,
      join_date: true,
      leave_date: true,
      department_id: true,
      designation_id: true,
      profile_picture: true,
      address: true,
      status: true,
      is_active: true,
      is_deleted: true,
      created_at: true,
      updated_at: true,
      EmployeeShift: {
        select: { shift_id: true },
        where: { is_active: true, is_deleted: false },
        orderBy: { effective_from: "desc" },
        take: 1,
      },
      TeamMember: {
        select: { team_id: true },
        where: { is_active: true, is_deleted: false },
      },
    },
  });
  return allEmployees.map((employee) => ({
    ...employee,
    id: employee.id,
    shift_id: employee.EmployeeShift[0]?.shift_id || null,
    team_ids: employee.TeamMember.map((tm) => tm.team_id),
    EmployeeShift: undefined,
    TeamMember: undefined,
  }));
};

export const createEmployee = async (employee: Employee) => {
  const data = {
    email: employee.email,
    employee_code: employee.employee_code,
    full_name: employee.full_name,
    designation_id: employee.designation_id,
    department_id: employee.department_id,
    status: employee.status,
  } as any;

  if (employee.address) {
    data["address"] = employee.address;
  }

  if (employee.fathername) {
    data["father_name"] = employee.fathername;
  }

  if (employee.cnic) {
    data["cnic"] = employee.cnic;
  }

  if (employee.phone) {
    data["phone"] = employee.phone;
  }

  if (employee.join_date) data["join_date"] = new Date(employee.join_date);
  if (employee.leave_date) data["leave_date"] = new Date(employee.leave_date);
  if (employee.dob) data["dob"] = new Date(employee.dob);

  if (employee.gender) {
    data["gender"] = employee.gender;
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const newEmployee = await tx.employee.create({ data });

      const leavesTypes = await prisma.leaveType.findMany();

      const user = await tx.user.create({
        data: {
          username: employee.username,
          password_hash: "orio123456",
          employee_id: newEmployee.id,
          email: employee.email,
          type: employee.emp_type,
        },
      });

      if (employee.menu_rights && employee.menu_rights.length > 0) {
        const menuRightsData = employee.menu_rights.map((right) => ({
          user_id: user.id,
          menu_id: right.menu_id,
          can_view: right.can_view ?? true,
          can_create: right.can_create ?? false,
          can_edit: right.can_edit ?? false,
          can_delete: right.can_delete ?? false,
        }));

        await tx.userMenuRight.createMany({
          data: menuRightsData,
        });
      }

      await tx.employeeShift.create({
        data: {
          employee_id: newEmployee.id,
          shift_id: employee.shift_id,
          effective_from: new Date(),
        },
      });

      if (employee.team_id) {
        await tx.teamMember.create({
          data: {
            employee_id: newEmployee.id,
            team_id: employee.team_id,
          },
        });
      }

      for (const leaveType of leavesTypes) {
        await tx.employeeLeaveQuota.create({
          data: {
            employee_id: newEmployee.id,
            leave_type_id: leaveType.id,
            year: new Date().getFullYear(),
          },
        });
      }

      return {
        ...newEmployee,
        username: user.username,
        password: user.password_hash,
      };
    },
    {
      timeout: 30000,
    },
  );

  return result;
};

export const updateEmployee = async (employee: EmployeeUpdate) => {
  const data = {
    email: employee.email,
    employee_code: employee.employee_code,
    full_name: employee.full_name,
    designation_id: employee.designation_id,
    department_id: employee.department_id,
    status: employee.status,
  } as any;

  if (employee.address) {
    data["address"] = employee.address;
  }

  if (employee.cnic) {
    data["cnic"] = employee.cnic;
  }

  if (employee.phone) {
    data["phone"] = employee.phone;
  }

  if (employee.join_date) {
    data["join_date"] = employee.join_date;
  }

  if (employee.leave_date) {
    data["leave_date"] = employee.leave_date;
  }

  if (employee.dob) {
    data["dob"] = employee.dob;
  }

  if (employee.gender) {
    data["gender"] = employee.gender;
  }

  const updatedEmployee = await prisma.employee.update({
    data,
    where: {
      id: employee.employee_id,
    },
  });
  return updatedEmployee;
};

export const getEmployeeByCode = async (code: string) => {
  return prisma.employee.findUnique({
    where: { employee_code: code },
  });
};

export const getEmployeeByEmail = async (email: string) => {
  return prisma.employee.findUnique({
    where: { email },
  });
};

export const getEmployeeByPhone = async (phone: string) => {
  return prisma.employee.findUnique({
    where: { phone },
  });
};

export const getEmployeeByCnic = async (cnic: string) => {
  return prisma.employee.findUnique({
    where: { cnic },
  });
};

export const getEmployeeByUsername = async (username: string) => {
  return prisma.user.findUnique({
    where: { username },
  });
};

export const getEmployeeById = async (id: number) => {
  return prisma.employee.findUnique({
    where: { id },
  });
};

export const changeEmployeePassword = async (
  user_id: number,
  new_password: string,
) => {
  return prisma.user.update({
    where: { id: user_id },
    data: {
      password_hash: new_password,
    },
  });
};

export const getEmployeeProfileById = async (id: number) => {
  const result = (await prisma.$queryRaw`
    SELECT 
    e.id AS employee_id,
    e.employee_code,
    e.full_name,
    e.father_name,
    e.email,
    e.phone,
    e.cnic,
    e.gender,
    DATE_FORMAT(e.dob, '%M %d, %Y') AS dob,
    e.join_date,
    e.profile_picture,
    e.address,
    d.name AS department_name,
    des.title AS designation_title,
    s.name AS shift_name,
    s.start_time AS shift_start_time,
    s.end_time AS shift_end_time,
    GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ', ') AS team_names,
    GROUP_CONCAT(DISTINCT tl.full_name ORDER BY tl.full_name SEPARATOR ', ') AS team_leads
FROM Employee e
LEFT JOIN Department d ON e.department_id = d.id
LEFT JOIN Designation des ON e.designation_id = des.id
LEFT JOIN (
    SELECT es1.employee_id, es1.shift_id
    FROM EmployeeShift es1
    INNER JOIN (
        SELECT employee_id, MAX(effective_from) AS latest
        FROM EmployeeShift
        WHERE is_active = 1 AND is_deleted = 0
        GROUP BY employee_id
    ) es2 ON es1.employee_id = es2.employee_id AND es1.effective_from = es2.latest
    WHERE es1.is_active = 1 AND es1.is_deleted = 0
) latest_shift ON latest_shift.employee_id = e.id
LEFT JOIN Shift s ON s.id = latest_shift.shift_id
LEFT JOIN TeamMember tm ON tm.employee_id = e.id AND tm.is_active = 1 AND tm.is_deleted = 0
LEFT JOIN Team t ON t.id = tm.team_id AND t.is_active = 1 AND t.is_deleted = 0
LEFT JOIN Employee tl ON t.team_lead_id = tl.id
WHERE e.id = ${id}
GROUP BY e.id;
  `) as any[];

  return result[0];
};

export const updateEmployeeProfile = async (data: EmployeeUpdateProfile) => {
  let employeeData = {} as any;
  let userData = {} as any;

  if (data.fullname) employeeData.full_name = data.fullname;
  if (data.fathername) employeeData.father_name = data.fathername;
  if (data.email) {
    employeeData.email = data.email;
    userData.email = data.email;
  }
  if (data.phone) employeeData.phone = data.phone;
  if (data.cnic) employeeData.cnic = data.cnic;
  if (data.dob) employeeData.dob = new Date(data.dob);
  if (data.address) employeeData.address = data.address;

  const user = await prisma.user.findFirst({
    where: { employee_id: data.employee_id },
  });

  const updatedUser = await prisma.user.update({
    data: userData,
    where: {
      id: user?.id,
    },
  });

  if (data.profile_picture) {
    const { image: imageBase64, extension } = extractImageAndExtension(
      data.profile_picture,
    );
    employeeData.profile_picture = `${new Date().getTime()}.${extension}`;
    const customDirectory = "uploads/users";
    const { success } = await saveBase64Image(
      imageBase64,
      employeeData.profile_picture,
      customDirectory,
    );
    if (!success) throw new Error("Failed to save user image");
  }

  const updatedEmployee = await prisma.employee.update({
    data: employeeData,
    where: {
      id: data.employee_id,
    },
  });

  return updatedEmployee;
};

export const getAllUsersWithEmployee = async (user: any) => {
  const userRecord = await prisma.user.findFirst({
    where: { employee_id: user.id },
    select: { type: true },
  });

  if (!userRecord) {
    throw new Error("User not found");
  }

  const userType = userRecord.type;

  // For employee users, return empty array
  if (userType === "employee") {
    return [];
  }

  let whereClause: any = {
    is_deleted: false,
  };

  // For lead users, filter users linked to their team members
  if (userType === "lead") {
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        team: {
          team_lead_id: user.id,
        },
        is_active: true,
        is_deleted: false,
      },
      select: {
        employee_id: true,
      },
    });

    const employeeIds = teamMembers.map((member) => member.employee_id);
    if (employeeIds.length === 0) {
      return [];
    }

    whereClause.employee_id = {
      in: employeeIds,
    };
  }
  const allUsers = await prisma.user.findMany({
    where: whereClause,
    include: {
      employee: {
        select: {
          id: true,
          employee_code: true,
          full_name: true,
          father_name: true,
          email: true,
          phone: true,
          cnic: true,
          gender: true,
          dob: true,
          join_date: true,
          leave_date: true,
          department_id: true,
          designation_id: true,
          profile_picture: true,
          address: true,
          status: true,
          is_active: true,
          is_deleted: true,
          created_at: true,
          updated_at: true,
          department: {
            select: {
              name: true,
            },
          },
          designation: {
            select: {
              title: true,
            },
          },
          TeamMember: {
            where: { is_active: true, is_deleted: false },
            select: { team: { select: { name: true } } },
          },
          EmployeeShift: {
            where: { is_active: true, is_deleted: false },
            orderBy: { effective_from: "desc" },
            take: 1,
            select: { shift: { select: { name: true } } },
          },
        },
      },
    },
  });

  return allUsers.map((user) => ({
    id: Number(user.id),
    username: user.username,
    email: user.email,
    password_hash: user.password_hash,
    type: user.type,
    employee_id: user.employee_id ? Number(user.employee_id) : null,
    last_login: user.last_login ? user.last_login.toISOString() : null,
    password_reset_token: user.password_reset_token,
    otp_token: user.otp_token,
    token_expiry: user.token_expiry ? user.token_expiry.toISOString() : null,
    is_active: user.is_active,
    is_deleted: user.is_deleted,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
    employee: user.employee
      ? {
          id: Number(user.employee.id),
          employee_code: user.employee.employee_code,
          full_name: user.employee.full_name,
          father_name: user.employee.father_name,
          email: user.employee.email,
          phone: user.employee.phone,
          cnic: user.employee.cnic,
          gender: user.employee.gender,
          dob: user.employee.dob ? user.employee.dob.toISOString() : null,
          join_date: user.employee.join_date
            ? user.employee.join_date.toISOString()
            : null,
          leave_date: user.employee.leave_date
            ? user.employee.leave_date.toISOString()
            : null,
          department_id: Number(user.employee.department_id),
          designation_id: Number(user.employee.designation_id),
          profile_picture: user.employee.profile_picture,
          address: user.employee.address,
          status: user.employee.status,
          is_active: user.employee.is_active,
          is_deleted: user.employee.is_deleted,
          created_at: user.employee.created_at.toISOString(),
          updated_at: user.employee.updated_at.toISOString(),
          department: user.employee.department,
          designation: user.employee.designation,
          teams: user.employee?.TeamMember.length
            ? user.employee.TeamMember.map((tm) => tm.team.name).join(", ")
            : null,
          current_shift: user.employee?.EmployeeShift[0]?.shift.name || null,
        }
      : null,
  }));
};
export const updateEmployeeAdmin = async (data: EmployeeUpdateAdmin) => {
  return prisma.$transaction(async (tx) => {
    const employee = await tx.employee.findUnique({
      where: { id: data.employee_id },
      include: {
        User: { select: { id: true, email: true, username: true } },
      },
    });
    if (!employee) {
      throw new Error("Employee not found");
    }

    const userId = employee.User?.[0]?.id;
    if (!userId) {
      throw new Error("No associated user account found for this employee");
    }
    if (data.employee_code && data.employee_code !== employee.employee_code) {
      const exists = await tx.employee.findUnique({
        where: { employee_code: data.employee_code },
      });
      if (exists) throw new Error("Employee code already in use");
    }

    if (data.email && data.email !== employee.email) {
      const exists = await tx.employee.findUnique({
        where: { email: data.email },
      });
      if (exists) throw new Error("Email already in use");
    }

    if (data.phone && data.phone !== employee.phone) {
      const exists = await tx.employee.findUnique({
        where: { phone: data.phone },
      });
      if (exists) throw new Error("Phone already in use");
    }

    if (data.cnic && data.cnic !== employee.cnic) {
      const exists = await tx.employee.findUnique({
        where: { cnic: data.cnic },
      });
      if (exists) throw new Error("CNIC already in use");
    }
    const employeeUpdateData: any = {};

    if (data.employee_code !== undefined)
      employeeUpdateData.employee_code = data.employee_code;
    if (data.full_name !== undefined)
      employeeUpdateData.full_name = data.full_name;
    if (data.father_name !== undefined)
      employeeUpdateData.father_name = data.father_name;
    if (data.email !== undefined) employeeUpdateData.email = data.email;
    if (data.phone !== undefined) employeeUpdateData.phone = data.phone;
    if (data.cnic !== undefined) employeeUpdateData.cnic = data.cnic;
    if (data.gender !== undefined) employeeUpdateData.gender = data.gender;
    if (data.dob !== undefined)
      employeeUpdateData.dob = data.dob ? new Date(data.dob) : null;
    if (data.join_date !== undefined)
      employeeUpdateData.join_date = data.join_date
        ? new Date(data.join_date)
        : null;
    if (data.leave_date !== undefined)
      employeeUpdateData.leave_date = data.leave_date
        ? new Date(data.leave_date)
        : null;
    if (data.address !== undefined) employeeUpdateData.address = data.address;
    if (data.department_id !== undefined)
      employeeUpdateData.department_id = data.department_id;
    if (data.designation_id !== undefined)
      employeeUpdateData.designation_id = data.designation_id;
    if (data.status !== undefined) employeeUpdateData.status = data.status;
    if (data.profile_picture) {
      const { image: base64Image, extension } = extractImageAndExtension(
        data.profile_picture,
      );
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
      const { success } = await saveBase64Image(
        base64Image,
        filename,
        "uploads/users",
      );
      if (!success) throw new Error("Failed to save profile picture");
      employeeUpdateData.profile_picture = filename;
    }
    const updatedEmployee = await tx.employee.update({
      where: { id: data.employee_id },
      data: employeeUpdateData,
    });
    if (data.email) {
      await tx.user.update({
        where: { id: userId },
        data: { email: data.email },
      });
    }
    if (data.shift_id) {
      await tx.employeeShift.updateMany({
        where: { employee_id: data.employee_id, is_active: true },
        data: { is_active: false },
      });

      await tx.employeeShift.create({
        data: {
          employee_id: data.employee_id,
          shift_id: data.shift_id,
          effective_from: new Date(),
          is_active: true,
        },
      });
    }
    if (data.team_id !== undefined) {
      await tx.teamMember.updateMany({
        where: { employee_id: data.employee_id, is_active: true },
        data: { is_active: false, is_deleted: true },
      });

      if (data.team_id) {
        await tx.teamMember.create({
          data: {
            team_id: data.team_id,
            employee_id: data.employee_id,
            assigned_at: new Date(),
            is_active: true,
          },
        });
      }
    }
    if (data.user_rights && data.user_rights.length > 0) {
      const menuIds = data.user_rights.map((r) => r.menu_id);
      const existingMenus = await tx.menu.findMany({
        where: { id: { in: menuIds } },
        select: { id: true },
      });

      const existingMenuIds = new Set(existingMenus.map((m) => m.id));
      const invalidMenuIds = menuIds.filter((id) => !existingMenuIds.has(id));

      if (invalidMenuIds.length > 0) {
        throw new Error(
          `Invalid menu IDs: ${invalidMenuIds.join(", ")}. These menus do not exist.`,
        );
      }
      if (data.replace_all_rights) {
        await tx.userMenuRight.deleteMany({ where: { user_id: userId } });
      }
      for (const right of data.user_rights) {
        await tx.userMenuRight.upsert({
          where: {
            user_id_menu_id: {
              user_id: userId,
              menu_id: right.menu_id,
            },
          },
          update: {
            can_view: right.can_view ?? true,
            can_create: right.can_create ?? false,
            can_edit: right.can_edit ?? false,
            can_delete: right.can_delete ?? false,
          },
          create: {
            user_id: userId,
            menu_id: right.menu_id,
            can_view: right.can_view ?? true,
            can_create: right.can_create ?? false,
            can_edit: right.can_edit ?? false,
            can_delete: right.can_delete ?? false,
          },
        });
      }
    }

    return updatedEmployee;
  });
};
export const updateEmployeeStatusAndSyncUser = async (
  employeeId: number,
  newStatus: "active" | "inactive" | "terminated",
) => {
  return prisma.$transaction(async (tx) => {
    const employee = await tx.employee.findUnique({
      where: { id: employeeId },
      include: {
        User: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employeeUpdateData: any = {
      status: newStatus,
      updated_at: today,
    };

    if (newStatus === "inactive" || newStatus === "terminated") {
      if (!employee.leave_date) {
        employeeUpdateData.leave_date = today;
      }
    } else if (newStatus === "active") {
      employeeUpdateData.leave_date = null;
    }
    employeeUpdateData.is_active = newStatus === "active";
    const updatedEmployee = await tx.employee.update({
      where: { id: employeeId },
      data: employeeUpdateData,
      select: {
        id: true,
        employee_code: true,
        full_name: true,
        status: true,
        leave_date: true,
        updated_at: true,
      },
    });
    const userShouldBeActive = newStatus === "active";
    if (employee.User?.[0]) {
      await tx.user.update({
        where: { id: employee.User[0].id },
        data: {
          is_active: userShouldBeActive,
          updated_at: today,
        },
      });
    }
    return {
      ...updatedEmployee,
      is_active: userShouldBeActive,
    };
  });
};
export const getSingleEmployeeFullDetails = async (employeeId: number) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId, is_deleted: false },
    select: {
      id: true,
      employee_code: true,
      full_name: true,
      email: true,
      phone: true,
      cnic: true,
      gender: true,
      dob: true,
      join_date: true,
      address: true,
      department: { select: { id: true } },
      designation: { select: { id: true } },
      EmployeeShift: {
        where: { is_active: true, is_deleted: false },
        orderBy: { effective_from: "desc" },
        take: 1,
        select: { shift: { select: { id: true } } },
      },
      TeamMember: {
        where: { is_active: true, is_deleted: false },
        take: 1, // assuming only 1 team is required
        select: { team: { select: { id: true } } },
      },
      User: {
        where: { is_deleted: false },
        take: 1,
        select: {
          username: true,
          type: true,
          user_menu_rights: {
            where: {
              menu: { is_deleted: false, is_active: true },
            },
            select: {
              can_view: true,
              can_create: true,
              can_edit: true,
              can_delete: true,
              menu: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!employee) throw new Error("Employee not found or deleted");

  const user = employee.User?.[0] ?? null;

  return {
    id: employee.id,
    employee_code: employee.employee_code,
    username: user?.username ?? null,
    full_name: employee.full_name,
    email: employee.email,
    emp_type: user?.type ?? null,
    phone: employee.phone,
    cnic: employee.cnic,
    gender: employee.gender,
    dob: employee.dob ? employee.dob.toISOString().split("T")[0] : null,
    address: employee.address,
    join_date: employee.join_date
      ? employee.join_date.toISOString().split("T")[0]
      : null,
    department_id: employee.department?.id ?? null,
    designation_id: employee.designation?.id ?? null,
    shift_id: employee.EmployeeShift?.[0]?.shift?.id ?? null,
    team_id: employee.TeamMember?.[0]?.team?.id ?? null,
    menu_rights:
      user?.user_menu_rights.map((right) => ({
        menu_id: right.menu.id,
        can_view: right.can_view,
        can_create: right.can_create,
        can_edit: right.can_edit,
        can_delete: right.can_delete,
      })) ?? [],
  };
};

async function saveAndCreateDocument(
  tx: any,
  employeeId: number,
  doc: { base64: string; document_type: string; description?: string },
  uploadedBy: number,
) {
  const { image: base64Data, extension } = extractImageAndExtension(doc.base64);

  const filename = `emp_${employeeId}_${doc.document_type}_${Date.now()}.${extension}`;
  const directory = "uploads/documents";

  const { success } = await saveBase64Image(base64Data, filename, directory);
  if (!success) throw new Error(`Failed to save ${doc.document_type} document`);

  return tx.employeeDocument.create({
    data: {
      employee_id: employeeId,
      document_type: doc.document_type,
      file_url: `${directory}/${filename}`,
      file_name: filename,
      mime_type: extension === "pdf" ? "application/pdf" : `image/${extension}`,
      description: doc.description?.trim() ?? null,
      uploaded_by: uploadedBy,
    },
  });
}

export const uploadEmployeeDocuments = async (
  data: z.infer<typeof employeeDocumentCreateSchema>,
  uploadedBy: number,
) => {
  return prisma.$transaction(
    async (tx) => {
      const employee = await tx.employee.findUnique({
        where: { id: data.employee_id, is_deleted: false },
      });
      if (!employee) throw new Error("Employee not found or deleted");

      const uploadedDocs = [];

      for (const doc of data.documents) {
        const savedDoc = await saveAndCreateDocument(
          tx,
          data.employee_id,
          doc,
          uploadedBy,
        );
        uploadedDocs.push(savedDoc);
      }

      return uploadedDocs;
    },
    { timeout: 30000 },
  );
};

export const updateEmployeeDocument = async (
  data: z.infer<typeof employeeDocumentUpdateSchema>,
  updatedBy: number,
) => {
  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.employeeDocument.findUnique({
        where: { id: data.document_id, is_deleted: false },
      });
      if (!existing) throw new Error("Document not found or deleted");

      let updateData: any = {
        description: data.description,
        is_active: data.is_active,
      };

      if (data.base64) {
        const { image: base64Data, extension } = extractImageAndExtension(
          data.base64,
        );
        const filename = `emp_${existing.employee_id}_${existing.document_type}_updated_${Date.now()}.${extension}`;
        const directory = "uploads/documents";

        const { success } = await saveBase64Image(
          base64Data,
          filename,
          directory,
        );
        if (!success) throw new Error("Failed to save updated document");

        updateData.file_url = `${directory}/${filename}`;
        updateData.file_name = filename;
        updateData.mime_type =
          extension === "pdf" ? "application/pdf" : `image/${extension}`;
      }

      const updatedDoc = await tx.employeeDocument.update({
        where: { id: data.document_id },
        data: updateData,
      });

      return updatedDoc;
    },
    { timeout: 30000 },
  );
};

export const getEmployeeDocuments = async (employeeId: number) => {
  return prisma.employeeDocument.findMany({
    where: {
      employee_id: employeeId,
      is_deleted: false,
    },
    orderBy: { uploaded_at: "desc" },
    select: {
      id: true,
      document_type: true,
      file_url: true,
      file_name: true,
      mime_type: true,
      description: true,
      uploaded_at: true,
      is_active: true,
      uploader: { select: { full_name: true } },
    },
  });
};
// export const getSingleEmployeeFullDetails = async (employeeId: number) => {
//   const employee = await prisma.employee.findUnique({
//     where: {
//       id: employeeId,
//       is_deleted: false,
//     },
//     select: {
//       id: true,
//       employee_code: true,
//       full_name: true,
//       father_name: true,
//       email: true,
//       phone: true,
//       cnic: true,
//       gender: true,
//       dob: true,
//       join_date: true,
//       leave_date: true,
//       address: true,
//       profile_picture: true,
//       status: true,
//       is_active: true,
//       created_at: true,
//       updated_at: true,
//       department: {
//         select: {
//           id: true,
//           name: true,
//         },
//       },
//       designation: {
//         select: {
//           id: true,
//           title: true,
//           level: true,
//         },
//       },
//       User: {
//         where: {
//           is_deleted: false,
//         },
//         take: 1,
//         select: {
//           id: true,
//           username: true,
//           email: true,
//           type: true,
//           last_login: true,
//           is_active: true,
//           created_at: true,
//           updated_at: true,
//           user_menu_rights: {
//             where: {
//               menu: {
//                 is_deleted: false,
//                 is_active: true,
//               },
//             },
//             select: {
//               can_view: true,
//               can_create: true,
//               can_edit: true,
//               can_delete: true,
//               menu: {
//                 select: {
//                   id: true,
//                   name: true,
//                   url: true,
//                   icon: true,
//                   type: true,
//                   parent_id: true,
//                 },
//               },
//             },
//             orderBy: {
//               menu: {
//                 sorting: "asc", // optional – better UX
//               },
//             },
//           },
//         },
//       },
//       EmployeeShift: {
//         where: {
//           is_active: true,
//           is_deleted: false,
//         },
//         orderBy: {
//           effective_from: "desc",
//         },
//         take: 1,
//         select: {
//           shift: {
//             select: {
//               id: true,
//               name: true,
//               start_time: true,
//               end_time: true,
//               grace_minutes: true,
//               half_day_hours: true,
//             },
//           },
//           effective_from: true,
//         },
//       },
//       TeamMember: {
//         where: {
//           is_active: true,
//           is_deleted: false,
//         },
//         select: {
//           team: {
//             select: {
//               id: true,
//               name: true,
//               description: true,
//               team_lead: {
//                 select: {
//                   id: true,
//                   full_name: true,
//                 },
//               },
//             },
//           },
//           role_in_team: true,
//           assigned_at: true,
//         },
//       },
//     },
//   });

//   if (!employee) {
//     throw new Error("Employee not found or has been deleted");
//   }
//   const user = employee.User?.[0] ?? null;

//   return {
//     employee: {
//       id: employee.id,
//       employee_code: employee.employee_code,
//       full_name: employee.full_name,
//       father_name: employee.father_name,
//       email: employee.email,
//       phone: employee.phone,
//       cnic: employee.cnic,
//       gender: employee.gender,
//       dob: employee.dob ? employee.dob.toISOString().split("T")[0] : null,
//       join_date: employee.join_date ? employee.join_date.toISOString().split("T")[0] : null,
//       leave_date: employee.leave_date ? employee.leave_date.toISOString().split("T")[0] : null,
//       address: employee.address,
//       profile_picture: employee.profile_picture,
//       status: employee.status,
//       is_active: employee.is_active,
//       created_at: employee.created_at.toISOString(),
//       updated_at: employee.updated_at.toISOString(),

//       department: employee.department
//         ? {
//             id: employee.department.id,
//             name: employee.department.name,
//           }
//         : null,

//       designation: employee.designation
//         ? {
//             id: employee.designation.id,
//             title: employee.designation.title,
//             level: employee.designation.level,
//           }
//         : null,

//       current_shift: employee.EmployeeShift?.[0]
//         ? {
//             shift_id: employee.EmployeeShift[0].shift.id,
//             name: employee.EmployeeShift[0].shift.name,
//             start_time: employee.EmployeeShift[0].shift.start_time,
//             end_time: employee.EmployeeShift[0].shift.end_time,
//             grace_minutes: employee.EmployeeShift[0].shift.grace_minutes,
//             half_day_hours: employee.EmployeeShift[0].shift.half_day_hours,
//             effective_from: employee.EmployeeShift[0].effective_from.toISOString(),
//           }
//         : null,

//       teams: employee.TeamMember.map((tm) => ({
//         team_id: tm.team.id,
//         name: tm.team.name,
//         description: tm.team.description || null,
//         role_in_team: tm.role_in_team,
//         assigned_at: tm.assigned_at.toISOString(),
//         team_lead: tm.team.team_lead
//           ? {
//               id: tm.team.team_lead.id,
//               full_name: tm.team.team_lead.full_name,
//             }
//           : null,
//       })),

//       user: user
//         ? {
//             user_id: user.id,
//             username: user.username,
//             email: user.email,
//             type: user.type,
//             last_login: user.last_login ? user.last_login.toISOString() : null,
//             is_active: user.is_active,
//             created_at: user.created_at.toISOString(),
//             updated_at: user.updated_at.toISOString(),
//           }
//         : null,

//       menu_rights: user?.user_menu_rights.map((right) => ({
//         menu_id: right.menu.id,
//         menu_name: right.menu.name,
//         menu_url: right.menu.url,
//         menu_icon: right.menu.icon,
//         menu_type: right.menu.type,
//         parent_id: right.menu.parent_id,
//         permissions: {
//           can_view: right.can_view,
//           can_create: right.can_create,
//           can_edit: right.can_edit,
//           can_delete: right.can_delete,
//         },
//       })) ?? [],
//     },
//   };
// };
