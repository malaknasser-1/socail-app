import nodemailer from "nodemailer";
import { env } from "../../lib/config/env";

const transporter = env.mail.user
  ? nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      auth: { user: env.mail.user, pass: env.mail.pass },
    })
  : null;

export const sendMail = async (to: string, subject: string, text: string) => {
  
  console.log(`\n[MAIL to ${to}] ${subject}\n${text}\n`);
  if (!transporter) return;
  try {
    await transporter.sendMail({ from: env.mail.from, to, subject, text });
  } catch (e) {
    console.error("Mail sending failed:", (e as Error).message);
  }
};
