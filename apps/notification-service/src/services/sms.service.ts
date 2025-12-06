import { Logger } from "winston";
import twilio from "twilio";

export interface NotificationData {
  recipient: string;
  content: string;
}

export const createSmsService = (logger: Logger) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  let client: twilio.Twilio | null = null;

  if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
  } else {
    logger.warn(
      "Twilio credentials not provided. SMS service will be disabled."
    );
  }

  const sendSms = async (notification: NotificationData) => {
    try {
      if (!client) {
        logger.warn("SMS service is disabled. Skipping SMS send.");
        return { sid: "disabled", status: "skipped" };
      }

      const result = await client.messages.create({
        body: notification.content,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: notification.recipient,
      });

      logger.info(`SMS sent successfully: ${result.sid}`);
      return result;
    } catch (error) {
      logger.error("Error sending SMS:", error);
      throw error;
    }
  };

  return { sendSms };
};
