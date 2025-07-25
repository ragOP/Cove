import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const getUserGallery = async ({params, id}) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.userGallery}`,
      params,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
