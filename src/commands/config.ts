import { UserService } from '../services/userService';
import { BotMessage, BotInstance } from '../types';

export const configCommand = async (msg: BotMessage, userService: UserService, bot: BotInstance) => {
    const chatId = msg.chat.id.toString();
    const user = await userService.getUser(chatId);

    if (!user) {
        bot.sendMessage(chatId, 'Please set your guardian address first using /address <your_address>.');
        return;
    }

    bot.sendMessage(chatId, `Your guardian address is ${user.guardianAddress}.`);
};
