export const prepareMessagePayload = ({
  userId,
  receiverId,
  text,
  files = [],
}) => {
  if (files.length) {
    return files.map(file => ({
      receiverId,
      // senderId: userId,
      content: file.caption || '',
      mediaUrl: file.url,
      type: file.fileType.startsWith('image') ? 'image' : 'file',
      meta: {
        originalName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize,
      },
    }));
  }
  return [
    {
      receiverId,
      // senderId: userId,
      content: text,
      type: 'text',
    },
  ];
};
