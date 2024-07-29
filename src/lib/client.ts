import { createPublicClient, http } from 'viem';
import { holesky, mainnet, taiko, taikoHekla } from 'viem/chains';
import { NETWORK, RPC_URL } from '../config';



export const publicClient = createPublicClient({
    chain: NETWORK === "hekla" ? holesky : mainnet,
    transport: http(RPC_URL)
});

export const taikoClient = createPublicClient({
    chain: NETWORK === "hekla" ? taikoHekla : taiko,
    transport: http()
});