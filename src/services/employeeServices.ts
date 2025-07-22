import prisma from "../config/db";
import { generateRandomHex } from "../utils/generateRandomHex";
import { Employee, EmployeeUpdate } from "../validations/employeeValidations";

export const getAllEmployees = async () => {
  try {
    const allEmployees = await prisma.employee.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allEmployees;
  } catch (error: any) {
    throw new Error(`Failed to fetch all employees: ${error.message}`);
  }
};

export const createEmployee = async (employee: Employee) => {
  try {
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

    if (employee.join_date) data["join_date"] = new Date(employee.join_date);
    if (employee.leave_date) data["leave_date"] = new Date(employee.leave_date);
    if (employee.dob) data["dob"] = new Date(employee.dob);

    if (employee.gender) {
      data["gender"] = employee.gender;
    }

    const result = await prisma.$transaction(async (tx) => {
      const newEmployee = await tx.employee.create({ data });

      const leavesTypes = await prisma.leaveType.findMany();

      const user = await tx.user.create({
        data: {
          username: employee.username,
          password_hash: generateRandomHex(16),
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
    });

    return result;
  } catch (error: any) {
    throw new Error(`Failed to create a employee: ${error.message}`);
  }
};

export const updateEmployee = async (employee: EmployeeUpdate) => {
  try {
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
  } catch (error: any) {
    throw new Error(`Failed to update a employee: ${error.message}`);
  }
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
  return prisma.$queryRaw`
    SELECT 
    e.id AS employee_id,
    e.employee_code,
    e.full_name,
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
  `;
};
