export const endpoints = {
  signup: 'api/auth/user',
  login: 'api/auth/login',
  userProfile: 'api/user/update-profile',
  usernameAvailable: 'api/user/is-username-available',
  userContacts: 'api/user/messages/get-all-chats',
  searchUsers: 'api/user/search',
  sendFriendRequest: 'api/user/add-friend',
  friendRequests: 'api/user/friend-requests',
  conversations: 'api/user/one-to-one-chat',
  sendMessage: 'api/user/messages/send-message',
  uploadFile: 'api/user/upload-files',
};
