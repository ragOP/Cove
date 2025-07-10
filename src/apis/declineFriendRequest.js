import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const declineFriendRequest = async ({requestId}) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.rejectFriendRequest}/${requestId}`,
      method: 'DELETE',
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
