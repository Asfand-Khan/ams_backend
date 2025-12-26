export const getForgotPasswordTemplate = (name: string, password: string, year: string = "2025") => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Your Orio Account Password</title>
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
              <h2 style="margin: 0; color:#fff; font-size:22px;">Password Recovery</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px; font-size:15px; line-height:1.6;">
              <p style="margin:0 0 12px 0;">Hi <strong>${name}</strong>,</p>

              <p style="margin:0 0 12px 0;">
                As requested, here is your Orio Connect password:
              </p>

              <!-- Password Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb" style="margin:20px 0; border-radius:8px;">
                <tr>
                  <td align="center" style="padding:28px; font-size:28px; font-weight:bold; color:#d93025; letter-spacing:5px;">
                    ${password}
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 12px 0; color:#d93025; font-weight:bold;">
                ⚠️ Important: For your security, please change this password immediately after logging in.
              </p>

              <p style="margin:0 0 12px 0;">
                We recommend choosing a strong, unique password.
              </p>
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