import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const uploadFilesToCloud = async ({payload}) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.uploadFile,
      method: 'POST',
      data: payload,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
