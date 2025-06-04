import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const getUserContacts = async ({params}) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.userContacts,
      params,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
