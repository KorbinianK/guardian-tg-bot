import axios from 'axios';
import { GUARDIAN_API } from '../config';
import { latestHealthCheck, lastStatus } from '../state';
import { SignedBlockResponse } from '../types';

export const signedBlock = async (chatId: string, guardianAddress: string, bot: any) => {
    try {
        const response = await axios.get<SignedBlockResponse>(`${GUARDIAN_API}/signedBlock/${guardianAddress}`);

        if (response.data) {
            return response.data;
        } else {
            return null;
        }
    } catch (error: unknown) {
        let errorMessage = 'Unknown error occurred';

        if (axios.isAxiosError(error)) {
            if (error.response) {
                errorMessage = `Status: ${error.response.status}, Message: ${error.response.data.message || error.response.data}`;
            } else if (error.request) {
                errorMessage = 'No response received from the server';
            } else {
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.log(`Error occurred: ${errorMessage}`);
        bot.sendMessage(chatId, '⚠️ Block check failed! ⚠️');
    }
};
