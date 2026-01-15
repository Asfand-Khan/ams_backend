const Zkteco = require("zkteco-js");

// Replace with your device details
const DEVICE_IP = "192.168.18.80";
const PORT = 4370;
const INPORT = 5200;
const TIMEOUT = 60000;

export async function testZkteco() {
  const device = new Zkteco(DEVICE_IP, PORT, INPORT, TIMEOUT);

  try {
    await device.createSocket();
    // await device.clearAttendanceLog();

    // console.log("✅ All attendance logs deleted successfully!");
    // const userIdsToDelete = [22];

    // for (const uid of userIdsToDelete) {
    //   try {
    //     await device.deleteUser(uid);
    //     console.log(`✅ User deleted: UID ${uid}`);
    //   } catch (e) {
    //     console.error(`❌ Failed to delete UID ${uid}`);
    //   }
    // }
    // Get users

// //  // Add new user
// await device.setUser(
//   50,                    // uid: choose a unique number not used by any existing user
//   "8",                  // userID: unique ID for this user
//   "Muhammad Zain Ul Abidin",          // name
//   "",                    // password (keep empty if not required)
//   0,                     // role (0 = user, 14 = admin, etc.)
//   0                      // cardno (if using card, put card number, else 0)
// );

// console.log("New user 'Syeda Khadija Naqvi' added successfully");
    // Get attendance logs
    const attendanceResponse = await device.getAttendances();
    const attendance = attendanceResponse.data || []; 

    // Get today's date in local time
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const userLogsToday = attendance.filter((a: any) => {
      const logDate = new Date(a.record_time);
      return (
        a.user_id === "27" ||  a.user_id === "27" &&
        logDate.getDate() === todayDay &&
        logDate.getMonth() === todayMonth &&
        logDate.getFullYear() === todayYear
      );
    });

    console.log("Today's Attendance logs for user 44:", userLogsToday);

    
//     const users = await device.getUsers();
//     // console.log("Users:", users);
// interface ZkUser {
//   uid: number;
//   userId: string;
//   name: string;
//   role: number;
//   cardno: number;
//   password: string;
// }

// if (users && users.data && users.data.length > 0) {
//   console.table(
//     users.data.map((user: ZkUser) => ({
//       UID: user.uid,
//       UserID: user.userId,
//       Name: user.name || "<empty>",
//       Role: user.role,
//       Password: user.password,
//       CardNo: user.cardno
//     }))
//   );
// } else {
//   console.log("No users found on the device.");
// }
    // await device.clearAttendanceLog();

    await device.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

testZkteco();
