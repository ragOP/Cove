import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const getUserPendingRequests = async ({}) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.friendRequests}/pending`,
    });
    console.log('getUserPendingRequests response:', apiResponse);
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
