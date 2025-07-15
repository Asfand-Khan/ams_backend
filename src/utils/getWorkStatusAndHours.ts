import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

type WorkStatus = "early_leave" | "half_day" | "early_go" | "on_time" | "overtime";

export const getWorkStatus = (params: {
  check_in_time: string;   // ISO format with Z (UTC)
  check_out_time: string;  // 'YYYY-MM-DD HH:mm:ss' (Local or SQL format)
}): { working_hours: number; work_status: WorkStatus } => {
  const { check_in_time, check_out_time } = params;

  console.log(params);

  const checkIn = dayjs.utc(check_in_time);
  const checkOut = dayjs.utc(check_out_time, "YYYY-MM-DD HH:mm:ss");

  if (!checkIn.isValid() || !checkOut.isValid()) {
    throw new Error("Invalid check-in or check-out time format");
  }

  if (checkOut.isBefore(checkIn)) {
    throw new Error("Check-out time cannot be before check-in time");
  }

  const workingMinutes = checkOut.diff(checkIn, "minute");
  const workingHours = parseFloat((workingMinutes / 60).toFixed(2));

  let workStatus: WorkStatus;

  if (workingHours < 4) {
    workStatus = "early_leave";
  } else if (workingHours <= 5) {
    workStatus = "half_day";
  } else if (workingHours <= 7) {
    workStatus = "early_go";
  } else if (workingHours <= 9) {
    workStatus = "on_time";
  } else {
    workStatus = "overtime";
  }

  return { working_hours: workingHours, work_status: workStatus };
};