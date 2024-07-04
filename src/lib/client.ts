import { createPublicClient, http } from 'viem';
import { mainnet, taiko } from 'viem/chains';

const jsonRpcUrl = process.env.JSON_RPC_URL || '';
export const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(jsonRpcUrl)
});

export const taikoClient = createPublicClient({
    chain: taiko,
    transport: http()
});