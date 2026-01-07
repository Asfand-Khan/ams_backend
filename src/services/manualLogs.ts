import prisma from "../config/db";
import { getEmployeeShift, addAttendance, updateAttendance } from "./attendanceServices";
import { getCheckInStatus } from "../utils/getCheckInStatus";
import { getWorkStatus } from "../utils/getWorkStatusAndHours";

interface DeviceLog {
  employeeId: number;
  recordTime: string; // full datetime
}

interface SyncOptions {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
}

export const syncManualLogs = async (options: SyncOptions) => {
  const { startDate, endDate } = options;

  const formatDateTime = (date: string, time: string) => `${date} ${time}`;

  const logs: DeviceLog[] = [
    { employeeId: 1, recordTime: formatDateTime(startDate, "08:55:00") },
    { employeeId: 1, recordTime: formatDateTime(startDate, "17:45:00") },
    { employeeId: 1, recordTime: formatDateTime(endDate, "09:10:00") },
    { employeeId: 1, recordTime: formatDateTime(endDate, "17:15:00") },
  ];

  // Group logs per employee per day
  const grouped: Record<string, DeviceLog[]> = {};
  logs.forEach(log => {
    const date = log.recordTime.split(" ")[0];
    const key = `${log.employeeId}-${date}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  for (const key of Object.keys(grouped)) {
    const [employeeIdStr, date] = key.split("-");
    const employeeId = Number(employeeIdStr);

    const logsForDay = grouped[key].sort(
      (a, b) => new Date(a.recordTime).getTime() - new Date(b.recordTime).getTime()
    );

    const check_in_datetime = logsForDay[0].recordTime;
    const check_out_datetime = logsForDay[logsForDay.length - 1].recordTime;

    const check_in_time = check_in_datetime.split(" ")[1];
    const check_out_time = check_out_datetime.split(" ")[1];
    const attendance_date = check_in_datetime.split(" ")[0];

    const shift = await getEmployeeShift(employeeId);
    if (!shift) continue;

    const check_in_status = getCheckInStatus(check_in_time, shift.start_time, shift.grace_minutes);

    const { work_status, working_hours_formattted: work_hours } = getWorkStatus(check_in_time, check_out_time);

    // Use work_status as check-out status
    const check_out_status = work_status;

    const attendanceData = {
      employee_id: employeeId,
      attendance_date,
      check_in_time,
      check_out_time,
      work_hours,
      check_in_status,
      check_out_status,
      day_status: "present",
    };

    const existing = await prisma.attendance.findFirst({
      where: { employee_id: employeeId, date: attendance_date },
    });

    if (existing) {
      await updateAttendance(
        { attendance_id: existing.id, ...attendanceData },
        work_status,        // work_status for logic
        check_in_status     // check-in status
      );
    } else {
      await addAttendance(attendanceData, work_status, check_in_status);
    }
  }

  console.log(`Manual logs sync completed for ${logs.length} logs.`);
};
