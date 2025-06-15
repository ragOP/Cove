import React, {createContext, useContext, useRef, useEffect} from 'react';
import io from 'socket.io-client';
import {BACKEND_URL} from '../apis/backendUrl';
import { AppState } from 'react-native';

const SOCKET_URL = BACKEND_URL;
export const SocketContext = createContext(null);

export const SocketProvider = ({token, children}) => {
  const socketRef = useRef();

  // Create socket only once
  if (!socketRef.current) {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      autoConnect: false,
    });
  }

  useEffect(() => {
    const socket = socketRef.current;
    if (token) {
      socket.auth = {token};
      if (!socket.connected) {
        socket.connect();
      }
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [token]);

  useEffect(() => {
    const socket = socketRef.current;

    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        console.log(
          '[SocketProvider] App going to background — disconnecting socket...',
        );
        socket.disconnect();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  console.log('>>>>', socketRef);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
