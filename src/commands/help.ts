import { BotMessage, BotInstance } from '../types';

export const helpCommand = (msg: BotMessage, bot: BotInstance) => {
    const chatId = msg.chat.id.toString();
    bot.sendMessage(chatId, 'Commands:\n \
        /address <your_address> - Set your guardian address\n \
        /remove - Remove your guardian address\n \
        /config - Get your guardian address\n \
        /status - Check the status of your guardian\n \
        /balance - Check the balance of your guardian\n \
        /block - Check the latest block number and the signed block number\n \
        /help - Get help');
};
