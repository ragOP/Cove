import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const usernameAvailability = async ({payload}) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.usernameAvailable,
      method: 'GET',
      params: {
        username: payload.username,
      },
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
