import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {selectToken} from '../redux/slice/authSlice';
import useSocket from './useSocket';

export default function useChatSocket({
  onMessageReceived,
  onTypingStatusUpdate,
}) {
  const token = useSelector(selectToken);
  const socket = useSocket({token});

  useEffect(() => {
    if (!socket || !token) {
      return;
    }

    // Listen for connect event before attaching other listeners
    const handleConnect = () => {
      console.log('[SOCKET CONNECTED]', socket.id);
      socket.emit('get_my_info');
      socket.on('get_my_info', handleGetMyInfo);
    //   socket.on('private_message', handlePrivateMessage);
      socket.on('typing_status_update', handleTypingStatusUpdate);
      socket.on('new_message', handleNewMessage);
      socket.on('connect_error', handleError);
      socket.on('error', handleError);
      socket.on('disconnect', handleDisconnect);
    };

    const handleGetMyInfo = data => {
      socket.emit('user_info', {
        userId: data.user._id,
        socketId: socket.id,
        isOnline: true,
      });
    };

    const handleNewMessage = message => {
      console.log('[PRIVATE MESSAGE]', message);
      onMessageReceived?.(message);
    };

    const handleTypingStatusUpdate = data => {
      console.log('[TYPING STATUS UPDATE]', data);
      onTypingStatusUpdate?.(data?.isTyping);
    };

    const handleError = err => {
      console.error('[SOCKET ERROR]', err);
    };

    const handleDisconnect = reason => {
      console.warn('[SOCKET DISCONNECT]', reason);
    };

    socket.on('connect', handleConnect);

    if (socket.connected) {
      handleConnect();
    }

    // Cleanup listeners on unmount or deps change
    return () => {
      socket.off('connect', handleConnect);
      socket.off('get_my_info', handleGetMyInfo);
      socket.off('private_message', handleNewMessage);
      socket.off('typing_status_update', handleTypingStatusUpdate);
      socket.off('connect_error', handleError);
      socket.off('error', handleError);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, token, onMessageReceived, onTypingStatusUpdate]);

  const emitTypingStatus = (isTyping, receiverId) => {
    console.log('[EMIT TYPING STATUS]', {isTyping, receiverId});
    if (socket && socket.connected) {
      socket.emit('typing_status', {isTyping, receiverId});
    }
  };

  return {socket, emitTypingStatus};
}
