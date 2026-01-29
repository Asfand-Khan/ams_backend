const Zkteco = require("zkteco-js");
import prisma from "../config/db";
import {
  getEmployeeShift,
  addAttendance,
  updateAttendance,
} from "./attendanceServices";
import { getCheckInStatus } from "../utils/getCheckInStatus";
import { getWorkStatus } from "../utils/getWorkStatusAndHours";

const DEVICE_IP = "192.168.18.80";
const PORT = 4370;
const INPORT = 5200;
const TIMEOUT = 90000;

interface DeviceLog {
  employeeId: number;
  recordTime: string;
  user_id?: number;
}

interface SyncOptions {
  startDate: string;
  endDate: string;
}

export async function fetchAttendance(startDate: Date, endDate: Date) {
  const device = new Zkteco(DEVICE_IP, PORT, INPORT, TIMEOUT);
  try {
    await device.createSocket();
    console.log("✅ TCP connected");
    let allLogs: any[] = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await device.getAttendances();
        allLogs = response?.data ?? [];
        console.log(`📊 Fetched ${allLogs.length} logs`);
        break;
      } catch (err: any) {
        console.error(`Attempt ${attempt} failed:`, err.message || err);
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
    if (!allLogs.length) {
      console.log("ℹ️ No logs found");
      return [];
    }
    const logsInRange = allLogs.filter((a) => {
      if (!a.record_time) return false;
      const logDate = new Date(a.record_time);
      return logDate >= startDate && logDate <= endDate;
    });
    return logsInRange;
  } catch (err) {
    console.error("❌ Device error:", err);
    return [];
  } finally {
    try {
      await device.disconnect();
      console.log("🔌 Disconnected");
    } catch {}
  }
}

export const syncFingerprintLogs = async (options: SyncOptions) => {
  console.log("🔹 Starting fingerprint sync...");
  console.log("Options:", options);

  const logs = await fetchAttendance(
    new Date(options.startDate),
    new Date(options.endDate),
  );
  console.log(`📊 Total logs fetched from device: ${logs.length}`);

  if (!logs.length) return;
  const allowedEmployeeIds = [9, 15, 27, 43, 5,17];
  const filteredLogs = logs.filter((log) => {
    const employeeId = log.employeeId ?? log.user_id;
    return employeeId && allowedEmployeeIds.includes(Number(employeeId));
  });

  console.log(`📊 Total logs after filtering: ${filteredLogs.length}`);

  if (!filteredLogs.length) return;
  const grouped: Record<string, DeviceLog[]> = {};
  filteredLogs.forEach((log) => {
    const employeeId = log.employeeId ?? log.user_id;
    const recordTime = log.record_time ?? log.recordTime;
    if (!employeeId || !recordTime) {
      console.warn(
        "⚠️ Skipping log with missing employeeId or recordTime:",
        log,
      );
      return;
    }
    const dateKey = new Date(recordTime).toISOString().split("T")[0];
    const key = `${employeeId}-${dateKey}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ ...log, recordTime });
  });
  console.log(
    `🔹 Logs grouped by employee/day: ${Object.keys(grouped).length} groups`,
  );
  const insertLogs: any[] = [];
  const updateLogs: any[] = [];
  for (const key of Object.keys(grouped)) {
    const [employeeIdStr] = key.split("-");
    const employeeId = Number(employeeIdStr);
    const logsForDay = grouped[key].sort(
      (a, b) =>
        new Date(a.recordTime).getTime() - new Date(b.recordTime).getTime(),
    );
    const recordDate = new Date(logsForDay[0].recordTime);
    const dateString = `${recordDate.getFullYear()}-${(
      recordDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${recordDate.getDate().toString().padStart(2, "0")}`;
    const check_in_time = new Date(logsForDay[0].recordTime)
      .toTimeString()
      .split(" ")[0];
    const check_out_time = new Date(
      logsForDay[logsForDay.length - 1].recordTime,
    )
      .toTimeString()
      .split(" ")[0];
    console.log(
      `🔹 Processing employee ${employeeId} for date ${dateString}. Check-in: ${check_in_time}, Check-out: ${check_out_time}`,
    );
    const shift = await getEmployeeShift(employeeId);
    if (!shift) {
      console.warn(`⚠️ No shift found for employee ${employeeId}, skipping...`);
      continue;
    }
    const check_in_status = getCheckInStatus(
      check_in_time,
      shift.start_time,
      shift.grace_minutes,
    );
    const work_status = getWorkStatus(check_in_time, check_out_time);

    const existing = await prisma.attendance.findFirst({
      where: { employee_id: employeeId, date: dateString },
    });
    if (!existing) {
      console.log(
        `ℹ️ Inserting attendance for employee ${employeeId} on ${dateString}`,
      );
      insertLogs.push({
        employee_id: employeeId,
        attendance_date: dateString,
        check_in_time,
        check_out_time,
        work_status,
        check_in_status,
      });
    } else {
      let new_check_in = existing.check_in_time ?? check_in_time;
      let new_check_out = existing.check_out_time ?? check_out_time;
      let updated = true;
      if (!existing.check_in_time || check_in_time < existing.check_in_time) {
        new_check_in = check_in_time;
        // updated = true;
      }
      if (
        !existing.check_out_time ||
        check_out_time > existing.check_out_time
      ) {
        new_check_out = check_out_time;
        // updated = true;
      }
      if (updated) {
         const final_work_status = getWorkStatus(new_check_in, new_check_out);
        console.log(
          `ℹ️ Updating attendance for employee ${employeeId} on ${dateString}`,
        );
        updateLogs.push({
      attendance_id: existing.id,
      date: dateString,
      check_in_time: new_check_in,
      check_out_time: new_check_out,
      work_status: final_work_status,
      check_in_status,
        });
      } else {
        console.log(
          `ℹ️ No update needed for employee ${employeeId} on ${dateString}`,
        );
      }
    }
  }
  for (const log of insertLogs) {
    await addAttendance(log, log.work_status, log.check_in_status);
  }
  for (const log of updateLogs) {
    await updateAttendance(log, log.work_status, log.check_in_status);
  }
  console.log("✅ Fingerprint sync finished.");
};
