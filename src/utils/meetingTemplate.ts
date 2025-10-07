export type MeetingTemplateType =
  | "creation"
  | "nightly-reminder"
  | "one-hour-reminder"
  | "minutes-published";

export interface MeetingTemplateParams {
  employee_name: string;
  meeting_id: string;
  title: string;
  recurrence_type: string;
  recurrence_rule: string;
  host_name: string;
  host_email: string;
  start_time: string;
  end_time: string;
  location_type: string;
  location_details: string;
  agenda?: string;
  instance_date?: string;
  created_by_name?: string;
  created_by_email?: string;
  created_at?: string;
  attendees_list_html: string;
  attendees_status_html?: string;
  minutes?: string;
  year?: string;
}

export const getMeetingTemplate = (
  templateType: MeetingTemplateType,
  params: MeetingTemplateParams
): string => {
  const {
    employee_name,
    meeting_id,
    title,
    recurrence_type,
    recurrence_rule,
    host_name,
    host_email,
    start_time,
    end_time,
    location_type,
    location_details,
    agenda,
    instance_date,
    created_by_name,
    created_by_email,
    created_at,
    attendees_list_html,
    attendees_status_html,
    minutes,
    year = new Date().getFullYear().toString(),
  } = params;

  const capitalize = (str: string): string =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
  const formatTime = (time: string): string => {
    try {
      const date = new Date(time);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return time; // Fallback to raw input if parsing fails
    }
  };
  const formatDate = (date: string): string => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return date; // Fallback to raw input if parsing fails
    }
  };
  const safeHtml = (content: string | undefined): string =>
    content ? content.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

  const baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333333;
    }
    .container {
      max-width: 720px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    }
    .header {
      background-color: #0074fc;
      color: #ffffff;
      padding: 25px;
      text-align: center;
      border-bottom: 5px solid #0074fc;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 35px;
    }
    .content h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 20px;
      color: #0074fc;
    }
    .content p {
      margin: 0 0 15px;
      font-size: 16px;
      color: #444444;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 15px;
    }
    .details-table th, .details-table td {
      border: 1px solid #e0e0e0;
      padding: 15px;
      text-align: left;
    }
    .details-table th {
      background-color: #f8f9fa;
      color: #333333;
      font-weight: 600;
    }
    .details-table td {
      color: #555555;
    }
    .attendee-table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 15px;
    }
    .attendee-table th, .attendee-table td {
      border: 1px solid #e0e0e0;
      padding: 12px;
      text-align: left;
    }
    .attendee-table th {
      background-color: #f8f9fa;
      color: #333333;
      font-weight: 600;
    }
    .attendee-table td.attended {
      color: #28a745;
      font-weight: 500;
    }
    .attendee-table td.not-attended {
      color: #dc3545;
      font-weight: 500;
    }
    .minutes-section {
      margin-top: 25px;
      padding: 20px;
      background-color: #f9fafb;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
    }
    .minutes-section h3 {
      font-size: 20px;
      margin: 0 0 15px;
      color: #333333;
      font-weight: 600;
    }
    .minutes-section p {
      font-size: 15px;
      color: #444444;
    }
    .footer {
      text-align: center;
      padding: 25px;
      font-size: 13px;
      color: #666666;
      background-color: #f8f9fa;
      border-top: 1px solid #e0e0e0;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #0052cc;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      margin-top: 25px;
    }
    .button:hover {
      background-color: #0074fc;
    }
    .status-missed .content {
      border-left: 8px solid #dc3545;
    }
    .status-missed h2 {
      color: #dc3545;
    }
    .status-missed .button {
      background-color: #dc3545;
    }
    .status-missed .button:hover {
      background-color: #c82333;
    }
    .greeting {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 20px;
    }
    .signature {
      margin-top: 30px;
      font-size: 14px;
      color: #666666;
    }
    .signature p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
