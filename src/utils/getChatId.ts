import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const { TELEGRAM_TOKEN } = process.env;

const bot = new TelegramBot(TELEGRAM_TOKEN!, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(`Your chat ID is: ${chatId}`);
    bot.sendMessage(chatId, `Your chat ID is: ${chatId}`);
});