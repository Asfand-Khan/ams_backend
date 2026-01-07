import {testZkteco } from "./src/services/manualLogs";

async function main() {
  await testZkteco();
}

main().then(() => console.log("Users fetch complete!"));