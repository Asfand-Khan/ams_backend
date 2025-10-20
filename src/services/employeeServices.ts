import prisma from "../config/db";
import {
  extractImageAndExtension,
  saveBase64Image,
} from "../utils/base64Helpers";
import { generateRandomHex } from "../utils/generateRandomHex";
import {
  Employee,
  EmployeeUpdate,
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
  if (userType === "employee") {
    return [];
  }
  let whereClause: any = {
    is_deleted: false,
  };
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
    },
  });
  return allEmployees.map((employee) => ({
    ...employee,
    id: String(employee.id), 
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

        await prisma.userMenuRight.createMany({
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
    }
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
  new_password: string
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
      data.profile_picture
    );
    employeeData.profile_picture = `${new Date().getTime()}.${extension}`;
    const customDirectory = "uploads/users";
    const { success } = await saveBase64Image(
      imageBase64,
      employeeData.profile_picture,
      customDirectory
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

export const getAllUsersWithEmployee = async () => {
  const allEmployees = await prisma.user.findMany({
    where: {
      is_deleted: false,
    },
    include: {
      employee: {
        include: {
          department: {
            select: {
              name: true,
            }
          },
          designation: {
            select: {
              title: true,
            }
          },
        },
      },
    },
  });
  return allEmployees;
};
