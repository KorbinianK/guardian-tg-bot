

export interface HealthCheck {
    id: number;
    guardianProverId: number;
    alive: boolean;
    expectedAddress: string;
    recoveredAddress: string;
    signedResponse: string;
    latestL1Block: number;
    latestL2Block: number;
    createdAt: string;
}