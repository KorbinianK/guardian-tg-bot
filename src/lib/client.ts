import { createPublicClient, http } from 'viem';
import { mainnet, taiko } from 'viem/chains';

const rpcUrl = process.env.RPC_URL || '';

export const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl)
});

export const taikoClient = createPublicClient({
    chain: taiko,
    transport: http()
});