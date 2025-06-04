export const getChatDisplayInfo = (chat, userId) => {
  const user =
    (chat.chatWith && chat.chatWith.length > 0 && chat.chatWith[0]) ||
    (chat.participants && chat.participants.find(p => p._id !== userId));
  return {
    name: user?.name || 'Unknown',
    profilePicture: user?.profilePicture || '',
    _id: user?._id || '',
    username: user?.username || '',
  };
};