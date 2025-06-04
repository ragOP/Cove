import {KeyboardAvoidingView, Platform, StyleSheet, View, ActivityIndicator, Modal, Pressable} from 'react-native';
import React, {useEffect, useState} from 'react';
import ChatsContainer from './components/ChatsContainer';
import ContactHeader from './components/ContactHeader';
import SendChat from './components/SendChat';
import {useRoute} from '@react-navigation/native';
import {getChatDisplayInfo} from '../../utils/chat/getChatDisplayInfo';
import {useSelector} from 'react-redux';
import SelectedMessageBar from './components/SelectedMessageBar';
import Clipboard from '@react-native-clipboard/clipboard';
import GallerySection from './components/GallerySection';
import {getUserMedia} from '../../apis/userMedia';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const [tab, setTab] = useState('chat'); // 'chat' or 'gallery'
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [previewedMedia, setPreviewedMedia] = useState(null);

  // Fetch gallery media when tab changes to gallery
  useEffect(() => {
    if (tab === 'gallery' && galleryMedia.length === 0) {
      setGalleryLoading(true);
      getUserMedia({ userId: contactDetails._id })
        .then(setGalleryMedia)
        .finally(() => setGalleryLoading(false));
    }
  }, [tab, contactDetails._id, galleryMedia.length]);

  // Handler for selecting a message (on long press)
  const handleSelectMessage = msg => setSelectedMessage(msg);
  const handleClearSelected = () => setSelectedMessage(null);
  const handleCopySelected = msg => Clipboard.setString(msg.content || '');
  const handleReplySelected = msg => {
    setReplyMessage(msg);
    handleClearSelected();
  }; // Implement reply logic as needed
  const handleDeleteSelected = msg => handleClearSelected(); // Implement delete logic as needed

  if (!contactDetails) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <View style={styles.container}>
        {/* Header and toggle always visible */}
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
        {/* Main content: only swap chat/gallery area */}
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
            />
          </>
        ) : (
          <View style={styles.galleryContainer}>
            {galleryLoading ? (
              <View style={styles.galleryLoading}>
                <ActivityIndicator size="large" color="#D28A8C" />
              </View>
            ) : (
              <GallerySection media={galleryMedia} onMediaPress={setPreviewedMedia} />
            )}
            {/* Full image preview modal */}
            {previewedMedia && previewedMedia.type === 'image' && (
              <Modal
                visible={!!previewedMedia}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewedMedia(null)}
              >
                <Pressable style={styles.previewOverlay} onPress={() => setPreviewedMedia(null)}>
                  <Image
                    source={{ uri: previewedMedia.url }}
                    style={styles.fullPreviewImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity style={styles.previewCloseBtn} onPress={() => setPreviewedMedia(null)}>
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
