import {useEffect} from 'react';
import {useSocketContext} from '../context/SocketContext';
import {useSelector} from 'react-redux';
import {selectUser} from '../redux/slice/authSlice';

export default function useChatListSocket({onChatListUpdate}) {
  const socket = useSocketContext();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleChatListUpdate = data => {
      const chatObj = data?.data?.[0] || [];
      console.log('[CHAT LIST UPDATE]',chatObj, data);
      onChatListUpdate?.(chatObj);
    };

    socket.on('chat_list_update', handleChatListUpdate);

    return () => {
      socket.off('chat_list_update', handleChatListUpdate);
    };
  }, [socket, onChatListUpdate]);

  return {socket};
}
