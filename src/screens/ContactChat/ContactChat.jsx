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
import React, {useState} from 'react';
import ChatsContainer from './components/ChatsContainer';
import ContactHeader from './components/ContactHeader';
import SendChat from './components/SendChat';
import {useRoute} from '@react-navigation/native';
import {getChatDisplayInfo} from '../../utils/chat/getChatDisplayInfo';
import {useSelector} from 'react-redux';
import SelectedMessageBar from './components/SelectedMessageBar';
import Clipboard from '@react-native-clipboard/clipboard';
import GallerySection from './components/GallerySection';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useChatSocket from './components/ChatsContainer';

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

  // Add typing indicator socket logic
  const {emitTypingStatus} = useChatSocket({
    onMessageReceived: message => {
      setConversations(prev => [...(prev || []), message]);
    },
    onTypingStatusUpdate: status => {
      // Optionally, you can handle a global typing indicator here if needed
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
            name={contactDetails.name}
            username={contactDetails.username}
            profilePicture={contactDetails.profilePicture}
            activeTab={tab}
            onTabChange={setTab}
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
                    source={{uri: previewedMedia.url}}
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
