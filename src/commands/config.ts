import { users } from '../state';

export const configCommand = (msg: any, bot: any) => {
    const chatId = msg.chat.id.toString();
    const user = users[chatId];

    if (!user) {
        bot.sendMessage(chatId, 'Please set your guardian address first using /address <your_address>.');
        return;
    }

    bot.sendMessage(chatId, `Your guardian address is ${user.guardianAddress}.`);
};
