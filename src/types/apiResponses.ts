import { HealthCheck } from "./healthCheck";

export interface HealthCheckResponse {
    items: HealthCheck[];
}

export interface SignedBlockResponse {
    guardianProverID: number;
    blockID: number;
    blockHash: string;
    signature: string;
    recoveredAddress: string;
    createdAt: string;
}