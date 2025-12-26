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
  start_time: string; // ISO string
  end_time: string; // ISO string
  location_type: string;
  location_details: string;
  agenda?: string;
  instance_date?: string; // YYYY-MM-DD or ISO
  created_by_name?: string;
  created_by_email?: string;
  created_at?: string; // ISO
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
    created_at,
    attendees_list_html,
    attendees_status_html,
    minutes,
    year = "2025",
  } = params;

  const capitalize = (str: string): string =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  // YYYY-MM-DD or ISO → DD-Month-YYYY (e.g., 26-December-2025)
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "Not provided";
    try {
      const date = new Date(dateStr);
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
      return `${date.getDate()}-${
        months[date.getMonth()]
      }-${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // ISO → e.g., 2:30 PM
  const formatTime = (time: string): string => {
    if (!time || time.trim() === "" || time === "Invalid Date") {
      return "Not specified";
    }

    // Assume time is in "HH:MM:SS" format (24-hour)
    const match = time.match(/^(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) {
      return "Invalid time";
    }

    let hours = parseInt(match[1], 10);
    const minutes = match[2];

    if (isNaN(hours) || hours < 0 || hours > 23) {
      return "Invalid time";
    }

    const period = hours >= 12 ? "PM" : "AM";
    if (hours === 0) hours = 12;
    if (hours > 12) hours -= 12;

    return `${hours}:${minutes} ${period}`;
  };

  const safe = (str: string | undefined): string =>
    str ? str.replace(/\n/g, "<br>") : "Not provided";

  // Header title based on template type
  const headerTitles: Record<MeetingTemplateType, string> = {
    creation: "New Meeting Scheduled",
    "nightly-reminder": "Upcoming Meeting Reminder",
    "one-hour-reminder": "Meeting Starting Soon",
    "minutes-published": "Meeting Minutes Published",
  };

  const headerTitle = headerTitles[templateType];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${headerTitle}</title>
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
              <h2 style="margin: 0; color:#fff; font-size:22px;">${headerTitle}</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px; font-size:15px; line-height:1.6;">
              <p style="margin:0 0 12px 0;">Dear <strong>${employee_name}</strong>,</p>

              ${
                templateType === "creation"
                  ? `
              <p style="margin:0 0 12px 0;">
                A new ${capitalize(
                  recurrence_type
                )} meeting has been scheduled by <strong>${host_name}</strong>.
              </p>`
                  : ""
              }

              ${
                templateType === "nightly-reminder"
                  ? `
              <p style="margin:0 0 12px 0;">
                This is a reminder for your ${capitalize(
                  recurrence_type
                )} meeting scheduled for tomorrow.
              </p>`
                  : ""
              }

              ${
                templateType === "one-hour-reminder"
                  ? `
              <p style="margin:0 0 12px 0;">
                Your meeting is starting in one hour. Please be ready to join.
              </p>`
                  : ""
              }

              ${
                templateType === "minutes-published"
                  ? `
              <p style="margin:0 0 12px 0;">
                The minutes for the meeting held on <strong>${formatDate(
                  instance_date
                )}</strong> have been published.
              </p>`
                  : ""
              }

              <p style="margin:0 0 12px 0; font-size:18px; font-weight:bold;">
                ${title}
              </p>

              <!-- Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb" style="margin:16px 0;">
                <tr>
                  <td style="padding:16px;">
                    <table width="100%" cellpadding="8" cellspacing="0" border="0">
                      <tr>
                        <td style="font-weight:bold; width:180px;">Meeting Title</td>
                        <td>${title}</td>
                      </tr>
                      ${
                        instance_date
                          ? `
                      <tr>
                        <td style="font-weight:bold;">Date</td>
                        <td>${formatDate(instance_date)}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="font-weight:bold;">Time</td>
                        <td>${formatTime(start_time)} - ${formatTime(
    end_time
  )}</td>
                      </tr>
                      ${
                        templateType === "creation"
                          ? `
                      <tr>
                        <td style="font-weight:bold;">Recurrence</td>
                        <td>${capitalize(recurrence_rule)}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="font-weight:bold;">Location</td>
                        <td>${capitalize(location_type)}: ${safe(
    location_details
  )}</td>
                      </tr>
      
                      ${
                        created_by_name &&
                        created_at &&
                        templateType === "minutes-published"
                          ? `
                      <tr>
                        <td style="font-weight:bold;">Minutes Published By</td>
                        <td>${created_by_name}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">Published On</td>
                        <td>${formatDate(created_at)}</td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>
              ${
                minutes
                  ? `
              <!-- Minutes Section -->
              <p style="margin:24px 0 8px 0; font-weight:bold;">Meeting Minutes:</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb">
                <tr>
                  <td style="padding:16px;">
                    ${safe(minutes)}
                  </td>
                </tr>
              </table>`
                  : ""
              }
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
