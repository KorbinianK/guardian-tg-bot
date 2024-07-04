import { users } from '../state';

export const removeCommand = (msg: any, bot: any) => {
    const chatId = msg.chat.id.toString();
    delete users[chatId];
    bot.sendMessage(chatId, 'Guardian address removed.');
};
