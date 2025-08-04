import { DateTime } from "luxon";

export function dateDifferenceInDays(
  start: string | Date,
  end: string | Date,
  options?: { inclusive?: boolean; minOne?: boolean }
): number {
  const startDate = DateTime.fromISO(new Date(start).toISOString(), {
    zone: "Asia/Karachi",
  }).startOf("day");
  const endDate = DateTime.fromISO(new Date(end).toISOString(), {
    zone: "Asia/Karachi",
  }).startOf("day");

  let days = endDate.diff(startDate, "days").toObject().days as number;

  if (options?.inclusive) days += 1;
  if (options?.minOne) days = Math.max(1, days);

  return days;
}