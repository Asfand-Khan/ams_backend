import prisma from "../config/db";
import { getLoginDetailsTemplate } from "../utils/getLoginDetailsTemplate";
import { sendEmail } from "../utils/sendEmail";

interface Employee {
  username: string;
  email: string;
  password: string;
  otp: string;
  link: string;
}

export default async function sendDetails() {
  try {
    const result = (await prisma.$queryRaw`
      SELECT
        username,
        email,
        password_hash AS "password",
        '876543' AS otp,
        'http://orio.digital/orioconnect/orioAttendanceapp.apk' AS link
      FROM
        User;
    `) as Employee[];

    for (const employee of result) {
      try {
        await sendEmail({
          to: employee.email,
          subject: "Orio Connect - Login Details",
          html: getLoginDetailsTemplate(
            employee.username,
            employee.password,
            employee.link,
            employee.otp
          ),
        });
        console.log(`✅ Email sent to: ${employee.email}`);
      } catch (emailError: any) {
        console.error(`❌ Failed to send email to ${employee.email}:`, emailError.message);
        // Optionally log to DB or file here for retry queue
      }
    }

    console.log("📨 All email attempts completed.");
  } catch (err: any) {
    console.error("❌ Failed to retrieve user data:", err.message);
  }
}