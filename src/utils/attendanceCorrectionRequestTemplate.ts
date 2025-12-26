export const getAttendanceCorrectionRequestTemplate = ({
  status,
  id,
  full_name,
  request_type,
  attendance_date,
  reason,
  requested_check_in,
  requested_check_out,
  original_check_in,
  original_check_out,
  created_at,
  year = "2025",
}: {
  status: "pending" | "approved" | "rejected";
  id: string;
  full_name: string;
  request_type: string;
  attendance_date: string;
  reason: string;
  requested_check_in: string | null;
  requested_check_out: string | null;
  original_check_in: string | null;
  original_check_out: string | null;
  created_at: string;
  year?: string;
}) => {
  const capitalize = (str: string): string =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const formatRequestType = (type: string): string =>
    type
      .split("_")
      .map((word) => capitalize(word))
      .join(" ");

  const to12Hour = (time: string | null): string => {
    if (!time) return "N/A";

    const trimmed = time.trim();
    if (!trimmed) return "N/A";
    const parts = trimmed.split(":");
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1]?.padStart(2, "0") || "00";
    const seconds = parts[2] ? `:${parts[2]}` : "";

    if (isNaN(hours)) return trimmed;

    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
  };

  const statusText = capitalize(status);
  const statusColor =
    status === "approved"
      ? "#2e7d32"
      : status === "rejected"
      ? "#d93025"
      : "#e67e22"; // pending

  const safe = (str: string | null | undefined): string =>
    str ? str.replace(/\n/g, "<br>") : "N/A";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Attendance Correction Request</title>
</head>

<body style="margin:0; padding:0; background-color:#ecf0f1; font-family: Arial, sans-serif; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ecf0f1">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td bgcolor="#0074fc" align="center" style="padding: 24px;">
              <img src="https://getorio.com/images/png/logo-white.png" width="130" alt="Orio Logo" style="display:block; border:0; margin-bottom: 13px;" />
              <h2 style="margin: 0; color:#fff; font-size:22px;">Attendance Correction Request</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px; font-size:15px; line-height:1.6;">
              <p style="margin:0 0 12px 0;">Dear <strong>${full_name}</strong>,</p>

              <p style="margin:0 0 12px 0;">
                Your attendance correction request for <strong>${attendance_date}</strong> has been 
                <span style="color:${statusColor}; font-weight:bold;">${statusText}</span>.
              </p>

              <!-- Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb" style="margin:16px 0;">
                <tr>
                  <td style="padding:16px;">
                    <table width="100%" cellpadding="8" cellspacing="0" border="0">
                      <tr>
                        <td style="font-weight:bold; width:200px;">Request Type</td>
                        <td>${formatRequestType(request_type)}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">Reason</td>
                        <td>${safe(reason)}</td>
                      </tr>
                      ${
                        requested_check_in
                          ? `
                      <tr>
                        <td style="font-weight:bold;">Requested Check-In</td>
                        <td>${to12Hour(requested_check_in)}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        requested_check_out
                          ? `
                      <tr>
                        <td style="font-weight:bold;">Requested Check-Out</td>
                        <td>${to12Hour(requested_check_out)}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        original_check_in
                          ? `
                      <tr>
                        <td style="font-weight:bold;">Original Check-In</td>
                        <td>${to12Hour(original_check_in)}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        original_check_out
                          ? `
                      <tr>
                        <td style="font-weight:bold;">Original Check-Out</td>
                        <td>${to12Hour(original_check_out)}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="font-weight:bold;">Status</td>
                        <td style="color:${statusColor}; font-weight:bold;">${statusText}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">Submitted On</td>
                       <td>${created_at}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#0074fc" align="center" style="padding:20px; color:#ffffff; font-size:12px;">
              <p style="margin:4px 0;">D-63/1, First Floor Block 4 Gulshan-e-Iqbal</p>
              <p style="margin:4px 0;">Karachi, Sindh Pakistan</p>
              <p style="margin:4px 0;"> &copy; ${new Date().getFullYear()} Orio. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
