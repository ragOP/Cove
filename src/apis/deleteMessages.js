import {apiService} from './apiService';
import {endpoints} from './endpoints';

/**
 * Delete messages by their IDs
 * @param {Object} payload - The payload containing message IDs
 * @param {Array<string>} payload.ids - Array of message IDs to delete
 * @returns {Promise<Object>} - API response
 */
export const deleteMessages = async ({ids}) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.deleteMessages,
      method: 'POST',
      data: { ids },
    });
    console.log('Delete messages response:', apiResponse);
    return apiResponse;
  } catch (error) {
    console.error('Delete messages error:', error);
    return {success: false, error: true, ...error};
  }
}; 