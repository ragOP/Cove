import {useEffect} from 'react';
import {useSocketContext} from '../context/SocketContext';
import {useSelector} from 'react-redux';
import {selectUser} from '../redux/slice/authSlice';
import {playSoundEffect} from '../utils/sound';

export default function useChatSocket({
  onMessageReceived,
  onTypingStatusUpdate,
  onUpdateMessagesStatus,
  onUpdateUserStatus,
}) {
  const socket = useSocketContext();
  const user = useSelector(selectUser);
  const id = user.id;

  const joinChat = conversationId => {
    if (!conversationId) {
      return;
    }

    if (socket && socket.connected) {
      console.info('[JOIN CHAT]', conversationId);
      socket.emit('join_chat', {conversationId});
    }
  };

  const leaveChat = conversationId => {
    if (!conversationId) {
      return;
    }

    if (socket && socket.connected) {
      console.info('[LEAVE CHAT]', conversationId);
      socket.emit('leave_chat', {conversationId});
    }
  };

  const emitTypingStatus = (isTyping, conversationId, receiverId) => {
    if (socket && socket.connected) {
      console.info('[TYPING STATUS]', {isTyping, conversationId});
      socket.emit('typing_status', {
        isTyping: isTyping,
        conversationId: conversationId,
        receiverId: receiverId,
      });
    }
  };

  useEffect(() => {
    if (!socket) {
      return;
    }
    const handleGetUserInfo = data => {
      console.info('[GET MY INFO]', data);
      onUpdateUserStatus?.(data);
    };
    const handleNewMessage = message => {
      console.info('[NEW MESSAGE] >>>>>>>>>>>>>>>>', message);
      playSoundEffect('receive');

      const userId = message?.userId;
      console.log(userId);

      if (userId === id) {
        onMessageReceived?.(message);
      }
    };
    const handleTypingStatusUpdate = data => {
      console.info('[TYPING STATUS UPDATE]', data);
      const userId = data?.userId;

      if (userId === id) {
        onTypingStatusUpdate?.(data?.isTyping);
      }
    };
    const handleMessageReadUpdate = data => {
      console.info('[MESSAGE READ DATA]', data);
      const userId = data?.userId;

      if (userId === id) {
        onUpdateMessagesStatus?.(data);
      }
    };
    const handleError = err => {
      console.error('[SOCKET ERROR]', err);
    };
    const handleDisconnect = reason => {
      console.warn('[SOCKET DISCONNECT]', reason);
    };

    socket.on('get_user_info', handleGetUserInfo);
    socket.on('typing_status_update', handleTypingStatusUpdate);
    socket.on('new_message', handleNewMessage);
    socket.on('message_read_update', handleMessageReadUpdate);
    socket.on('connect_error', handleError);
    socket.on('error', handleError);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('get_user_info', handleGetUserInfo);
      socket.off('typing_status_update', handleTypingStatusUpdate);
      socket.off('new_message', handleNewMessage);
      socket.off('message_read_update', handleMessageReadUpdate);
      socket.off('connect_error', handleError);
      socket.off('error', handleError);
      socket.off('disconnect', handleDisconnect);
    };
  }, [
    id,
    socket,
    onMessageReceived,
    onTypingStatusUpdate,
    onUpdateMessagesStatus,
    onUpdateUserStatus,
  ]);

  return {socket, emitTypingStatus, joinChat, leaveChat};
}
