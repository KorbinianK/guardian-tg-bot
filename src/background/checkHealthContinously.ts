import { getHealthStatus } from '../api/healthcheck.api';
import { THRESHOLD_SECONDS } from '../config';
import { UserService } from '../services/userService';
import { latestHealthCheck, lastStatus } from '../state';
import { BotInstance } from '../types';

const CHECK_INTERVAL_MS = 60 * 1000;
const HEALTH_THRESHOLD_MS = THRESHOLD_SECONDS * 1000;

export const checkHealthContinuously = async (userService: UserService, bot: BotInstance) => {
    const checkHealthForUsers = async () => {
        const users = await userService.getAllUsers();

        for (const user of users) {
            const { chatId, guardianAddress: address } = user;

            try {
                const healthStatus = await getHealthStatus(address);
                if (!healthStatus) {
                    const message = 'This address is not a guardian. Please change your guardian address using /address <your_address>.';
                    bot.sendMessage(chatId, message);
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
                        message = `⚠️ <b>The Guardian is down!</b>⚠️\nLast seen online at ${lastSeen}.`;
                    }

                    lastStatus[chatId] = alive;
                    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
                }
            } catch (error) {
                console.error(`Error checking health for user ${chatId}:`, error);
                bot.sendMessage(chatId, `⚠️ <b>The Guardian is down!</b>⚠️\n${error}`, { parse_mode: 'HTML' });
            }
        }
    };

    await checkHealthForUsers();

    setInterval(checkHealthForUsers, CHECK_INTERVAL_MS);
};
