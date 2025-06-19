import {useEffect} from 'react';
import {useSocketContext} from '../context/SocketContext';

export default function useChatListSocket({
  onChatListUpdate,
  onFriendRequestReceived,
}) {
  const socket = useSocketContext();

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleChatListUpdate = data => {
      const chatObj = data?.data?.[0] || [];
      console.log('[CHAT LIST UPDATE]', chatObj, data);
      onChatListUpdate?.(chatObj);
    };

    const handleFriendRequestReceived = data => {
      console.log('[FRIEND REQUEST RECEIVED]', data);
      onFriendRequestReceived?.(data?.data);
    };

    socket.on('chat_list_update', handleChatListUpdate);
    socket.on('friend_request_received', handleFriendRequestReceived);

    return () => {
      socket.off('chat_list_update', handleChatListUpdate);
      socket.off('friend_request_received', handleFriendRequestReceived);
    };
  }, [socket, onChatListUpdate, onFriendRequestReceived]);

  return {socket};
}
