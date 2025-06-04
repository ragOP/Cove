export const prepareMessagePayload = ({
  userId,
  receiverId,
  text,
  files = [],
}) => {
  if (files.length) {
    // For now, only images, but can be extended for other types
    return files.map(file => ({
      receiverId,
      // senderId: userId,
      content: file.url,
      type: file.fileType.startsWith('image') ? 'image' : 'file',
      meta: {
        originalName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize,
      },
    }));
  }
  // Text message
  return [
    {
      receiverId,
      // senderId: userId,
      content: text,
      type: 'text',
    },
  ];
};
