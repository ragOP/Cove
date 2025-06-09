import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

// TEMP SOCKET URL (replace with actual in production)
const SOCKET_URL = 'https://temp-chat-socket.example.com';

/**
 * useChatSocket - React hook for managing chat socket connection and events
 * @param {string} conversationId - Current conversation ID
 * @param {function} onMessageReceived - Callback for new message
 * @param {function} onMessageUpdated - Callback for message update (optional)
 * @param {function} onMessageDeleted - Callback for message delete (optional)
 * @returns {object} socket instance (for advanced usage)
 */
export default function useChatSocket({
  conversationId,
  onMessageReceived,
  onMessageUpdated,
  onMessageDeleted,
}) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to socket
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    // Join conversation room
    if (conversationId) {
      socketRef.current.emit('join_conversation', { conversationId });
    }

    // Listen for new messages
    socketRef.current.on('new_message', (message) => {
      onMessageReceived && onMessageReceived(message);
    });

    // Listen for message updates (edit, status, etc)
    socketRef.current.on('update_message', (message) => {
      onMessageUpdated && onMessageUpdated(message);
    });

    // Listen for message deletion
    socketRef.current.on('delete_message', (messageId) => {
      onMessageDeleted && onMessageDeleted(messageId);
    });

    // Cleanup on unmount or conversation change
    return () => {
      if (socketRef.current) {
        if (conversationId) {
          socketRef.current.emit('leave_conversation', { conversationId });
        }
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  return socketRef.current;
}
