import { NextFunction, Request, Response } from "express";
import {
  attendanceByDateSchema,
  attendanceByIdSchema,
  attendanceSchema,
  attendanceSummarySchema,
  checkInSchema,
  checkOutSchema,
  createAttendanceSchema,
  singleAttendanceSchema,
  updateAttendanceSchema,
} from "../validations/attendanceValidations";
import { getEmployeeById } from "../services/employeeServices";
import {
  addAttendance,
  attendanceById,
  attendanceSummary,
  attendanceSummaryV2,
  dailyAttendanceSummary,
  getAttendance,
  getAttendanceByDate,
  getEmployeeAttendance,
  getEmployeeShift,
  ifCheckInExists,
  markCheckIn,
  markCheckOut,
  singleAttendance,
  updateAttendance,
} from "../services/attendanceServices";
import { getCheckInStatus } from "../utils/getCheckInStatus";
import { getWorkStatus } from "../utils/getWorkStatusAndHours";
import { handleAppError } from "../utils/appErrorHandler";
import { AuthRequest } from "../types/types";

// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v1/attendances/check-in
// Description --> Mark the check-in of the employee
export const checkInHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = checkInSchema.parse(req.body);

    const employee = await getEmployeeById(parsedData.employee_id);
    if (!employee) {
      return res.status(404).json({
        status: 0,
        message: "Employee not found",
        payload: [],
      });
    }

    const attendanceExists = await ifCheckInExists(
      parsedData.employee_id,
      parsedData.attendance_date
    );

    if (attendanceExists !== null) {
      throw new Error("Attendance already exists");
    }

    const shift = await getEmployeeShift(parsedData.employee_id);

    if (!shift) {
      throw new Error("Shift not found");
    }

    const checkInStatus = await getCheckInStatus(
      parsedData.check_in_time,
      shift.start_time,
      shift.grace_minutes
    );

    const attendance = await markCheckIn(parsedData, checkInStatus);

    return res.status(200).json({
      status: 1,
      message: "Employee checked-in successfully",
      payload: [attendance],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v1/attendances/check-out
// Description --> Mark the check-out of the employee
export const checkOutHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = checkOutSchema.parse(req.body);

    const employee = await getEmployeeById(parsedData.employee_id);
    if (!employee) {
      return res.status(404).json({
        status: 0,
        message: "Employee not found",
        payload: [],
      });
    }

    const attendance = await getEmployeeAttendance(
      parsedData.employee_id,
      parsedData.attendance_date
    );

    if (attendance == null) {
      throw new Error("Attendance not found");
    }

    const work_status = await getWorkStatus(
      attendance.check_in_time,
      parsedData.check_out_time
    );

    const data = {
      ...parsedData,
      checkoutStatus: work_status.work_status,
      workingHours: work_status.working_hours_formattted,
      attendance_id: attendance.id,
    };

    const updatedAttendance = await markCheckOut(data);

    return res.status(200).json({
      status: 1,
      message: "Employee checked-out successfully",
      payload: [updatedAttendance],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v1/attendances/single-attendance
// Description --> Fetch the single attendance
export const getSingleAttendanceHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = singleAttendanceSchema.parse(req.body);
    const attendance = await singleAttendance(
      parsedData.employee_id,
      parsedData.attendance_date
    );

    if (!attendance) {
      return res.status(404).json({
        status: 0,
        message: "Attendance not found",
        payload: [],
      });
    }

    return res.status(200).json({
      status: 1,
      message: "Fetched single attendance successfully",
      payload: [attendance],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v1/attendances/summary
// Description --> Fetch attendance summary
export const getAttendanceSummaryHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = attendanceSummarySchema.parse(req.body);
    const attSummary = await attendanceSummary(
      parsedData.employee_id,
      parsedData.start_date,
      parsedData.end_date
    );

    return res.status(200).json({
      status: 1,
      message: "Fetched attendance summary successfully",
      payload: attSummary,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Attendance
// Method --> POST (Protected)
// Endpoint --> /api/v1/attendances/
// Description --> Fetch the attendance
export const getAttendanceHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = attendanceSchema.parse(req.body);
    const attendance = await getAttendance(parsedData);

    if (!attendance) {
      return res.status(404).json({
        status: 0,
        message: "Attendance not found",
        payload: [],
      });
    }

    return res.status(200).json({
      status: 1,
      message: "Fetched attendance successfully",
      payload: attendance,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
// Module --> Attendance
// Method --> POST (Protected)
// Endpoint --> /api/v1/attendances/add
// Description --> Add attendance
export const addAttendanceHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = createAttendanceSchema.parse(req.body);

    if (parsedData.check_in_time == null && parsedData.check_out_time == null) {
      throw new Error(
        "Check in and check out time can not be null at the same time, one should atleast be provided."
      );
    }
    if (parsedData.check_out_time) {
      if (parsedData.check_in_time == null) {
        throw new Error(
          "Check in time can not be null when check out time is provided."
        );
      }
    }

    const employee = await getEmployeeById(parsedData.employee_id);
    if (!employee) {
      return res.status(400).json({
        status: 0,
        message: "Employee not found",
        payload: [],
      });
    }

    const attendanceExists = await singleAttendance(
      parsedData.employee_id,
      parsedData.attendance_date
    );

    if (attendanceExists !== null) {
      throw new Error("Attendance already exists");
    }

    const shift = await getEmployeeShift(parsedData.employee_id);
    if (!shift) {
      throw new Error("Shift not found");
    }

    let check_in_status = null;
    if (parsedData.check_in_time) {
      check_in_status = await getCheckInStatus(
        parsedData.check_in_time,
        shift.start_time,
        shift.grace_minutes
      );
    }

    let work_status = null;
    if (parsedData.check_in_time && parsedData.check_out_time) {
      work_status = await getWorkStatus(
        parsedData.check_in_time,
        parsedData.check_out_time
      );
    }

    const attendance = await addAttendance(
      parsedData,
      work_status,
      check_in_status
    );

    return res.status(200).json({
      status: 1,
      message: "Added attendance successfully",
      payload: [attendance],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
// Module --> Attendance
// Method --> POST (Protected)
// Endpoint --> /api/v1/attendances/update
// Description --> Update attendance
export const updateAttendanceHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = updateAttendanceSchema.parse(req.body);
    if (parsedData.check_in_time == null && parsedData.check_out_time == null) {
      throw new Error(
        "Check in and check out time can not be null at the same time, one should atleast be provided."
      );
    }
    if (parsedData.check_out_time) {
      if (parsedData.check_in_time == null) {
        throw new Error(
          "Check in time can not be null when check out time is provided."
        );
      }
    }

    const attendance = await attendanceById(parsedData.attendance_id);
    if (!attendance) {
      return res.status(400).json({
        status: 0,
        message: "Attendance not found",
        payload: [],
      });
    }

    const shift = await getEmployeeShift(attendance.employee_id);
    if (!shift) {
      throw new Error("Shift not found");
    }

    let check_in_status = null;
    if (parsedData.check_in_time) {
      check_in_status = await getCheckInStatus(
        parsedData.check_in_time,
        shift.start_time,
        shift.grace_minutes
      );
    }

    let work_status = null;
    if (parsedData.check_in_time && parsedData.check_out_time) {
      work_status = await getWorkStatus(
        parsedData.check_in_time,
        parsedData.check_out_time
      );
    }

    const updatedAttendance = await updateAttendance(
      parsedData,
      work_status,
      check_in_status
    );

    return res.status(200).json({
      status: 1,
      message: "Updated attendance successfully",
      payload: [updatedAttendance],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
// Module --> Attendance
// Method --> POST (Protected)
// Endpoint --> /api/v1/attendances/by-date
// Description --> Fetch the attendance by the date
export const getAttendanceByDateHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Validate request body
    const parsedData = attendanceByDateSchema.parse(req.body);
    if (!req.userRecord) {
      return res.status(401).json({
        status: 0,
        message: "User not authenticated",
        payload: [],
      });
    }
    const attendance = await getAttendanceByDate(parsedData, req.userRecord);

    return res.status(200).json({
      status: 1,
      message: "Fetched attendance by date successfully",
      payload: attendance,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
// Module --> Attendance
// Method --> POST (Protected)
// Endpoint --> /api/v1/attendances/by-id
// Description --> Update attendance
export const getAttendanceByIdHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = attendanceByIdSchema.parse(req.body);

    const attendance = await attendanceById(parsedData.attendance_id);
    if (!attendance) {
      return res.status(400).json({
        status: 0,
        message: "Attendance not found",
        payload: [],
      });
    }

    return res.status(200).json({
      status: 1,
      message: "Fetched attendance by ID successfully",
      payload: [attendance],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v1/attendances/daily-attendance-summary
// Description --> Get daily attendance summary
export const getDailyAttendanceSummaryHandler = async (
  req: AuthRequest, // Updated to use AuthRequest
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Ensure user is attached by authentication middleware
    if (!req.userRecord) {
      return res.status(401).json({
        status: 0,
        message: "User not authenticated",
        payload: [],
      });
    }

    const summary = await dailyAttendanceSummary(req.userRecord);

    return res.status(200).json({
      status: 1,
      message: "Fetched daily attendance summary successfully",
      payload: summary,
    });
  } catch (error) {
    const err = handleAppError(error); // Assuming handleAppError is defined elsewhere
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v2/attendances/summary
// Description --> Fetch attendance summary
export const getAttendanceSummaryV2Handler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = attendanceSummarySchema.parse(req.body);
    const attSummary = await attendanceSummaryV2(
      parsedData.employee_id,
      parsedData.start_date,
      parsedData.end_date
    );

    return res.status(200).json({
      status: 1,
      message: "Fetched attendance summary successfully",
      payload: attSummary,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
// export const syncFingerprintHandler = async (req: Request, res: Response) => {
//   try {
//     const { startDate, endDate } = req.body;
//     const DEVICE_IP = process.env.FINGERPRINT_IP || "192.168.1.201";

//     await syncFingerprintLogs({
//       ip: DEVICE_IP,
//       startDate,
//       endDate
//     });

//     return res.status(200).json({ status: 1, message: "Fingerprint logs synced successfully." });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ status: 0, message: "Sync failed", payload: [] });
//   }
// };