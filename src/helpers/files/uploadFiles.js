import {uploadFilesToCloud} from '../../apis/uploadFilesToCloud';

export const uploadFiles = async (files = []) => {
  if (!files.length) return [];
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', {
      uri: file.uri,
      name: file.fileName || file.name,
      type: file.type,
    });
  });
  const res = await uploadFilesToCloud({payload: formData});
  if (res?.response?.success) return res.response.data;
  throw new Error(res?.response?.message || 'Upload failed');
};
