import {useEffect} from 'react';
import {useSocketContext} from '../context/SocketContext';

const useFcmSocket = fcmToken => {
  const socket = useSocketContext();

  useEffect(() => {
    if (socket && socket.connected && fcmToken) {
      socket.emit('register_fcm_token', {token: fcmToken});
    }
  }, [socket, fcmToken]);
};

export default useFcmSocket;
