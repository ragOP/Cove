import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const readChat = async ({conversationId}) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.readChat}/${conversationId}`,
      method: 'PATCH',
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
