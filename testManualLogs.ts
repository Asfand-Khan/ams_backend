// import {testZkteco } from "./src/services/manualLogs";

// async function main() {
//   await testZkteco();
// }

// main().then(() => console.log("Users fetch complete!"));


import {fetchAttendance,syncFingerprintLogs } from "./src/services/attendanceFingerprintService";

async function main() {
  await syncFingerprintLogs({
    startDate: "2026-01-08T00:00:00",
    endDate: "2026-01-13T23:59:59",
  });
}

main().then(() => console.log("Users fetch complete!"));

