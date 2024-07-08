import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDatabase() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database,
    });

    // Run migrations
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            chatId TEXT PRIMARY KEY,
            guardianAddress TEXT NOT NULL
        );
    `);

    return db;
}
