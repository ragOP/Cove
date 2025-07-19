import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import ChatsContainer from './components/ChatsContainer';
import ContactHeader from './components/ContactHeader';
import SendChat from './components/SendChat';
import { getChatDisplayInfo } from '../../utils/chat/getChatDisplayInfo';
import { useSelector } from 'react-redux';
import SelectedMessageBar from './components/SelectedMessageBar';
import Clipboard from '@react-native-clipboard/clipboard';
import GallerySection from './components/GallerySection';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useChatSocket from '../../hooks/useChatSocket';
import { dedupeMessages } from '../../utils/messages/dedupeMessages';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { readChat } from '../../apis/readChat';
import { getUserInfo } from '../../apis/getUserInfo';
import { deleteMessages } from '../../apis/deleteMessages';
import CustomDialog from '../../components/CustomDialog/CustomDialog';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../redux/slice/snackbarSlice';

const ContactChat = () => {
  const route = useRoute();
  const reduxAuth = useSelector(state => state.auth);
  const userId = reduxAuth.user?.id;

  const queryClient = useQueryClient();

  const contact = route.params?.contact;
  const conversationId = contact?._id;

  const contactDetails = getChatDisplayInfo(contact, userId);

  const [conversations, setConversations] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [tab, setTab] = useState('chat');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const [userConversationId, setUserConversationId] = useState(null);
  const [userStatus, setUserStatus] = useState({
    isOnline: false,
    lastSeen: null,
  });
  const [isFetchingUserStatus, setIsFetchingUserStatus] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!contact?._id) {
      return;
    }
    const fetchUserInfo = async () => {
      try {
        setIsFetchingUserStatus(true);
        const apiResponse = await getUserInfo({ userId: contactDetails._id });

        if (apiResponse?.response?.success && apiResponse?.response?.data) {
          const data = apiResponse.response.data;
          setUserStatus(prev => ({
            ...prev,
            isOnline: data.isOnline ?? prev.isOnline,
            lastSeen: data.lastSeen ?? prev.lastSeen,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetchingUserStatus(false);
      }
    };

    fetchUserInfo();
  }, [contact?._id, contactDetails._id]);

  const onUpdateMessagesStatus = data => {
    if (!data?.messageId) {
      return;
    }

    setConversations(prev => {
      if (!Array.isArray(prev)) {
        return prev;
      }
      return prev.map(msg =>
        msg._id === data.messageId
          ? { ...msg, read: true, readBy: data.readBy, readAt: data.timestamp }
          : msg,
      );
    });
  };

  const { emitTypingStatus, joinChat, leaveChat } = useChatSocket({
    onMessageReceived: message => {
      setConversations(prev => dedupeMessages([...(prev || []), message]));
    },
    onUpdateMessagesStatus,
    onUpdateUserStatus: status => {
      setUserStatus({
        isOnline: status.isOnline,
        lastSeen: status.lastSeen,
      });
    },
    onMessageDeleted: data => {
      // Handle message_deleted event - data.data is array of message IDs
      if (data?.data && Array.isArray(data.data)) {
        const deletedMessageIds = data.data; // Direct array of IDs
        setConversations(prev => prev.filter(msg => !deletedMessageIds.includes(msg._id)));

        // Invalidate gallery cache when messages are deleted via socket
        queryClient.invalidateQueries({ queryKey: ['gallery', contactDetails?._id] });
        queryClient.invalidateQueries({ queryKey: ['gallery'] });
      }
    },
    receiverId: contactDetails?._id,
  });

  const handleSelectMessage = msg => setSelectedMessage(msg);
  const handleClearSelected = () => setSelectedMessage(null);
  const handleCopySelected = msg => Clipboard.setString(msg.content || '');
  const handleReplySelected = msg => {
    setReplyMessage(msg);
    handleClearSelected();
  };

  const handleDeleteSelected = async msg => {
    setMessageToDelete(msg);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;

    try {
      const response = await deleteMessages({ ids: [messageToDelete._id] });

      if (response?.response?.success) {
        // Remove the message from conversations
        setConversations(prev => prev.filter(m => m._id !== messageToDelete._id));
        handleClearSelected();

        queryClient.invalidateQueries({ queryKey: ['gallery', contactDetails?._id] });

        queryClient.invalidateQueries({ queryKey: ['gallery'] });

        dispatch(
          showSnackbar({
            type: 'success',
            title: 'Message Deleted',
            subtitle: 'Message has been deleted successfully',
            placement: 'top',
          }),
        );
      } else {
        console.error('Failed to delete message:', response);
        const errorMessage = response?.response?.data?.message || 'Failed to delete message';
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Error',
            subtitle: errorMessage,
            placement: 'top',
          }),
        );
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Server Error',
          subtitle: 'Failed to delete message',
          placement: 'top',
        }),
      );
    } finally {
      setShowDeleteDialog(false);
      setMessageToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setMessageToDelete(null);
  };

  const handleMarkSensitive = (messageId, isSensitive) => {
    setConversations(prev =>
      prev.map(msg =>
        msg._id === messageId
          ? { ...msg, isSensitive: isSensitive }
          : msg
      )
    );
    dispatch(
      showSnackbar({
        type: 'success',
        title: 'Marked as Sensitive',
        subtitle: 'Message has been marked as sensitive',
        placement: 'top',
      }),
    );
  };

  const handleMarkUnsensitive = (messageId, isSensitive) => {
    setConversations(prev =>
      prev.map(msg =>
        msg._id === messageId
          ? { ...msg, isSensitive: isSensitive }
          : msg
      )
    );
    dispatch(
      showSnackbar({
        type: 'success',
        title: 'Marked as Insensitive',
        subtitle: 'Message has been marked as insensitive',
        placement: 'top',
      }),
    );
  };

  const handleDeleteMessage = (messageId,) => {
    setConversations(prev => prev.filter(msg => msg._id !== messageId));
    dispatch(
      showSnackbar({
        type: 'success',
        title: 'Message deleted',
        subtitle: 'Message has been delted successfully',
        placement: 'top',
      }),
    );
  };


  useQuery({
    queryKey: ['read_chat', userConversationId],
    queryFn: async () => {
      if (userConversationId) {
        return readChat({ conversationId: userConversationId });
      }
    },
    enabled: !!userConversationId,
  });

  useEffect(() => {
    joinChat(conversationId);

    return () => {
      leaveChat(conversationId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  if (!contactDetails) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#181818' }}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <View style={styles.container}>
          {selectedMessage ? (
            <SelectedMessageBar
              selectedMessage={selectedMessage}
              onClose={handleClearSelected}
              onCopy={handleCopySelected}
              onReply={handleReplySelected}
              onDelete={handleDeleteSelected}
            />
          ) : (
            <ContactHeader
              user={contactDetails}
              name={contactDetails.name}
              username={contactDetails.username}
              profilePicture={contactDetails.profilePicture}
              isOnline={userStatus.isOnline}
              lastSeen={userStatus.lastSeen}
              activeTab={tab}
              onTabChange={setTab}
              isFetchingUserStatus={isFetchingUserStatus}
            />
          )}

          {tab === 'chat' ? (
            <>
              <ChatsContainer
                conversationId={contactDetails._id}
                conversations={conversations}
                setConversations={setConversations}
                onSelectMessage={handleSelectMessage}
                selectedMessage={selectedMessage}
                onReply={msg => setReplyMessage(msg)}
                setUserConversationId={setUserConversationId}
                onMarkSensitive={handleMarkSensitive}
                onMarkUnsensitive={handleMarkUnsensitive}
                onDelete={handleDeleteMessage}
              />
              <SendChat
                conversationId={conversationId}
                conversations={conversations}
                setConversations={setConversations}
                receiverId={contactDetails._id}
                replyMessage={replyMessage}
                onCancelReply={() => setReplyMessage(null)}
                emitTypingStatus={emitTypingStatus}
              />
            </>
          ) : (
            <View style={styles.galleryContainer}>
              <GallerySection
                id={contactDetails?._id}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Delete Message Confirmation Dialog */}
      <CustomDialog
        visible={showDeleteDialog}
        onDismiss={handleDeleteCancel}
        title="Delete Message"
        message="Are you sure you want to delete this message?"
        icon="delete-outline"
        iconColor="#ff4444"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmButtonColor="#ff4444"
        destructive={true}
      />
    </SafeAreaView>
  );
};

export default ContactChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  keyboardContainer: {
    flex: 1,
  },
  galleryContainer: {
    flex: 1,
  },

});
