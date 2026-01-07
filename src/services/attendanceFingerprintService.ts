import { ZKLib } from "node-zklib";
import prisma from "../config/db";
import { getEmployeeShift, addAttendance, updateAttendance } from "./attendanceServices";
import { getCheckInStatus } from "../utils/getCheckInStatus";
import { getWorkStatus } from "../utils/getWorkStatusAndHours";

interface DeviceLog {
  employeeId: number;
  recordTime: string;
}

interface SyncOptions {
  ip: string;
  port?: number;
  startDate: string;
  endDate: string;
}

// Fetch logs from fingerprint device
export const getAttendanceFromDevice = async (options: SyncOptions): Promise<DeviceLog[]> => {
  const { ip, port = 4370 } = options;
  const zkInstance = new ZKLib(ip, port, 10000);
  try {
    await zkInstance.createSocket();
    await zkInstance.getTime();
    const logsRaw = await zkInstance.getAttendance();

    return logsRaw.map(log => ({
      employeeId: Number(log.enrollNumber),
      recordTime: log.date,
    }));
  } catch (err) {
    console.error("Device connection error:", err);
    return [];
  } finally {
    zkInstance.disconnect();
  }
};

// Sync function with logging & multi-record handling
export const syncFingerprintLogs = async (options: SyncOptions) => {
  const logs = await getAttendanceFromDevice(options);
  if (logs.length === 0) {
    console.log("No logs fetched from device.");
    return;
  }

  console.log(`Fetched ${logs.length} logs from device.`);

  // Group logs by employee per day
  const grouped: Record<string, DeviceLog[]> = {};
  logs.forEach(log => {
    const date = log.recordTime.split(" ")[0];
    const key = `${log.employeeId}-${date}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  const insertLogs: any[] = [];
  const updateLogs: any[] = [];

  for (const key of Object.keys(grouped)) {
    const [employeeIdStr, date] = key.split("-");
    const employeeId = Number(employeeIdStr);

    // Sort logs by time to get check-in and check-out
    const logsForDay = grouped[key].sort(
      (a, b) => new Date(a.recordTime).getTime() - new Date(b.recordTime).getTime()
    );
    const check_in_time = logsForDay[0].recordTime;
    const check_out_time = logsForDay[logsForDay.length - 1].recordTime;

    const shift = await getEmployeeShift(employeeId);
    if (!shift) {
      console.log(`Shift not found for employee ${employeeId}. Skipping...`);
      continue;
    }

    const check_in_status = getCheckInStatus(check_in_time, shift.start_time, shift.grace_minutes);
    const work_status = getWorkStatus(check_in_time, check_out_time);

    const existing = await prisma.attendance.findFirst({
      where: { employee_id: employeeId, date },
    });

    if (existing) {
      updateLogs.push({
        attendance_id: existing.id,
        date,
        check_in_time,
        check_out_time,
        work_status,
        check_in_status,
      });
    } else {
      insertLogs.push({
        employee_id: employeeId,
        date,
        check_in_time,
        check_out_time,
        work_status,
        check_in_status,
      });
    }
  }

  console.log("Prepared logs to INSERT:", insertLogs);
  console.log("Prepared logs to UPDATE:", updateLogs);

  // Optional: Preview data before actual DB insert/update
  // Uncomment the next line if you want to halt execution for verification
  return;

  // Bulk insert/update
  for (const log of insertLogs) {
    await addAttendance(
      {
        employee_id: log.employee_id,
        attendance_date: log.date,
        check_in_time: log.check_in_time,
        check_out_time: log.check_out_time,
      },
      log.work_status,
      log.check_in_status
    );
  }

  for (const log of updateLogs) {
    await updateAttendance(
      {
        attendance_id: log.attendance_id,
        attendance_date: log.date,
        check_in_time: log.check_in_time,
        check_out_time: log.check_out_time,
      },
      log.work_status,
      log.check_in_status
    );
  }

  console.log(`Fingerprint sync completed. Inserted: ${insertLogs.length}, Updated: ${updateLogs.length}`);
};
