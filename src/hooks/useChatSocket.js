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
  receiverId: senderId,
}) {
  const socket = useSocketContext();
  const user = useSelector(selectUser);
  const id = user.id;

  const joinChat = (conversationId, userId, receiverId) => {
    if (!conversationId || !userId) {
      return;
    }

    if (socket && socket.connected) {
      console.info('[JOIN CHAT]', socket.id);
      socket.emit('join_chat', {conversationId, userId, receiverId});
    }
  };

  const leaveChat = (conversationId, userId) => {
    if (!conversationId || !userId) {
      return;
    }

    if (socket && socket.connected && conversationId) {
      console.info('[LEAVE CHAT]', socket.id);
      socket.emit('leave_chat', {conversationId, userId});
    }
  };

  const emitTypingStatus = (isTyping, receiverId) => {
    if (socket && socket.connected) {
      console.info('[TYPING STATUS]', {isTyping, receiverId});
      socket.emit('typing_status', {
        isTyping: isTyping,
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
      onMessageReceived?.(message);
    };
    const handleTypingStatusUpdate = data => {
      console.info('[TYPING STATUS UPDATE]', data);
      onTypingStatusUpdate?.(data?.isTyping);
    };
    const handleMessageReadUpdate = data => {
      console.info('[MESSAGE READ DATA]', data);
      onUpdateMessagesStatus?.(data);
    };
    const handleError = err => {
      console.error('[SOCKET ERROR]', err);
    };
    const handleDisconnect = reason => {
      console.warn('[SOCKET DISCONNECT]', reason);
    };

    socket.on(`get_user_info_${id}`, handleGetUserInfo);
    socket.on(`typing_status_update_${id}`, handleTypingStatusUpdate);
    socket.on(`new_message_${id}`, handleNewMessage);
    socket.on('message_read_update', handleMessageReadUpdate);
    socket.on('connect_error', handleError);
    socket.on('error', handleError);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off(`get_user_info_${id}`, handleGetUserInfo);
      socket.off(`typing_status_update_${id}`, handleTypingStatusUpdate);
      socket.off(`new_message_${id}`, handleNewMessage);
      socket.off('message_read_update', handleMessageReadUpdate);
      socket.off('connect_error', handleError);
      socket.off('error', handleError);
      socket.off('disconnect', handleDisconnect);
    };
  }, [
    socket,
    id,
    onMessageReceived,
    onTypingStatusUpdate,
    onUpdateMessagesStatus,
    onUpdateUserStatus,
    senderId,
  ]);

  return {socket, emitTypingStatus, joinChat, leaveChat};
}
