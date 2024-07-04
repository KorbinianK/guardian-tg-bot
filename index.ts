import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { TELEGRAM_TOKEN, GUARDIAN_API, THRESHOLD_SECONDS } = process.env;

const bot = new TelegramBot(TELEGRAM_TOKEN!, { polling: true });

// In-memory storage for user data
interface User {
    chatId: string;
    guardianAddress: string;
}

interface HealthCheckResponse {
    items: HealthCheck[];
}

interface HealthCheck {
    id: number;
    guardianProverId: number;
    alive: boolean;
    expectedAddress: string;
    recoveredAddress: string;
    signedResponse: string;
    latestL1Block: number;
    latestL2Block: number;
    createdAt: string;
}

let latestHealthCheck: { [key: string]: HealthCheckResponse } = {};
const users: { [key: string]: User } = {};

let lastStatus: { [key: string]: boolean } = {};

const checkHealth = async () => {
    for (const userId in users) {
        const { chatId, guardianAddress } = users[userId];
        try {
            const response = await axios.get<HealthCheckResponse>(`${GUARDIAN_API}/healthchecks/${guardianAddress}`);
            latestHealthCheck[userId] = response.data;
            if (lastStatus[userId] !== true && response.data.items[0].alive) {
                bot.sendMessage(chatId, 'The Guardian is up and running.🤘');
                lastStatus[userId] = true;
            } else if (lastStatus[userId] !== false && !response.data.items[0].alive) {
                bot.sendMessage(chatId, '⚠️ Health check failed! The Guardian is down! ⚠️');
                lastStatus[userId] = false;
            }
        } catch (error: unknown) {
            let errorMessage = 'Unknown error occurred';

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    errorMessage = `Status: ${error.response.status}, Message: ${error.response.data.message || error.response.data}`;
                } else if (error.request) {
                    errorMessage = 'No response received from the server';
                } else {
                    errorMessage = error.message;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.log(`Error occurred: ${errorMessage}`);
            if (lastStatus[userId] !== false) {
                bot.sendMessage(chatId, '⚠️ Health check failed! The Guardian is down! ⚠️');
                lastStatus[userId] = false;
            }
        }
    }
};

const thresholdMilliseconds = Number(THRESHOLD_SECONDS) * 1000;
if (isNaN(thresholdMilliseconds) || thresholdMilliseconds <= 0) {
    console.error('Invalid THRESHOLD_SECONDS value.');
    process.exit(1);
}

setInterval(checkHealth, thresholdMilliseconds);

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Health check bot started! Use /address <your_address> to set your guardian address.');
});

bot.onText(/\/address (.+)/, (msg, match) => {
    const chatId = msg.chat.id.toString();
    const address = match ? match[1] : '';

    if (address) {
        users[chatId] = { chatId, guardianAddress: address };
        bot.sendMessage(chatId, `Guardian address set to ${address}.`);
    } else {
        bot.sendMessage(chatId, 'Please provide a valid guardian address.');
    }
});

bot.onText(/\/remove/, (msg) => {
    const chatId = msg.chat.id.toString();
    delete users[chatId];
    bot.sendMessage(chatId, 'Guardian address removed.');
});

bot.onText(/\/config/, (msg) => {
    const chatId = msg.chat.id.toString();
    const user = users[chatId];

    if (!user) {
        bot.sendMessage(chatId, 'Please set your guardian address first using /address <your_address>.');
        return;
    }

    bot.sendMessage(chatId, `Your guardian address is ${user.guardianAddress}.`);
});


bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id.toString();
    bot.sendMessage(chatId, 'Commands:\n \
        /address < your_address > - Set your guardian address\n \
        /remove - Remove your guardian address\n \
        /config - Get your guardian address\n \
        /status - Check the status of your guardian\n \
        /help - Get help');
});

bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id.toString();
    const user = users[chatId];

    if (!user) {
        bot.sendMessage(chatId, 'Please set your guardian address first using /address <your_address>.');
        return;
    }

    const latestResponse = latestHealthCheck[chatId];
    const now = Date.now();

    if (!latestResponse || (now - new Date(latestResponse.items[0].createdAt).getTime()) > thresholdMilliseconds) {
        console.log("New fetch");
        try {
            const response = await axios.get<HealthCheckResponse>(`${GUARDIAN_API}/healthchecks/${user.guardianAddress}`);
            latestHealthCheck[chatId] = response.data;
            if (response.status === 200 && response.data.items.length > 0) {
                if (response.data.items[0].alive) {
                    bot.sendMessage(chatId, 'The Guardian is up and running.🤘');
                } else {
                    bot.sendMessage(chatId, '⚠️ The Guardian is down!⚠️');
                }
            } else {
                bot.sendMessage(chatId, 'This address is not a guardian. Please change your guardian address using /address <your_address>.');
            }
        } catch (error: unknown) {
            let errorMessage = 'Unknown error occurred';

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    errorMessage = `Status: ${error.response.status}, Message: ${error.response.data.message || error.response.data}`;
                } else if (error.request) {
                    errorMessage = 'No response received from the server';
                } else {
                    errorMessage = error.message;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.log(`Error occurred: ${errorMessage}`);

            bot.sendMessage(chatId, `⚠️ The Guardian is down!⚠️\n${errorMessage}`);
        }
    } else {
        console.log("Existing fetch");

        const { alive } = latestResponse.items[0];
        if (alive) {
            bot.sendMessage(chatId, 'The Guardian is up and running.🤘');
        } else {
            bot.sendMessage(chatId, '⚠️ The Guardian is down!⚠️');
        }
    }
});
