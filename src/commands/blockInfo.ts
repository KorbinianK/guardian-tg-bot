import { UserService } from "../services/userService";
import { BotInstance, BotMessage } from "../types";
import { taikoClient } from "../lib/client";
import { signedBlock } from "../api/signedBlock";

export const blockInfoCommand = async (msg: BotMessage, userService: UserService, bot: BotInstance) => {
    const chatId = msg.chat.id.toString();
    const user = await userService.getUser(chatId);
    const address = user?.guardianAddress;
    if (!address || !user) {
        bot.sendMessage(chatId, 'Guardian address is not set. Use /address <your_address> to set your guardian address.');
        return;
    }

    const latestBlock = await taikoClient.getBlock({
        blockTag: 'latest'
    })
    const latestSignedBlock = await signedBlock(chatId, address, bot);

    bot.sendMessage(chatId, `Latest block number: ${latestBlock.number}\nSigned block number: ${latestSignedBlock?.blockID}`);
};
