export const getAttendanceCorrectionRequestTemplate = ({
  status,
  id,
  request_type,
  attendance_date,
  reason,
  requested_check_in,
  requested_check_out,
  original_check_in,
  original_check_out,
  created_at,
  year,
}: {
  status: string;
  id: string;
  attendance_date: string;
  request_type: string;
  reason: string;
  requested_check_in: string | null;
  requested_check_out: string | null;
  original_check_in: string | null;
  original_check_out: string | null;
  created_at: string;
  year: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attendance Correction Request Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 10px 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #007bff;
            font-size: 24px;
            margin-top: 0;
        }
        .content p {
            margin: 10px 0;
        }
        .status-approved {
            border-left: 5px solid #28a745;
            padding-left: 15px;
        }
        .status-pending {
            border-left: 5px solid #ffc107;
            padding-left: 15px;
        }
        .status-rejected {
            border-left: 5px solid #dc3545;
            padding-left: 15px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .details-table th, .details-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .details-table th {
            background-color: #f8f9fa;
            color: #333;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            margin-top: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Attendance Correction Request</h1>
        </div>
        <div class="content status-${status}">
            <h2>Request #${id} - ${status}</h2>
            <p>Dear Employee,</p>
            <p>Your attendance correction request for <strong>${attendance_date}</strong> is under review. Below are the details of your request:</p>
            <table class="details-table">
                <tr>
                    <th>Request Type</th>
                    <td>${request_type}</td>
                </tr>
                <tr>
                    <th>Reason</th>
                    <td>${reason}</td>
                </tr>
                <tr>
                    <th>Requested Check-In</th>
                    <td>${requested_check_in || "N/A"}</td>
                </tr>
                <tr>
                    <th>Requested Check-Out</th>
                    <td>${requested_check_out || "N/A"}</td>
                </tr>
                <tr>
                    <th>Original Check-In</th>
                    <td>${original_check_in || "N/A"}</td>
                </tr>
                <tr>
                    <th>Original Check-Out</th>
                    <td>${original_check_out || "N/A"}</td>
                </tr>
                <tr>
                    <th>Status</th>
                    <td>${status}</td>
                </tr>
            </table>
            <p><strong>Submitted On:</strong> ${created_at}</p>
        </div>
       <div class="footer">
      &copy; ${year} Your Company. All rights reserved.
    </div>
    </div>
</body>
</html>`;

export const getAttendanceCorrectionApproveTemplate = ({
  status,
  id,
  request_type,
  attendance_date,
  reason,
  requested_check_in,
  requested_check_out,
  original_check_in,
  original_check_out,
  created_at,
  year,
  fullname,
}: {
  status: string;
  id: string;
  attendance_date: string;
  request_type: string;
  reason: string;
  requested_check_in: string | null;
  requested_check_out: string | null;
  original_check_in: string | null;
  original_check_out: string | null;
  created_at: string;
  year: string;
  fullname: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attendance Correction Request Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 10px 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #007bff;
            font-size: 24px;
            margin-top: 0;
        }
        .content p {
            margin: 10px 0;
        }
        .status-approved {
            border-left: 5px solid #28a745;
            padding-left: 15px;
        }
        .status-pending {
            border-left: 5px solid #ffc107;
            padding-left: 15px;
        }
        .status-rejected {
            border-left: 5px solid #dc3545;
            padding-left: 15px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .details-table th, .details-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .details-table th {
            background-color: #f8f9fa;
            color: #333;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            margin-top: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Attendance Correction Request</h1>
        </div>
        <div class="content status-${status}">
            <h2>REQUEST #${id} - ${status.toUpperCase()}</h2>
            <p>Dear ${fullname.toUpperCase()},</p>
            <p>Your attendance correction request for <strong>${attendance_date}</strong> has been ${status.toLowerCase()}. Below are the details of your request:</p>
            <table class="details-table">
                <tr>
                    <th>Request Type</th>
                    <td>${request_type}</td>
                </tr>
                <tr>
                    <th>Reason</th>
                    <td>${reason}</td>
                </tr>
                <tr>
                    <th>Requested Check-In</th>
                    <td>${requested_check_in || "N/A"}</td>
                </tr>
                <tr>
                    <th>Requested Check-Out</th>
                    <td>${requested_check_out || "N/A"}</td>
                </tr>
                <tr>
                    <th>Original Check-In</th>
                    <td>${original_check_in || "N/A"}</td>
                </tr>
                <tr>
                    <th>Original Check-Out</th>
                    <td>${original_check_out || "N/A"}</td>
                </tr>
                <tr>
                    <th>Status</th>
                    <td>${status}</td>
                </tr>
            </table>
            <p><strong>Submitted On:</strong> ${created_at}</p>
        </div>
       <div class="footer">
      &copy; ${year} Orio. All rights reserved.
    </div>
    </div>
</body>
</html>`;
