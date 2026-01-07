import cron from "node-cron";
import {
  notifyCheckIN09AM,
  notifyCheckIN10AM,
  notifyCheckIN11AM,
} from "./notifyCheckIn";
import {
  notifyCheckOUT05PM,
  notifyCheckOUT06PM,
  notifyCheckOUT07PM,
} from "./notifyCheckOut";
import { markAbsent } from "./markAbsent";
import { markWeekend } from "./markWeekend";
import { notifyMeetingReminders } from "./notifyMeetingReminders";
import { notifyBirthday } from "./notifyBirthday";
import { notifyWorkAnniversary } from "./notifyWorkAnniversary";

async function notifyCheckIN09AMHandler() {
  console.log("Notify checkin 09AM work started.");
  await notifyCheckIN09AM();
  console.log("Notify checkin 09AM work ended.");
}

async function notifyCheckIN10AMHandler() {
  console.log("Notify checkin 10AM work started.");
  await notifyCheckIN10AM();
  console.log("Notify checkin 10AM work ended.");
}

async function notifyCheckIN11AMHandler() {
  console.log("Notify checkin 11AM work started.");
  await notifyCheckIN11AM();
  console.log("Notify checkin 11AM work ended.");
}

async function notifyCheckOut05PMHandler() {
  console.log("Notify checkout 5PM work started.");
  await notifyCheckOUT05PM();
  console.log("Notify checkout 5PM work ended.");
}

async function notifyCheckOut6PM() {
  console.log("Notify checkout 6PM work started.");
  await notifyCheckOUT06PM();
  console.log("Notify checkout 6PM work ended.");
}

async function notifyCheckOut07PMHandler() {
  console.log("Notify checkout 7PM work started.");
  await notifyCheckOUT07PM();
  console.log("Notify checkout 7PM work ended.");
}

async function markAbsentHandler() {
  console.log("Mark absent work started.");
  await markAbsent();
  console.log("Mark absent work started.");
}

async function markWeekendHandler() {
  console.log("Mark weekend work started.");
  await markWeekend();
  console.log("Mark weekend work started.");
}
async function meetingReminderHandler() {
  console.log("notifyMeetingReminders work started.");
  await notifyMeetingReminders();
  console.log("notifyMeetingReminders work ended.");
}
async function workAnniversaryHandler() {
  console.log("Work anniversary notification cron started.");
  await notifyWorkAnniversary();
  console.log("Work anniversary notification cron ended.");
}
async function birthdayHandler() {
  console.log("Birthday notification cron started.");
  await notifyBirthday();
  console.log("Birthday notification cron ended.");
}

// async function sendEmail() {
//   console.log("Details work started.");
//   await sendDetails();
//   console.log("Details work ended.");
// }

export default function initializeCronJobs() {
  try {
    // Check In Crons
    const notifyCheckInSchedule09AM = cron.schedule(
      "00 09 * * *",
      () => {
        notifyCheckIN09AMHandler();
      },
      { timezone: "Asia/Karachi" }
    );
    notifyCheckInSchedule09AM.start();

    const notifyCheckInSchedule10AM = cron.schedule(
      "00 10 * * *",
      () => {
        notifyCheckIN10AMHandler();
      },
      { timezone: "Asia/Karachi" }
    );
    notifyCheckInSchedule10AM.start();

    const notifyCheckInSchedule11AM = cron.schedule(
      "00 11 * * *",
      () => {
        notifyCheckIN11AMHandler();
      },
      { timezone: "Asia/Karachi" }
    );
    notifyCheckInSchedule11AM.start();

    // Check Out Crons
    const notifyCheckOutSchedule5PM = cron.schedule(
      "00 17 * * *",
      () => {
        notifyCheckOut05PMHandler();
      },
      { timezone: "Asia/Karachi" }
    );
    notifyCheckOutSchedule5PM.start();

    const notifyCheckOutSchedule6PM = cron.schedule(
      "00 18 * * *",
      () => {
        notifyCheckOut6PM();
      },
      { timezone: "Asia/Karachi" }
    );
    notifyCheckOutSchedule6PM.start();

    const notifyCheckOutSchedule7PM = cron.schedule(
      "00 19 * * *",
      () => {
        notifyCheckOut07PMHandler();
      },
      { timezone: "Asia/Karachi" }
    );
    notifyCheckOutSchedule7PM.start();

    // Mark Absent
    const markAbsentSchedule = cron.schedule(
      "00 23 * * *",
      () => {
        markAbsentHandler();
      },
      { timezone: "Asia/Karachi" }
    );
    markAbsentSchedule.start();

    // Mark Weekend
    const markWeekendSchedule = cron.schedule(
      "30 23 * * 6,0",
      () => {
        markWeekendHandler();
      },
      { timezone: "Asia/Karachi" }
    );
    markWeekendSchedule.start();

    //  meeting reminders
    const meetingReminder = cron.schedule(
      "00 18 * * *",
      () => {
        meetingReminderHandler();
      },
      { timezone: "Asia/Karachi" }
    );
    meetingReminder.start();

    const workAnniversary = cron.schedule(
      "00 11 * * *",
      () => {
        workAnniversaryHandler();
      },
      { timezone: "Asia/Karachi" }
    );
    workAnniversary.start();

    const birthday = cron.schedule(
      "00 11 * * *",
      () => {
        birthdayHandler();
      },
      { timezone: "Asia/Karachi" }
    );
    birthday.start();
  } catch (err: any) {
    console.error("❌ Cron job initialization failed:", err.message);
  }
}
