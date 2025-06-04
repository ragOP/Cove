import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const sendMessage = async ({payload}) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.sendMessage}`,
      method: 'POST',
      data: payload,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
