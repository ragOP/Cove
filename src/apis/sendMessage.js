import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const sendMessage = async ({payload}) => {
  try {
    console.log("PAYLOAD", payload)
    const apiResponse = await apiService({
      endpoint: `${endpoints.sendMessage}`,
      method: 'POST',
      data: payload,
    });
    console.log("apiResponse",apiResponse)
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
