import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const AUTH_BASE_DIR = "./auth";
export const MEDIA_BASE_DIR = "./media";
export const MAX_QR_ATTEMPTS = 3;
export const CONNECTION_TIMEOUT_MS = 60000;
