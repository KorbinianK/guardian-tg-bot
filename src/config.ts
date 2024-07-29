import dotenv from 'dotenv';

dotenv.config();

export const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN!;
export const GUARDIAN_API = process.env.GUARDIAN_API!;
export const THRESHOLD_SECONDS = Number(process.env.THRESHOLD_SECONDS) * 1000;
export const RPC_URL = process.env.RPC_URL
export const NETWORK = process.env.NETWORK

if (isNaN(THRESHOLD_SECONDS) || THRESHOLD_SECONDS <= 0) {
    console.error('Invalid THRESHOLD_SECONDS value.');
    process.exit(1);
}
