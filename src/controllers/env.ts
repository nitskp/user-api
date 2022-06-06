import dotenv, { config } from "dotenv";

dotenv.config();

export const env: (varName: "PORT" | "DATABASE_URL"| "SECRET_KEY") => any = (varName) => {
  return process.env[varName];
};
