export const getLeaveTemplate = ({
  status,
  applied_on,
  name,
  leave_type_name,
  reason,
  start_date,
  end_date,
  total_days,
  remarks = "",
  approved_by_name = "",
  approved_on = "",
  id,
  year = "2025",
}: {
  status: "pending" | "approved" | "rejected";
  applied_on: string; // YYYY-MM-DD
  name: string;
  leave_type_name: string;
  reason: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  total_days: string | number;
  remarks?: string;
  approved_by_name?: string;
  approved_on?: string; // YYYY-MM-DD
  id: string;
  year?: string;
}) => {
  const capitalize = (str: string): string =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  // YYYY-MM-DD → DD Month YYYY (e.g., 2025-12-26 → 26 December 2025)
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "Not provided";

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr; // fallback

    const monthName = months[parseInt(month) - 1];
    return `${parseInt(day)}-${monthName}-${year}`;
  };

  const statusText = capitalize(status);
  const statusColor =
    status === "approved"
      ? "#2e7d32"
      : status === "rejected"
      ? "#d93025"
      : "#e67e22"; // pending

  const safe = (str: string | undefined): string =>
    str ? str.replace(/\n/g, "<br>") : "Not provided";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Leave Request ${statusText}</title>
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
              <h2 style="margin: 0; color:#fff; font-size:22px;">Leave Request - ${statusText}</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px; font-size:15px; line-height:1.6;">
              <p style="margin:0 0 12px 0;">Dear <strong>${name}</strong>,</p>

              <p style="margin:0 0 12px 0;">
                Your leave request has been 
                <span style="color:${statusColor}; font-weight:bold;">${statusText}</span>.
              </p>

              <!-- Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb" style="margin:16px 0;">
                <tr>
                  <td style="padding:16px;">
                    <table width="100%" cellpadding="8" cellspacing="0" border="0">
                      <tr>
                        <td style="font-weight:bold; width:180px;">Leave Type</td>
                        <td>${leave_type_name}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">Reason</td>
                        <td>${safe(reason)}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">Start Date</td>
                        <td>${formatDate(start_date)}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">End Date</td>
                        <td>${formatDate(end_date)}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">Total Days</td>
                        <td>${total_days}</td>
                      </tr>
                      ${
                        remarks
                          ? `
                      <tr>
                        <td style="font-weight:bold;">Remarks</td>
                        <td>${safe(remarks)}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        approved_by_name && approved_on
                          ? `
                      <tr>
                        <td style="font-weight:bold;">${statusText} By</td>
                        <td>${approved_by_name}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">${statusText} On</td>
                        <td>${formatDate(approved_on)}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="font-weight:bold;">Applied On</td>
                        <td>${formatDate(applied_on)}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">Status</td>
                        <td style="color:${statusColor}; font-weight:bold;">${statusText}</td>
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
              <p style="margin:4px 0;">&copy; ${year} Orio. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
