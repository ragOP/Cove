import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const getSentFriendRequests = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.friendRequests}/sent`,
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
