const Zkteco = require("zkteco-js");

// Replace with your device details
const DEVICE_IP = "192.168.18.80";
const PORT = 4370;
const INPORT = 5200;
const TIMEOUT = 5000;

export async function testZkteco() {
  const device = new Zkteco(DEVICE_IP, PORT, INPORT, TIMEOUT);

  try {
    await device.createSocket();

    // Get users
    const users = await device.getUsers();
    console.log("Users:", users);

    // Add / Update a user
    // await device.setUser(
    //   44,            // uid
    //   "44",          // userID
    //   "Raja Ammar", // name
    //   "",           // password
    //   14,            // role
    //   0             // cardno
    // );
    // console.log("User set successfully");

    // Get attendance logs
    // const attendanceResponse = await device.getAttendances();
    // const attendance = attendanceResponse.data || []; 

    // // Get today's date in local time
    // const today = new Date();
    // const todayDay = today.getDate();
    // const todayMonth = today.getMonth();
    // const todayYear = today.getFullYear();

    // const userLogsToday = attendance.filter((a: any) => {
    //   const logDate = new Date(a.record_time);
    //   return (
    //     a.user_id === "44" &&
    //     logDate.getDate() === todayDay &&
    //     logDate.getMonth() === todayMonth &&
    //     logDate.getFullYear() === todayYear
    //   );
    // });

    // console.log("Today's Attendance logs for user 44:", userLogsToday);

    await device.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

testZkteco();
