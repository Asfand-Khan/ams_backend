import cron from "node-cron";
import notifyCheckIN10AM from "./notifyCheckIn10AM";
import notifyCheckOUT6PM from "./notifyCheckOut6PM";

async function notifyCheckIn10AM() {
  console.log("Notify checkin 10AM work started.");
  await notifyCheckIN10AM();
  console.log("Notify checkin 10AM work ended.");
}

async function notifyCheckOut6PM() {
  console.log("Notify checkout 6PM work started.");
  await notifyCheckOUT6PM();
  console.log("Notify checkout 6PM work ended.");
}

export default function initializeCronJobs() {
  try {
    const notifyCheckInSchedule10AM = cron.schedule("05 10 * * *", () => { notifyCheckIn10AM() },{ timezone: "Asia/Karachi" });
    notifyCheckInSchedule10AM.start();

    const notifyCheckOutSchedule6PM = cron.schedule("01 18 * * *", () => { notifyCheckOut6PM() },{ timezone: "Asia/Karachi" });
    notifyCheckOutSchedule6PM.start();
  } catch (err: any) {
    console.error("❌ Cron job initialization failed:", err.message);
  }
}
