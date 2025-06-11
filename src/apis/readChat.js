
import { apiService } from './apiService';
import {endpoints} from './endpoints';

export const readChat = async ({conversationId}) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.readChat}/${conversationId}`,
      method: 'PATCH',
    });

    console.log('readChat response:',conversationId, apiResponse);
    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
