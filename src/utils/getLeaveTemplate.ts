export const getLeaveTemplate = ({
  status,
  applied_on,
  name,
  leave_type_name,
  reason,
  start_date,
  end_date,
  total_days,
  remarks,
  approved_by_name,
  approved_on,
  id,
}: {
  status: string;
  applied_on: string;
  name: string;
  leave_type_name: string;
  reason: string;
  start_date: string;
  end_date: string;
  total_days: string;
  remarks: string;
  approved_on: string;
  id: string;
  approved_by_name: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leave Request Notification</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f6f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 640px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #0052cc;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-bottom: 4px solid #003087;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .content h2 {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 15px;
        }
        .content p {
            margin: 0 0 10px;
            font-size: 14px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }
        .details-table th, .details-table td {
            border: 1px solid #e0e0e0;
            padding: 12px;
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
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666666;
            background-color: #f8f9fa;
            border-top: 1px solid #e0e0e0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0052cc;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            margin-top: 20px;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #003087;
        }
        .status-approved .content {
            border-left: 6px solid #28a745;
        }
        .status-approved h2 {
            color: #28a745;
        }
        .status-approved .button {
            background-color: #28a745;
        }
        .status-approved .button:hover {
            background-color: #218838;
        }
        .status-rejected .content {
            border-left: 6px solid #dc3545;
        }
        .status-rejected h2 {
            color: #dc3545;
        }
        .status-rejected .button {
            background-color: #dc3545;
        }
        .status-rejected .button:hover {
            background-color: #c82333;
        }
        .status-pending .content {
            border-left: 6px solid #0052cc;
        }
        .status-pending h2 {
            color: #0052cc;
        }
        .status-pending .button {
            background-color: #0052cc;
        }
        .status-pending .button:hover {
            background-color: #003087;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Leave Request Notification</h1>
        </div>
        <div class="content status-${status}">
            <h2>Request #${id} - ${status.toUpperCase()}</h2>

            <p>A leave request for Employee Name <strong>${name.toUpperCase()}</strong> has been  ${status}  <strong>${applied_on}</strong>. Please find the details below:</p>
            <table class="details-table">
                <tr>
                    <th>Leave Type</th>
                    <td>${leave_type_name}</td>
                </tr>
                <tr>
                    <th>Reason</th>
                    <td>${reason || "Not provided"}</td>
                </tr>
                <tr>
                    <th>Start Date</th>
                    <td>${start_date}</td>
                </tr>
                <tr>
                    <th>End Date</th>
                    <td>${end_date}</td>
                </tr>
                <tr>
                    <th>Total Days</th>
                    <td>${total_days}</td>
                </tr>
                <tr>
                    <th>Status</th>
                    <td>${status}</td>
                </tr>
                <tr>
                    <th>Remarks</th>
                    <td>${remarks || "None"}</td>
                </tr>
                <tr>
                    <th>Reviewed By</th>
                    <td>${approved_by_name || "Not yet reviewed"}</td>
                </tr>
                <tr>
                    <th>Reviewed On</th>
                    <td>${approved_on || "Not yet reviewed"}</td>
                </tr>
            </table>
            <p><strong>Applied On:</strong> ${applied_on}</p>
        </div>
       <div class="footer">
      &copy; ${new Date().getFullYear()} Orio. All rights reserved.
    </div>
    </div>
</body>
</html>`;
