import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import {useRef, useState, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import ChatsContainer from './components/ChatsContainer';
import ContactHeader from './components/ContactHeader';
import SendChat from './components/SendChat';
import {getChatDisplayInfo} from '../../utils/chat/getChatDisplayInfo';
import {useSelector} from 'react-redux';
import SelectedMessageBar from './components/SelectedMessageBar';
import Clipboard from '@react-native-clipboard/clipboard';
import GallerySection from './components/GallerySection';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useChatSocket from '../../hooks/useChatSocket';
import {dedupeMessages} from '../../utils/messages/dedupeMessages';
import {useQuery} from '@tanstack/react-query';
import {readChat} from '../../apis/readChat';
import {getUserInfo} from '../../apis/getUserInfo';

const ContactChat = () => {
  const route = useRoute();
  const reduxAuth = useSelector(state => state.auth);
  const userId = reduxAuth.user?.id;

  const contact = route.params?.contact;
  const conversationId = contact?._id;

  const contactDetails = getChatDisplayInfo(contact, userId);

  const [conversations, setConversations] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [tab, setTab] = useState('chat');
  const [previewedMedia, setPreviewedMedia] = useState(null);
  const [userConversationId, setUserConversationId] = useState(null);
  const [userStatus, setUserStatus] = useState({
    isOnline: false,
    lastSeen: null,
  });
  const [isFetchingUserStatus, setIsFetchingUserStatus] = useState(false);

  useEffect(() => {
    if (!contact?._id) {
      return;
    }
    const fetchUserInfo = async () => {
      try {
        setIsFetchingUserStatus(true);
        const apiResponse = await getUserInfo({userId: contact._id});
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
  }, [contact?._id]);

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
          ? {...msg, read: true, readBy: data.readBy, readAt: data.timestamp}
          : msg,
      );
    });
  };

  const {emitTypingStatus, joinChat, leaveChat} = useChatSocket({
    onMessageReceived: message => {
      setConversations(prev => dedupeMessages([...(prev || []), message]));
    },
    onUpdateMessagesStatus,
    onUpdateUserStatus: status => {
      console.log('User status updated:', status);
      setUserStatus({
        isOnline: status.isOnline,
        lastSeen: status.lastSeen,
      });
    },
  });

  const handleSelectMessage = msg => setSelectedMessage(msg);
  const handleClearSelected = () => setSelectedMessage(null);
  const handleCopySelected = msg => Clipboard.setString(msg.content || '');
  const handleReplySelected = msg => {
    setReplyMessage(msg);
    handleClearSelected();
  };
  const handleDeleteSelected = msg => handleClearSelected();

  useQuery({
    queryKey: ['read_chat', userConversationId],
    queryFn: async () => {
      if (userConversationId) {
        return readChat({conversationId: userConversationId});
      }
    },
    enabled: !!userConversationId,
  });

  useEffect(() => {
    joinChat(conversationId, userId, contactDetails?._id);

    return () => {
      leaveChat(conversationId, userId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  if (!contactDetails) {
    return null;
  }

  return (
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
              onMediaPress={setPreviewedMedia}
              id={contactDetails._id}
            />

            {previewedMedia && previewedMedia.type === 'image' && (
              <Modal
                visible={!!previewedMedia}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewedMedia(null)}>
                <Pressable
                  style={styles.previewOverlay}
                  onPress={() => setPreviewedMedia(null)}>
                  <Image
                    source={{uri: previewedMedia.mediaUrl}}
                    style={styles.fullPreviewImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.previewCloseBtn}
                    onPress={() => setPreviewedMedia(null)}>
                    <Icon name="close" size={32} color="#fff" />
                  </TouchableOpacity>
                </Pressable>
              </Modal>
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
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
  galleryLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullPreviewImage: {
    width: '96%',
    height: '80%',
    borderRadius: 16,
    backgroundColor: '#222',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 36,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
});
