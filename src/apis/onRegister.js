import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const onRegister = async ({payload}) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.signup,
      method: 'POST',
      data: payload,
      removeToken: true,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
