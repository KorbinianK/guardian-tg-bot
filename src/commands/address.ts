import { UserService } from '../services/userService';
import { BotMessage, BotInstance } from '../types';
import { isAddress } from 'viem';

export const addressCommand = async (msg: BotMessage, match: RegExpMatchArray, userService: UserService, bot: BotInstance) => {
    const chatId = msg.chat.id.toString();
    const address = match ? match[1] : '';

    if (address && isAddress(address)) {
        await userService.deleteUser(chatId);
        await userService.addUser(chatId, address);
        bot.sendMessage(chatId, `Guardian address set to ${address}.`);
    } else {
        bot.sendMessage(chatId, 'Please provide a valid guardian address.');
    }
};
