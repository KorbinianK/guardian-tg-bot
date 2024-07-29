import { GUARDIAN_API, NETWORK, RPC_URL, TELEGRAM_TOKEN, THRESHOLD_SECONDS } from './config';
import { addressCommand } from './commands/address';
import { configCommand } from './commands/config';
import { helpCommand } from './commands/help';
import { removeCommand } from './commands/remove';
import { statusCommand } from './commands/status';
import TelegramBot from 'node-telegram-bot-api';
import { initDatabase } from './database/database';
import { UserRepository } from './repositories/userRepository';
import { UserService } from './services/userService';
import { BotInstance } from './types';
import { balanceCommand } from './commands/balance';
import { blockInfoCommand } from './commands/blockInfo';
import { checkSignedBlocksContinuously } from './background/checkSignedBlocksContinuously';
import { checkHealthContinuously } from './background/checkHealthContinously';

const log = (message: string) => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};

log(`TELEGRAM_TOKEN: ${TELEGRAM_TOKEN}`);
log(`GUARDIAN_API: ${GUARDIAN_API}`);
log(`THRESHOLD_SECONDS: ${THRESHOLD_SECONDS}`);
log(`RPC_URL: ${RPC_URL}`);
log(`NETWORK: ${NETWORK}`);

(async () => {
    const db = await initDatabase();
    const userRepository = new UserRepository(db);
    const userService = new UserService(userRepository);

    const bot: BotInstance = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

    bot.onText(/\/start/, (msg) => {
        bot.sendMessage(msg.chat.id, 'Health check bot started! Use /address <your_address> to set your guardian address.');
    });

    bot.onText(/\/address (.+)/, (msg, match) => addressCommand(msg, match!, userService, bot));
    bot.onText(/\/config/, (msg) => configCommand(msg, userService, bot));
    bot.onText(/\/help/, (msg) => helpCommand(msg, bot));
    bot.onText(/\/remove/, (msg) => removeCommand(msg, userService, bot));
    bot.onText(/\/status/, (msg) => statusCommand(msg, userService, bot));
    bot.onText(/\/balance/, (msg) => balanceCommand(msg, userService, bot));
    bot.onText(/\/block/, (msg) => blockInfoCommand(msg, userService, bot));


    log('Health check bot started!');
    const allUsers = await userRepository.getAllUsers();
    allUsers.map(user => {
        bot.sendMessage(user.chatId, 'Health check bot started!');
    });


    // Background tasks
    checkSignedBlocksContinuously(userService, bot);
    checkHealthContinuously(userService, bot);


    const shutdown = async () => {
        log('Health check bot is shutting down...');
        const allUsers = await userRepository.getAllUsers();

        allUsers.map(user => {
            bot.sendMessage(user.chatId, 'Health check bot is shutting down...');
        });
        bot.stopPolling().then(() => {
            log('Polling stopped. Exiting process.');
            process.exit(0);
        }).catch(error => {
            console.error('Error stopping polling:', error);
            process.exit(1);
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
})();
