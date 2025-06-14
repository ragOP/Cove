import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {selectToken} from '../redux/slice/authSlice';
import useSocket from './useSocket';

export default function useChatListSocket({onChatListUpdate}) {
  const token = useSelector(selectToken);
  const socket = useSocket({token});

  useEffect(() => {
    if (!socket || !token) {
      return;
    }

    const handleChatListUpdate = chatObj => {
      console.log('[CHAT LIST UPDATE]', chatObj);
      if (onChatListUpdate) {
        onChatListUpdate(chatObj);
      }
    };

    socket.on('chat_list_update', handleChatListUpdate);

    return () => {
      socket.off('chat_list_update', handleChatListUpdate);
    };
  }, [socket, token, onChatListUpdate]);

  return {socket};
}
