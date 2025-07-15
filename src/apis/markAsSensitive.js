import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const markAsSensitive = async ({ids}) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.markAsSensitive,
      method: 'POST',
      data: {
        ids: ids,
      },
    });
    console.log('Mark as sensitive response:', apiResponse);
    return apiResponse;
  } catch (error) {
    console.error('Mark as sensitive error:', error);
    return {success: false, error: true, ...error};
  }
}; 