import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
} from 'react';
import io from 'socket.io-client';
import {BACKEND_URL} from '../apis/backendUrl';
import {AppState} from 'react-native';

const SOCKET_URL = BACKEND_URL;
export const SocketContext = createContext(null);

export const SocketProvider = ({token, children}) => {
  const socketRef = useRef();
  const [appState, setAppState] = useState(AppState.currentState);

  if (!socketRef.current) {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      autoConnect: true,
      timeout: 20000,
    });
  }

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      setAppState(nextAppState);
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (token && appState === 'active') {
      socket.auth = {token};
      if (!socket.connected && !socket.connecting) {
        socket.connect();
      }
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [token, appState]);

  useEffect(() => {
    const socket = socketRef.current;
    const onConnectError = err => {
      console.error('[Socket] connect_error:', err?.message);
    };
    const onReconnectError = err => {
      console.error('[Socket] reconnect_error:', err?.message);
    };
    const onDisconnect = reason => {
      console.warn('[Socket] disconnected:', reason);
    };
    socket.on('connect_error', onConnectError);
    socket.on('reconnect_error', onReconnectError);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect_error', onConnectError);
      socket.off('reconnect_error', onReconnectError);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // For debugging
  useEffect(() => {
    console.log('[SocketProvider] socketRef.current:', socketRef.current);
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
