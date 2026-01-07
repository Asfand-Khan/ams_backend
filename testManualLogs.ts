import { syncManualLogs } from "./src/services/manualLogs";

async function main() {
  await syncManualLogs({ startDate: "2026-01-06", endDate: "2026-01-06" });
}

main().then(() => console.log("Test completed"));
