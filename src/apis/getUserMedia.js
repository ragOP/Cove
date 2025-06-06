import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const getUserMedia = async ({params, id}) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.conversations}/${id}/media`,
      params,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
