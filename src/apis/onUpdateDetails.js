import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const onUpdateDetails = async ({payload}) => {
  try {
    const headers = {
      'Content-Type': 'multipart/form-data',
    };

    const apiResponse = await apiService({
      endpoint: endpoints.userProfile,
      method: 'PATCH',
      data: payload,
      headers: headers,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
