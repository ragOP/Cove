import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {selectToken} from '../redux/slice/authSlice';
import useSocket from './useSocket';

export default function useChatSocket({onMessageReceived}) {
  const token = useSelector(selectToken);
  const socket = useSocket({token});

  useEffect(() => {
    if (!socket || !token) return;

    const handleUserInfo = data => {
      console.log('[USER INFO]', data);
      socket.emit('user_info', {
        userId: data.user._id,
        socketId: socket.id,
        isOnline: true,
      });
    };

    const handlePrivateMessage = message => {
      console.log('[PRIVATE MESSAGE]', message);
      onMessageReceived?.(message);
    };

    const handleError = err => {
      console.error('[SOCKET ERROR]', err);
    };

    const handleDisconnect = reason => {
      console.warn('[SOCKET DISCONNECT]', reason);
    };

    const handleConnect = () => {
      console.log('[SOCKET CONNECTED]', socket.id);
      socket.emit('get_my_info');
    };

    socket.on('user_info', handleUserInfo);
    socket.on('new_message', handlePrivateMessage);
    socket.on('connect_error', handleError);
    socket.on('error', handleError);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleConnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('user_info', handleUserInfo);
      socket.off('private_message', handlePrivateMessage);
      socket.off('connect_error', handleError);
      socket.off('error', handleError);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, token, onMessageReceived]);

  return socket;
}
