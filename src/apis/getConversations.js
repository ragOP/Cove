import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const getConversations = async ({id}) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.conversations}/${id}`,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
