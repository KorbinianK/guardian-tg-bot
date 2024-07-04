import axios from 'axios';
import { GUARDIAN_API, THRESHOLD_SECONDS } from '../config';
import { users, latestHealthCheck } from '../state';
import { HealthCheckResponse } from '../types';

export const statusCommand = async (msg: any, bot: any) => {
    const chatId = msg.chat.id.toString();
    const user = users[chatId];

    if (!user) {
        bot.sendMessage(chatId, 'Please set your guardian address first using /address <your_address>.');
        return;
    }

    const latestResponse = latestHealthCheck[chatId];
    const now = Date.now();

    if (!latestResponse || (now - new Date(latestResponse.items[0].createdAt).getTime()) > THRESHOLD_SECONDS) {
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
};
