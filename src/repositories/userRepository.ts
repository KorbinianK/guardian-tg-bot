import { Database } from 'sqlite';
import { User } from '../entities/users';

export class UserRepository {
    constructor(private db: Database) { }

    async addUser(user: User): Promise<void> {
        await this.db.run(
            'INSERT INTO users (chatId, guardianAddress) VALUES (?, ?)',
            user.chatId, user.guardianAddress
        );
    }

    async getUser(chatId: string): Promise<User | null> {
        const row = await this.db.get('SELECT * FROM users WHERE chatId = ?', chatId);
        return row ? new User(row.chatId, row.guardianAddress) : null;
    }

    async updateUser(user: User): Promise<void> {
        await this.db.run(
            'UPDATE users SET guardianAddress = ? WHERE chatId = ?',
            user.guardianAddress, user.chatId
        );
    }

    async deleteUser(chatId: string): Promise<void> {
        await this.db.run('DELETE FROM users WHERE chatId = ?', chatId);
    }

    async getAllUsers(): Promise<User[]> {
        const rows = await this.db.all('SELECT * FROM users');
        return rows.map(row => new User(row.chatId, row.guardianAddress));
    }
}
