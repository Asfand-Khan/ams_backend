import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const getCheckInStatus = (params: {
  check_in_datetime: string;
  system_start_time: string;
  grace_minutes: number;
}): "on_time" | "late" => {
  const { check_in_datetime, system_start_time, grace_minutes } = params;

  const checkInTime = dayjs.utc(check_in_datetime, "YYYY-MM-DD HH:mm:ss");
  const shiftTimeUTC = dayjs.utc(system_start_time);

  const adjustedShiftTime = dayjs.utc(
    `${checkInTime.format("YYYY-MM-DD")} ${shiftTimeUTC.format("HH:mm:ss")}`,
    "YYYY-MM-DD HH:mm:ss"
  );

  const graceTime = adjustedShiftTime.add(grace_minutes, "minute");

  return checkInTime.isBefore(graceTime) || checkInTime.isSame(graceTime)
    ? "on_time"
    : "late";
};
