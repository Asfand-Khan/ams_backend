export const getNotificationTemplate = (
  title: string,
  username: string,
  type: string,
  message: string,
  priority: string,
  sent_at: string,
  year: string = "2025"
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0; padding: 0;
      background-color: #f4f4f4;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #004aad;
      color: #fff;
      padding: 16px 24px;
      font-size: 20px;
      font-weight: bold;
    }
    .content {
      padding: 20px 24px;
      font-size: 15px;
      line-height: 1.5;
    }
    .message {
      background-color: #f9f9f9;
      border-left: 4px solid #004aad;
      padding: 12px 16px;
      margin-top: 10px;
      font-style: italic;
    }
    .footer {
      background-color: #f4f4f4;
      padding: 12px 24px;
      font-size: 12px;
      text-align: center;
      color: #777;
    }
    .priority-high {
      color: #d93025;
      font-weight: bold;
    }
    .priority-medium {
      color: #e67e22;
      font-weight: bold;
    }
    .priority-low {
      color: #2e7d32;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${title}</div>
    <div class="content">
      <p>Hello ${username},</p>
      <p>You have a new <strong>${type}</strong> notification.</p>
      <div class="message">
        ${message}
      </div>
      <p>Priority: 
        <span class="priority-${priority}">
          ${priority}
        </span>
      </p>
      <p>Sent at: ${sent_at}</p>
    </div>
    <div class="footer">
      &copy; ${year} Orio. All rights reserved.
    </div>
  </div>
</body>
</html>`;
