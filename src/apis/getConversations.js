import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const getConversations = async ({id, params}) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.conversations}/${id}`,
      params,
    });
    console.log('getConversations response:', id, params, apiResponse);

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
