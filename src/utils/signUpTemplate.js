"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignUpTemplate = void 0;
const getSignUpTemplate = (full_name, username, password, appLink) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      text-align: justify !important;
      font-family: Arial, sans-serif;
    }
  </style>
</head>
<body>
  <div style="margin: auto">
    <div style="width: 600px; margin: 0px auto">
      <div style="text-align: center; margin: 20px 0px; background-color: #FFFFFF; border: 1px solid #0074FC;">
        <img
          src="https://getorio.com/images/svg/logo.svg"
          alt="Orio Logo"
          style="width: 160px"
        />
      </div>
      <div>
        <h2 style="font-size: 24px; color: #021527; font-weight: 700; text-align: center;">
          Welcome to Orio!
        </h2>
        <div style="font-size: 16px; font-weight: 400; color: #354452">
          Hi <b><span style="color: #0074FC;">${full_name}</span></b>,
          <p>
            Welcome to Orio! We're thrilled to have you on board.
          </p>
          <p>
            Your account has been successfully created. Please find your account details below:
          </p>
          <ul style="list-style: none; padding-left: 0;">
            <li><b>Username:</b> ${username}</li>
            <li><b>Password:</b> ${password}</li>
          </ul>
          <p>
            You can access the Orio App using the link below:
            <br/>
            <a href="${appLink}" style="color: #0074FC;">${appLink}</a>
          </p>
          <p>
            If you have any questions or need assistance, feel free to reach out to our support team.
          </p>
          <div style="padding: 5px 0px;">Best regards,</div>
          <div>Team Orio</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
exports.getSignUpTemplate = getSignUpTemplate;
