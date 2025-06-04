import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const acceptFriendRequest = async ({payload, requestId}) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.friendRequests}/${requestId}/accept`,
      method: 'PATCH',
      data: payload,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
