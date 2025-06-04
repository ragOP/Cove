import {launchImageLibrary} from 'react-native-image-picker';

export const selectFiles = async (options = {}) => {
  return new Promise((resolve, reject) => {
    launchImageLibrary(
      {
        mediaType: 'mixed', // images, videos, etc.
        selectionLimit: 5, // allow multiple, adjust as needed
        ...options,
      },
      response => {
        if (response.didCancel) return resolve([]);
        if (response.errorCode) return reject(response.errorMessage);
        resolve(response.assets || []);
      }
    );
  });
};
