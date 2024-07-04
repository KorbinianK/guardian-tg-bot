import { Address, formatEther } from "viem";
import { UserService } from "../services/userService";
import { BotInstance, BotMessage } from "../types";
import { publicClient } from "../lib/client";

export const balanceCommand = async (msg: BotMessage, userService: UserService, bot: BotInstance) => {
    const chatId = msg.chat.id.toString();

    const user = await userService.getUser(chatId);

    const address = user?.guardianAddress;

    const balance = await publicClient.getBalance({ address: address as Address })
    bot.sendMessage(chatId, `Guardian balance is: ${formatEther(balance)} ETH`);

};
