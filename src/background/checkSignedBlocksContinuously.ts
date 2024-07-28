import { UserService } from './../services/userService';
import { UserRepository } from "../repositories/userRepository";
import { BotInstance } from "../types";
import { taikoClient } from "../lib/client";
import { signedBlock } from "../api/signedBlock";

const CHECK_INTERVAL_MS = 60 * 1000;
const SIGNED_BLOCK_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

export const checkSignedBlocksContinuously = async (userService: UserService, bot: BotInstance) => {
    const checkSignedBlocks = async () => {
        const users = await userService.getAllUsers();

        for (const user of users) {
            const { chatId, guardianAddress: address } = user;

            try {
                const latestBlock = await taikoClient.getBlock({
                    blockTag: 'latest'
                });
                const latestSignedBlock = await signedBlock(chatId, address, bot);

                if (!latestBlock || !latestSignedBlock) {
                    continue; // Skip if unable to fetch block info
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
                }
            } catch (error) {
                console.error(`Error checking signed blocks for user ${chatId}:`, error);
            }
        }
    };

    await checkSignedBlocks();

    setInterval(checkSignedBlocks, CHECK_INTERVAL_MS);
};
