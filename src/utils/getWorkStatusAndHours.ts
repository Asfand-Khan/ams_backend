// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";

// dayjs.extend(utc);

// type WorkStatus = "early_leave" | "half_day" | "early_go" | "on_time" | "overtime";

// export const getWorkStatus = (
//   check_in_time: string | null,
//   check_out_time: string | null
// ): { working_hours: number; work_status: WorkStatus } => {
  
//   if (!check_in_time || !check_out_time) {
//     throw new Error("Check-in and check-out times are required.");
//   }

//   const today = dayjs().format("YYYY-MM-DD");

//   const checkIn = dayjs.utc(`${today} ${check_in_time}`, "YYYY-MM-DD HH:mm:ss");
//   const checkOut = dayjs.utc(`${today} ${check_out_time}`, "YYYY-MM-DD HH:mm:ss");

//   if (!checkIn.isValid() || !checkOut.isValid()) {
//     throw new Error("Invalid check-in or check-out time format");
//   }

//   if (checkOut.isBefore(checkIn)) {
//     throw new Error("Check-out time cannot be before check-in time");
//   }

//   const workingMinutes = checkOut.diff(checkIn, "minute");
//   const workingHours = parseFloat((workingMinutes / 60).toFixed(2));

//   let workStatus: WorkStatus;

//   if (workingHours < 4) {
//     workStatus = "early_leave";
//   } else if (workingHours <= 5) {
//     workStatus = "half_day";
//   } else if (workingHours <= 7) {
//     workStatus = "early_go";
//   } else if (workingHours <= 9) {
//     workStatus = "on_time";
//   } else {
//     workStatus = "overtime";
//   }

//   return { working_hours: workingHours, work_status: workStatus };
// };

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

type WorkStatus = "early_leave" | "half_day" | "early_go" | "on_time" | "overtime";

export const getWorkStatus = (
  check_in_time: string | null,
  check_out_time: string | null
): { working_hours: number; work_status: WorkStatus; working_hours_formattted: string } => {
  if (!check_in_time || !check_out_time) {
    throw new Error("Check-in and check-out times are required.");
  }

  const today = dayjs().format("YYYY-MM-DD");

  const checkIn = dayjs.utc(`${today} ${check_in_time}`, "YYYY-MM-DD HH:mm:ss");
  const checkOut = dayjs.utc(`${today} ${check_out_time}`, "YYYY-MM-DD HH:mm:ss");

  if (!checkIn.isValid() || !checkOut.isValid()) {
    throw new Error("Invalid check-in or check-out time format");
  }

  if (checkOut.isBefore(checkIn)) {
    throw new Error("Check-out time cannot be before check-in time");
  }

  const workingMinutes = checkOut.diff(checkIn, "minute");
  const workingHours = parseFloat((workingMinutes / 60).toFixed(2));

  const totalMinutes = checkOut.diff(checkIn, "minute");
  const totalSeconds = checkOut.diff(checkIn, "second");

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedTime = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");

  let workStatus: WorkStatus;

  if (totalMinutes < 240) {
    workStatus = "early_leave";
  } else if (totalMinutes <= 300) {
    workStatus = "half_day";
  } else if (totalMinutes <= 420) {
    workStatus = "early_go";
  } else if (totalMinutes <= 540) {
    workStatus = "on_time";
  } else {
    workStatus = "overtime";
  }

  return { working_hours_formattted: formattedTime, work_status: workStatus, working_hours: workingHours };
};
