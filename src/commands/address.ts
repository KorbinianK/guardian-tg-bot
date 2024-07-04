import { users } from '../state';

export const addressCommand = (msg: any, match: RegExpMatchArray, bot: any) => {
    const chatId = msg.chat.id.toString();
    const address = match ? match[1] : '';

    if (address) {
        users[chatId] = { chatId, guardianAddress: address };
        bot.sendMessage(chatId, `Guardian address set to ${address}.`);
    } else {
        bot.sendMessage(chatId, 'Please provide a valid guardian address.');
    }
};
