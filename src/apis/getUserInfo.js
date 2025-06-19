import { apiService } from './apiService';
import { endpoints } from './endpoints';

export const getUserInfo = async ({ userId }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.userInfo}/${userId}`,
      method: 'GET',
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
