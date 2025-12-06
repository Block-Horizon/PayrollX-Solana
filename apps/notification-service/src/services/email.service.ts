import { Logger } from "winston";
import * as nodemailer from "nodemailer";

export interface NotificationData {
  recipient: string;
  subject: string;
  content: string;
}

export const createEmailService = (logger: Logger) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const sendEmail = async (notification: NotificationData) => {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: notification.recipient,
        subject: notification.subject,
        text: notification.content,
        html: notification.content,
      };

      const result = await transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully: ${result.messageId}`);
      return result;
    } catch (error) {
      logger.error("Error sending email:", error);
      throw error;
    }
  };

  return { sendEmail };
};
