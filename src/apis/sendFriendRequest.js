import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const sendFriendRequest = async ({payload}) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.sendFriendRequest,
      method: 'POST',
      data: payload,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
