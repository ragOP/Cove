import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const markAsUnsensitive = async ({ids}) => {
  try {
    console.log('Mark as unsensitive ids:', ids);
    const apiResponse = await apiService({
      endpoint: endpoints.markAsUnsensitive,
      method: 'POST',
      data: {
        ids: ids,
      },
    });
    console.log('Mark as unsensitive response:', apiResponse);
    return apiResponse;
  } catch (error) {
    console.error('Mark as unsensitive error:', error);
    return {success: false, error: true, ...error};
  }
}; 