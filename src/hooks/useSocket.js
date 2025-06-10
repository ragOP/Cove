import {useEffect, useRef} from 'react';
import io from 'socket.io-client';
import { BACKEND_URL } from '../apis/backendUrl';

const SOCKET_URL =  BACKEND_URL;

/**
 * useSocket - Scalable, global socket hook for multiple namespaces/types
 *
 * @param {Object} params
 * @param {string} [params.namespace] - Socket namespace (e.g. '/chat', '/notifications')
 * @param {Object} [params.options] - Additional socket.io-client options
 * @param {function} [params.onConnect] - Callback on connect
 * @param {function} [params.onDisconnect] - Callback on disconnect
 * @param {function} [params.onError] - Callback on error
 * @returns {object} socket instance (always stable)
 */
export default function useSocket({
  options = {},
  token,
  onConnect,
  onDisconnect,
  onError,
} = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Clean up any previous socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Connect to socket with namespace
    const socket = io(`${SOCKET_URL}`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      autoConnect: true,
      auth: {token},
      ...options,
    });
    socketRef.current = socket;

    // Standard event listeners
    if (onConnect) {
      socket.on('connect', onConnect);
    }
    if (onDisconnect) {
      socket.on('disconnect', onDisconnect);
    }
    if (onError) {
      socket.on('error', onError);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, JSON.stringify(options)]);

  return socketRef.current;
}
