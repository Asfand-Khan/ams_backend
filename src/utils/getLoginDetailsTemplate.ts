export const getLoginDetailsTemplate = (
  username: string,
  password: string,
  appLink: string,
  otp: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Orio Attendance App</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f9fc;
      color: #333;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      max-width: 600px;
      margin: 0 auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .otp {
      font-size: 28px;
      font-weight: bold;
      color: #2e86de;
      margin: 20px 0;
      letter-spacing: 6px;
    }
    .footer {
      font-size: 12px;
      color: #999;
      margin-top: 30px;
    }
    .brand {
      color: #2e86de;
      font-weight: bold;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: #2e86de;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Welcome to Orio Attendance App</h2>
    
    <p>Dear Team,</p>
    
    <p>We are pleased to announce that we have launched our new <strong>Orio Attendance App</strong>. Please follow the steps below to get started:</p>
    
    <ol>
      <li><strong>Download the app</strong> using the link below.</li>
      <li><strong>Login using your credentials</strong> and verify using the OTP.</li>
    </ol>
    
    <a href="${appLink}" class="btn" target="_blank">Download App</a>
    
    <p><strong>User ID:</strong> ${username}<br>
    <strong>Password:</strong> ${password}<br>
    <strong>OTP:</strong> <span class="otp">${otp}</span></p>

    <p>Regards,<br>
    <span class="brand">Orio Technologies</span> Team</p>
    
    <div class="footer">
      © 2025 Orio Technologies. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
