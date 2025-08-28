import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const KARACHI_TZ = "Asia/Karachi";

export const generateMeetingInstances = (
  recurrence_rule: string,
  recurrence_type: "one_time" | "daily" | "weekly" | "monthly",
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string
) => {
  const instances: {
    instance_date: string;
    start_time: string;
    end_time: string;
  }[] = [];

  let current = dayjs.tz(`${startDate} ${startTime}`, KARACHI_TZ);
  const last = dayjs.tz(`${endDate} ${endTime}`, KARACHI_TZ);

  while (current.isBefore(last) || current.isSame(last, "day")) {
    const instanceDate = current.format("YYYY-MM-DD");
    const instanceStart = startTime;
    const instanceEnd = endTime;

    if (recurrence_type === "weekly") {
      // Weekly → match recurrence_rule day
      if (
        current.format("dddd").toLowerCase() === recurrence_rule.toLowerCase()
      ) {
        instances.push({
          instance_date: instanceDate,
          start_time: instanceStart,
          end_time: instanceEnd,
        });
      }
    } else if (recurrence_type === "monthly") {
      // Monthly → same date as startDate each month
      if (current.date() === dayjs(startDate).date()) {
        instances.push({
          instance_date: instanceDate,
          start_time: instanceStart,
          end_time: instanceEnd,
        });
      }
    } else if (recurrence_type === "daily") {
      // Daily → exclude Saturday and Sunday
      const dayName = current.format("dddd").toLowerCase();
      if (dayName !== "saturday" && dayName !== "sunday") {
        instances.push({
          instance_date: instanceDate,
          start_time: instanceStart,
          end_time: instanceEnd,
        });
      }
    } else if (recurrence_type === "one_time") {
      // One time → always push once
      instances.push({
        instance_date: instanceDate,
        start_time: instanceStart,
        end_time: instanceEnd,
      });
    }

    // Increment cursor
    if (
      recurrence_type === "daily" ||
      recurrence_type === "one_time" ||
      recurrence_type === "weekly"
    ) {
      current = current.add(1, "day");
    } else if (recurrence_type === "monthly") {
      current = current.add(1, "month");
    }
  }

  return instances;
};

/**
 * Convert input date/time string to Karachi timezone string
 */
export const toKarachiDate = (date: string, format = "YYYY-MM-DD") => {
  return dayjs.tz(date, KARACHI_TZ).format(format);
};

/**
 * Convert input time string (HH:mm:ss) into Karachi string
 */
export const toKarachiTime = (time: string, format = "HH:mm:ss") => {
  return dayjs.tz(time, KARACHI_TZ).format(format);
};

/**
 * Convert full datetime string into Karachi string
 */
export const toKarachiDateTime = (
  datetime: string,
  format = "YYYY-MM-DD HH:mm:ss"
) => {
  return dayjs.tz(datetime, KARACHI_TZ).format(format);
};
