"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    // Optional: Verify connection before sending
    transporter.verify((error, success) => {
        if (error) {
            console.error("SMTP connection failed:", error);
        }
        else {
            console.log("SMTP connection established successfully");
        }
    });
    const mailOptions = {
        from: `"${options.fromName || "Orio Attendance"}" <${process.env.SMTP_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        bcc: options.bcc || undefined,
        cc: options.cc || undefined,
        attachments: options.attachments || undefined,
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        return info;
    }
    catch (error) {
        throw new Error(`Email send error: ${JSON.stringify(error)}`);
    }
});
exports.sendEmail = sendEmail;
