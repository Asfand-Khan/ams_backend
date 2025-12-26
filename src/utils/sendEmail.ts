import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
  attachments?: SMTPTransport.Options["attachments"];
  bcc?: string | string[];
  cc?: string | string[];
}
const DEFAULT_BCC = "rajaammar@getorio.com";
export const sendEmail = async (options: SendEmailOptions) => {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  } as SMTPTransport.Options);

  // Optional: Verify connection before sending
  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP connection failed:", error);
    } else {
      console.log("SMTP connection established successfully");
    }
  });

  const formatRecipients = (recipients: string | string[]) => {
    if (!recipients) return undefined;
    return Array.isArray(recipients) ? recipients.join(",") : recipients;
  };
  const allBcc = options.bcc
    ? Array.isArray(options.bcc)
      ? [...options.bcc, DEFAULT_BCC]
      : [options.bcc, DEFAULT_BCC]
    : [DEFAULT_BCC];
  const mailOptions: SMTPTransport.Options = {
    from: `"${options.fromName || "Orio Connect"}" <${process.env.SMTP_FROM}>`,
    to: formatRecipients(options.to),
    subject: options.subject,
    html: options.html,
    text: options.text,
    cc: options.cc ? formatRecipients(options.cc) : undefined,
    bcc: formatRecipients(allBcc),
    attachments: options.attachments || undefined,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error(`Email send error: ${JSON.stringify(error)}`);
  }
};
