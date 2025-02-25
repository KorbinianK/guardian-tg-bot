import { UserService } from '../services/userService';
import { BotInstance } from '../types';
import { latestHealthCheck, lastStatus } from '../state';
import axios from 'axios';
import { getHealthStatus } from '../api/healthcheck.api';

const INITIAL_RETRY_INTERVAL_MS = 60000; // 1 min
const MAX_RETRY_INTERVAL_MS = 600000; // 10 min
const HEALTH_THRESHOLD_MS = 60000; // 1 min threshold to consider a guardian down

const failureCounts: { [chatId: string]: number } = {};
const retryIntervals: { [chatId: string]: number } = {};

export const checkHealthContinuously = async (userService: UserService, bot: BotInstance) => {
    const checkHealthForUsers = async () => {
        const users = await userService.getAllUsers();

        for (const user of users) {
            const { chatId, guardianAddress } = user;

            try {
                console.log(`[Health Check] Checking health for ${guardianAddress}...`);

                const healthStatus = await getHealthStatus(guardianAddress);
                if (!healthStatus) {
                    console.warn(`[Health Check] No valid response for ${guardianAddress}`);
                    bot.sendMessage(chatId, `⚠️ Health check failed! ⚠️\nReason: No valid response from API.`);
                    continue;
                }

                latestHealthCheck[chatId] = healthStatus;
                const createdAt = new Date(healthStatus.items[0].createdAt);
                const now = new Date();
                const alive = (now.getTime() - createdAt.getTime()) <= HEALTH_THRESHOLD_MS;

                if (lastStatus[chatId] !== alive) {
                    const lastSeen = createdAt.toLocaleString();
                    let message;
                    if (alive) {
                        message = lastStatus[chatId] === false
                            ? '🎉 The Guardian is back up and running!🤘'
                            : 'The Guardian is up and running.🤘';
                    } else {
                        message = `⚠️ <b>The Guardian is down!</b> ⚠️\nLast seen online at ${lastSeen}.`;
                    }

                    lastStatus[chatId] = alive;
                    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
                    console.warn(`[Health Check] Guardian ${guardianAddress} is now ${alive ? 'ONLINE' : 'OFFLINE'}.`);
                }

                failureCounts[chatId] = 0;
                retryIntervals[chatId] = INITIAL_RETRY_INTERVAL_MS;

            } catch (error) {
                let errorMessage = 'Unknown error occurred';
                if (axios.isAxiosError(error)) {
                    errorMessage = error.response?.data?.message || error.message || 'API error';
                }

                console.error(`[Health Check] Error for user ${chatId}: ${errorMessage}`);

                failureCounts[chatId] = (failureCounts[chatId] || 0) + 1;

                if (failureCounts[chatId] >= 10) {
                    retryIntervals[chatId] = Math.min(
                        Math.max(retryIntervals[chatId] * 2, INITIAL_RETRY_INTERVAL_MS * 2),
                        MAX_RETRY_INTERVAL_MS
                    );

                    bot.sendMessage(chatId, `⚠️ Health check failed ${failureCounts[chatId]} times.\nReason: ${errorMessage}\nRetrying in ${retryIntervals[chatId] / 60000} min.`, { parse_mode: 'HTML' });
                } else {
                    bot.sendMessage(chatId, `⚠️ Health check failed! ⚠️\nReason: ${errorMessage}`, { parse_mode: 'HTML' });
                }
            }
        }
    };

    setInterval(checkHealthForUsers, INITIAL_RETRY_INTERVAL_MS);
};