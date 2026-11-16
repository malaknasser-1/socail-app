import dotenv from "dotenv";
dotenv.config();

const required = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env variable: ${key}`);
  return v;
};

export const env = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: required("MONGO_URI"),
  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessExpiresSeconds: Number(process.env.ACCESS_EXPIRES_SECONDS ?? 900),
    refreshExpiresDays: Number(process.env.REFRESH_EXPIRES_DAYS ?? 7),
  },
  mail: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.MAIL_FROM ?? "no-reply@socialapp.com",
  },
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
};
