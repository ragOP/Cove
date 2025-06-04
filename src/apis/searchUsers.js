import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const searchUsers = async ({params}) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.searchUsers,
      params,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
