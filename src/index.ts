import { TELEGRAM_TOKEN, THRESHOLD_SECONDS } from './config';
import { addressCommand } from './commands/address';
import { configCommand } from './commands/config';
import { helpCommand } from './commands/help';
import { removeCommand } from './commands/remove';
import { statusCommand } from './commands/status';
import { users } from './state';
import TelegramBot from 'node-telegram-bot-api';
import { checkHealth } from './api';
import { getLogger } from './utils/logger';
// Function to log messages with a timestamp
const log = getLogger('index');

// Create a new bot instance
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Set up interval to check health
setInterval(() => {
    for (const userId in users) {
        const { chatId, guardianAddress } = users[userId];
        checkHealth(userId, chatId, guardianAddress, bot);
    }
}, THRESHOLD_SECONDS);

// Register bot commands
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Health check bot started! Use /address <your_address> to set your guardian address.');
});

bot.onText(/\/address (.+)/, (msg, match) => addressCommand(msg, match!, bot));
bot.onText(/\/config/, (msg) => configCommand(msg, bot));
bot.onText(/\/help/, (msg) => helpCommand(msg, bot));
bot.onText(/\/remove/, (msg) => removeCommand(msg, bot));
bot.onText(/\/status/, (msg) => statusCommand(msg, bot));

// Log startup message
log('Health check bot is starting...');

const shutdown = () => {
    log('Health check bot is shutting down...');
    Object.keys(users).forEach((userId) => {
        // send a message to all users that the bot is shutting down
        bot.sendMessage(users[userId].chatId, 'Health check bot server is shutting down...');
    });
    bot.stopPolling().then(() => {
        log('Polling stopped. Exiting process.');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

