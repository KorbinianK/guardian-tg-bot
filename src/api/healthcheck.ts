import axios from 'axios';
import { GUARDIAN_API, THRESHOLD_SECONDS } from '../config';
import { latestHealthCheck, lastStatus } from '../state';
import { HealthCheckResponse, BotInstance } from '../types';

export const checkHealth = async (chatId: string, guardianAddress: string, bot: BotInstance, directResponse: boolean = false) => {
    try {
        const response = await axios.get<HealthCheckResponse>(`${GUARDIAN_API}/healthchecks/${guardianAddress}`);
        latestHealthCheck[chatId] = response.data;

        if (response.status === 200 && response.data.items.length > 0) {
            const createdAt = new Date(response.data.items[0].createdAt);
            const now = new Date();
            const alive = (now.getTime() - createdAt.getTime()) <= THRESHOLD_SECONDS;

            if (lastStatus[chatId] !== alive || directResponse) {
                lastStatus[chatId] = alive;

                const lastSeen = new Date(response.data.items[0].createdAt).toLocaleString();

                const message = alive
                    ? 'The Guardian is up and running.🤘'
                    : `⚠️ <b>The Guardian is down!</b>⚠️\nLast seen online at ${lastSeen}.`;

                if (directResponse) {
                    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
                } else {
                    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
                }
            }
        } else {
            const message = 'This address is not a guardian. Please change your guardian address using /address <your_address>.';
            if (directResponse) {
                bot.sendMessage(chatId, message);
            } else {
                bot.sendMessage(chatId, message);
            }
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

        if (directResponse) {
            bot.sendMessage(chatId, `⚠️ <b>The Guardian is down!</b>⚠️\n${errorMessage}`, { parse_mode: 'HTML' });
        } else {
            bot.sendMessage(chatId, `⚠️ <b>The Guardian is down!</b>⚠️\n${errorMessage}`, { parse_mode: 'HTML' });
        }
    }
};
