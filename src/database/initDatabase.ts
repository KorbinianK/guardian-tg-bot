import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

export const initDatabase = async (): Promise<Database> => {
    const dbPath = './data/database.sqlite';

    // Ensure the data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.info(`Created directory: ${dataDir}`);
    } else {
        console.info(`Directory already exists: ${dataDir}`);
    }

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            chatId TEXT PRIMARY KEY,
            guardianAddress TEXT NOT NULL
        )
    `);

    return db;
};