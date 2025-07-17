import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

export const getCheckInStatus = (
  check_in_time: string,
  start_time: string,
  grace_minutes: number
): "on_time" | "late" => {
  const today = dayjs().format("YYYY-MM-DD");

  const checkInTime = dayjs.utc(`${today} ${check_in_time}`, "YYYY-MM-DD HH:mm:ss");
  const shiftStartTime = dayjs.utc(`${today} ${start_time}`, "YYYY-MM-DD HH:mm:ss");

  const graceLimit = shiftStartTime.add(grace_minutes, "minute");

  return checkInTime.isSameOrBefore(graceLimit) ? "on_time" : "late";
};
