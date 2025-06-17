import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const fetchSuggestedUsers = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.suggestedUsers,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
