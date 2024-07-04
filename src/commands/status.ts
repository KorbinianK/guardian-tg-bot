import { checkHealth } from '../api';
import { BotInstance, BotMessage } from '../types';
import { UserService } from '../services/userService';

export const statusCommand = async (msg: BotMessage, userService: UserService, bot: BotInstance) => {
    const chatId = msg.chat.id.toString();
    const user = await userService.getUser(chatId);

    if (!user) {
        bot.sendMessage(chatId, 'Please set your guardian address first using /address <your_address>.');
        return;
    }

    await checkHealth(chatId, user.guardianAddress, bot, true);
};
