const capitalize = (str: string): string =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

export const getNotificationTemplate = (
  username: string,
  title: string,
  type: string,
  message: string,
  priority: "low" | "medium" | "high",
  sent_at: string,
  year: string = "2025"
) => {
  const priorityColor =
    priority === "high"
      ? "#d93025"
      : priority === "medium"
      ? "#e67e22"
      : "#2e7d32";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Notification</title>
</head>

<body style="margin:0; padding:0; background-color:#ecf0f1; font-family: Arial, sans-serif; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ecf0f1">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td bgcolor="#0074fc" align="center" style="padding: 24px;">
              <img src="https://jubileegeneral.com.pk/jgi_admin/assets/images/logo.png" width="130" style="display:block; border:0; margin-bottom: 13px;" />
              <h2 style="margin: 0; color:#fff; font-size:22px;">${title}</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px; font-size:15px; line-height:1.6;">
              <p style="margin:0 0 12px 0;">Dear <strong>${username}</strong>,</p>

              <!-- Message Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb">
                <tr>
                  <td style="padding:12px 10px; font-size:15px; line-height:1.6;">
                    ${message.replace(/\n/g, "<br>")}
                  </td>
                </tr>
              </table>

              <!-- Meta Info -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
                <tr>
                  <td style="padding: 5px 0; font-size:14px;">
                    <strong>Type:</strong> ${capitalize(type)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size:14px;">
                    <strong>Sent at:</strong> ${sent_at}
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
