import { UserRepository } from '../repositories/userRepository';
import { User } from '../entities/users';

export class UserService {
    constructor(private userRepository: UserRepository) { }

    async addUser(chatId: string, guardianAddress: string): Promise<void> {
        const user = new User(chatId, guardianAddress);
        await this.userRepository.addUser(user);
    }

    async getUser(chatId: string): Promise<User | null> {
        return await this.userRepository.getUser(chatId);
    }

    async updateUser(chatId: string, guardianAddress: string): Promise<void> {
        const user = new User(chatId, guardianAddress);
        await this.userRepository.updateUser(user);
    }

    async deleteUser(chatId: string): Promise<void> {
        await this.userRepository.deleteUser(chatId);
    }

    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.getAllUsers();
    }
}