`;

  // Template definitions
  const templates: Record<MeetingTemplateType, string> = {
    creation: `
      <div class="container">
        <div class="header">
          <h1>New Meeting Scheduled</h1>
        </div>
        <div class="content">
          <p class="greeting">Dear ${safeHtml(employee_name)},</p>
          <h2>${safeHtml(title)}</h2>
          <p>A new ${capitalize(
            recurrence_type
          )} meeting has been scheduled by <strong>${safeHtml(
      host_name
    )}</strong>. Please review the details below and confirm your attendance.</p>
          <table class="details-table">
            <tr><th>Meeting Title</th><td>${safeHtml(title)}</td></tr>
            <tr><th>Time</th><td>${start_time} - ${end_time} (PKT)</td></tr>
            <tr><th>Day</th><td>${capitalize(recurrence_rule)}</td></tr>
            <tr><th>Location</th><td>${capitalize(location_type)}: ${safeHtml(
      location_details
    )}</td></tr>
            ${
              agenda
                ? `<tr><th>Agenda</th><td>${safeHtml(agenda)}</td></tr>`
                : ""
            }
            <tr><th>Host</th><td>${safeHtml(host_name)}</td></tr>
          </table>
          <table class="attendee-table">
            <tr><th>Invited Attendees</th></tr>
            ${attendees_list_html}
          </table>
        </div>
        <div class="footer">
          &copy; ${year} Orio. All rights reserved.
        </div>
      </div>
    `,
    "nightly-reminder": `
      <div class="container">
        <div class="header">
          <h1>Upcoming Meeting Reminder</h1>
        </div>
        <div class="content">
          <p class="greeting">Dear ${safeHtml(employee_name)},</p>
          <h2>${safeHtml(title)} (Tomorrow)</h2>
          <p>This is a reminder for your ${capitalize(
            recurrence_type
          )} meeting scheduled for tomorrow, hosted by <strong>${safeHtml(
      host_name
    )}</strong>. Please ensure you are prepared to join.</p>
          <table class="details-table">
            <tr><th>Meeting Title</th><td>${safeHtml(title)}</td></tr>
            <tr><th>Date</th><td>${formatDate(instance_date!)}</td></tr>
            <tr><th>Time</th><td>${formatTime(start_time)} - ${formatTime(
      end_time
    )} (PKT)</td></tr>
            <tr><th>Location</th><td>${capitalize(location_type)}: ${safeHtml(
      location_details
    )}</td></tr>
            ${
              agenda
                ? `<tr><th>Agenda</th><td>${safeHtml(agenda)}</td></tr>`
                : ""
            }
            <tr><th>Host</th><td>${safeHtml(host_name)} (${safeHtml(
      host_email
    )})</td></tr>
          </table>
          <table class="attendee-table">
            <tr><th>Invited Attendees</th></tr>
            ${attendees_list_html}
          </table>
        </div>
        <div class="footer">
          &copy; ${year} Orio. All rights reserved.
        </div>
      </div>
    `,
    "one-hour-reminder": `
      <div class="container">
        <div class="header">
          <h1>Meeting Starting in 1 Hour</h1>
        </div>
        <div class="content">
          <p class="greeting">Dear ${safeHtml(employee_name)},</p>
          <h2>${safeHtml(title)}</h2>
          <p>Your ${capitalize(recurrence_type)} meeting <strong>${safeHtml(
      title
    )}</strong> is scheduled to start in one hour. Please ensure you are ready to join promptly.</p>
          <table class="details-table">
            <tr><th>Meeting Title</th><td>${safeHtml(title)}</td></tr>
            <tr><th>Date</th><td>${formatDate(instance_date!)}</td></tr>
            <tr><th>Time</th><td>${formatTime(start_time)} - ${formatTime(
      end_time
    )} (PKT)</td></tr>
            <tr><th>Location</th><td>${capitalize(location_type)}: ${safeHtml(
      location_details
    )}</td></tr>
            ${
              agenda
                ? `<tr><th>Agenda</th><td>${safeHtml(agenda)}</td></tr>`
                : ""
            }
            <tr><th>Host</th><td>${safeHtml(host_name)} (${safeHtml(
      host_email
    )})</td></tr>
          </table>
          <table class="attendee-table">
            <tr><th>Invited Attendees</th></tr>
            ${attendees_list_html}
          </table>
        </div>
        <div class="footer">
          &copy; ${year} Orio. All rights reserved.
        </div>
      </div>
    `,
    "minutes-published": `
      <div class="container">
        <div class="header">
          <h1>Meeting Minutes Published</h1>
        </div>
        <div class="content">
          <p class="greeting">Dear ${safeHtml(employee_name)},</p>
          <h2>${safeHtml(title)}</h2>
          <p>The minutes for the ${capitalize(
            recurrence_type
          )} meeting <strong>${safeHtml(
      title
    )}</strong>, held on <strong>${formatDate(
      instance_date!
    )}</strong>. Please review the details and minutes below.</p>
          <table class="details-table">
            <tr><th>Meeting Title</th><td>${safeHtml(title)}</td></tr>
            <tr><th>Date</th><td>${formatDate(instance_date!)}</td></tr>
            <tr><th>Time</th><td>${start_time} - ${end_time} (PKT)</td></tr>
            <tr><th>Location</th><td>${capitalize(location_type)}: ${safeHtml(
      location_details
    )}</td></tr>
            <tr><th>Host</th><td>${safeHtml(host_name)}</td></tr>
            <tr><th>Minutes Published By</th><td>${safeHtml(
              created_by_name!
            )}</td></tr>
            <tr><th>Published On</th><td>${formatDate(
              created_at!
            )} ${formatTime(created_at!)}</td></tr>
          </table>
          // <table class="attendee-table">
          //   <tr><th>Attendee</th><th>Attendance Status</th></tr>
          //   ${attendees_status_html || attendees_list_html}
          // </table>
          ${
            minutes
              ? `
          <div class="minutes-section">
            <h3>Meeting Minutes</h3>
            <div>${minutes}</div>
          </div>`
              : ""
          }
        </div>
        <div class="footer">
          &copy; ${year} Orio. All rights reserved.
        </div>
      </div>
    `,
  };

  // Validate required parameters
  const requiredFields: (keyof MeetingTemplateParams)[] = [
    "employee_name",
    "meeting_id",
    "title",
    "recurrence_type",
    "host_name",
    "host_email",
    "start_time",
    "end_time",
    "location_type",
    "location_details",
    "attendees_list_html",
  ];
  const missingFields = requiredFields.filter((field) => !params[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Additional validation for specific templates
  if (
    templateType === "nightly-reminder" ||
    templateType === "one-hour-reminder"
  ) {
    if (!instance_date) {
      throw new Error(
        `Missing required field: instance_date for ${templateType}`
      );
    }
  }
  if (templateType === "minutes-published") {
    if (
      !instance_date ||
      !created_by_name ||
      !created_by_email ||
      !created_at
    ) {
      throw new Error(
        `Missing required fields for minutes-published: instance_date, created_by_name, created_by_email, created_at`
      );
    }
  }

  // Return the complete HTML
  return `${baseTemplate}${templates[templateType]}</body></html>`;
};
