import { UserService } from '../services/userService';
import { BotMessage, BotInstance } from '../types';

export const removeCommand = async (msg: BotMessage, userService: UserService, bot: BotInstance) => {
    const chatId = msg.chat.id.toString();
    await userService.deleteUser(chatId);
    bot.sendMessage(chatId, 'Guardian address removed.');
};
