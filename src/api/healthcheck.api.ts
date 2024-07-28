import axios from 'axios';
import { GUARDIAN_API } from '../config';
import { HealthCheckResponse } from '../types';

export const getHealthStatus = async (guardianAddress: string): Promise<HealthCheckResponse | null> => {
    try {
        const response = await axios.get<HealthCheckResponse>(`${GUARDIAN_API}/healthchecks/${guardianAddress}`);
        if (response.status === 200 && response.data.items.length > 0) {
            return response.data;
        } else {
            return null;
        }
    } catch (error: unknown) {
        console.error(`Error fetching health status: ${error}`);
        return null;
    }
};
