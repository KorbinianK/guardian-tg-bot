import { UserService } from '../services/userService';
import { BotInstance } from '../types';
import { signedBlock } from '../api/signedBlock';
import { taikoClient } from '../lib/client';
import axios from 'axios';

const INITIAL_RETRY_INTERVAL_MS = 60000; // 1 minute
const MAX_RETRY_INTERVAL_MS = 600000; // 10 minutes
const SIGNED_BLOCK_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

const failureCounts: { [chatId: string]: number } = {};
const retryIntervals: { [chatId: string]: number } = {};

export const checkSignedBlocksContinuously = async (userService: UserService, bot: BotInstance) => {
    const checkBlocksForUsers = async () => {
        const users = await userService.getAllUsers();

        for (const user of users) {
            const { chatId, guardianAddress } = user;

            try {
                console.log(`[Block Check] Checking signed blocks for ${guardianAddress}...`);

                const latestBlock = await taikoClient.getBlock({ blockTag: 'latest' });
                const latestSignedBlock = await signedBlock(chatId, user.guardianAddress, bot);

                if (!latestSignedBlock || !latestBlock) {
                    console.warn(`[Block Check] No signed block found for ${guardianAddress}`);
                    bot.sendMessage(chatId, `⚠️ Block check failed! ⚠️\nReason: No signed block found.`);
                    continue;
                }

                const latestBlockTime = new Date(Number(latestBlock.timestamp) * 1000);
                const signedBlockTime = new Date(Number(latestSignedBlock.createdAt) * 1000);
                const timeDiff = latestBlockTime.getTime() - signedBlockTime.getTime();

                if (timeDiff > SIGNED_BLOCK_THRESHOLD_MS) {
                    bot.sendMessage(chatId, `
                        ⚠️ <b>No signed block in the last 10 minutes!</b> ⚠️
                        <b>Latest L2 block:</b> ${latestBlock.number}
                        <b>Last signed:</b> ${latestSignedBlock.blockID}
                        <b>Time since last signed block:</b> ${Math.floor(timeDiff / 60000)} minutes`,
                        { parse_mode: 'HTML' });

                    console.warn(`[Block Check] Guardian ${guardianAddress} has no signed blocks for ${Math.floor(timeDiff / 60000)} minutes!`);
                }

                failureCounts[chatId] = 0;
                retryIntervals[chatId] = INITIAL_RETRY_INTERVAL_MS;

            } catch (error) {
                let errorMessage = 'Unknown error occurred';
                if (axios.isAxiosError(error)) {
                    errorMessage = error.response?.data?.message || error.message || 'API error';
                }

                console.error(`[Block Check] Error for user ${chatId}: ${errorMessage}`);

                failureCounts[chatId] = (failureCounts[chatId] || 0) + 1;

                if (failureCounts[chatId] >= 10) {
                    retryIntervals[chatId] = Math.min(
                        Math.max(retryIntervals[chatId] * 2, INITIAL_RETRY_INTERVAL_MS * 2),
                        MAX_RETRY_INTERVAL_MS
                    );

                    bot.sendMessage(chatId, `⚠️ Block check failed ${failureCounts[chatId]} times.\nReason: ${errorMessage}\nRetrying in ${retryIntervals[chatId] / 60000} min.`, { parse_mode: 'HTML' });
                } else {
                    bot.sendMessage(chatId, `⚠️ Block check failed! ⚠️\nReason: ${errorMessage}`, { parse_mode: 'HTML' });
                }
            }
        }
    };

    setInterval(checkBlocksForUsers, INITIAL_RETRY_INTERVAL_MS);
};