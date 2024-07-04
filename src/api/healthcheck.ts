import axios from 'axios';
import { GUARDIAN_API } from '../config';
import { latestHealthCheck, lastStatus } from '../state';
import { HealthCheckResponse } from '../types';

export const checkHealth = async (userId: string, chatId: string, guardianAddress: string, bot: any) => {
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
};
