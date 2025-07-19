import axios from 'axios';
import {BACKEND_URL} from './backendUrl';
import {selectToken} from '../redux/slice/authSlice';
import {store} from '../redux/store';

export const apiService = async ({
  endpoint,
  method = 'GET',
  data,
  params,
  token: _token,
  headers,
  customUrl,
  removeToken = false,
  signal,
}) => {
  try {
    const token = selectToken(store.getState());

    const requestObj = {
      url: `${customUrl ? customUrl : BACKEND_URL}/${endpoint}`,
      params,
      method,
      data,
      signal,
    };

    if (token || _token) {
      requestObj.headers = {
        ...headers,
        'ngrok-skip-browser-warning': 'xyz',
        ...(!removeToken ? {Authorization: `Bearer ${_token || token}`} : {}),
      };
    }

    const {data: res} = await axios(requestObj);

    return {response: res};
  } catch (error) {
    console.error('API Error:', error.response || error, endpoint);
    return {success: false, error: true, ...(error || {})};
  }
};
