export const helpCommand = (msg: any, bot: any) => {
    const chatId = msg.chat.id.toString();
    bot.sendMessage(chatId, 'Commands:\n \
        /address <your_address> - Set your guardian address\n \
        /remove - Remove your guardian address\n \
        /config - Get your guardian address\n \
        /status - Check the status of your guardian\n \
        /help - Get help');
};