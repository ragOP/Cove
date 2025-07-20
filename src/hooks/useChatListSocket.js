import {useEffect} from 'react';
import {useSocketContext} from '../context/SocketContext';
import {useSelector} from 'react-redux';
import {selectUser} from '../redux/slice/authSlice';

export default function useChatListSocket({
  onChatListUpdate,
  onFriendRequestReceived,
  onFriendRequestRejected,
}) {
  const socket = useSocketContext();

  const user = useSelector(selectUser);
  // const id = user.id;

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleChatListUpdate = data => {
      const chatObj = data?.data?.[0] || [];
      console.info('[CHAT LIST UPDATE]', chatObj, data);
      onChatListUpdate?.(chatObj);
    };

    const handleFriendRequestReceived = data => {
      console.info('[FRIEND REQUEST RECEIVED]', data);
      onFriendRequestReceived?.(data?.data);
    };

    const handleFriendRequestRejected = data => {
      console.info('[FRIEND REQUEST REJECTED]', data);
      onFriendRequestRejected?.(data?.data);
    };

    socket.on('chat_list_update', handleChatListUpdate);
    socket.on('friend_request_received', handleFriendRequestReceived);

    return () => {
      socket.off('chat_list_update', handleChatListUpdate);
      socket.off('friend_request_received', handleFriendRequestReceived);
      socket.off('friend_request_rejected', handleFriendRequestRejected);
    };
  }, [
    socket,
    onChatListUpdate,
    onFriendRequestReceived,
    onFriendRequestRejected,
  ]);

  return {socket};
}
