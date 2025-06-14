import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const getSentFriendRequests = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.sentFriendRequests,
    });

    console.log('getSentFriendRequests response:', apiResponse);
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
