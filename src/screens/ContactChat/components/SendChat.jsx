import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { sendMessage } from '../../../apis/sendMessage';
import { useSelector, useDispatch } from 'react-redux';
import { prepareMessagePayload } from '../../../helpers/messages/prepareMessagePayload';
import { selectFiles } from '../../../helpers/files/selectFiles';
import { uploadFiles } from '../../../helpers/files/uploadFiles';
import PrimaryLoader from '../../../components/Loaders/PrimaryLoader';
import { dedupeMessages } from '../../../utils/messages/dedupeMessages';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { playSoundEffect } from '../../../utils/sound';
import MediaPreview from '../../../components/MediaPreview/MediaPreview';
import { selectUser } from '../../../redux/slice/authSlice';
import { useQueryClient } from '@tanstack/react-query';
import { appendGalleryData } from '../../../redux/slice/gallerySlice';

const SendChat = ({
  conversationId,
  conversations,
  setConversations,
  receiverId,
  replyMessage,
  onCancelReply,
  emitTypingStatus,
}) => {
  const reduxUser = useSelector(selectUser);
  const userId = reduxUser?.id;
  const queryClient = useQueryClient(); // Add this for cache invalidation
  const dispatch = useDispatch(); // Add this for Redux state updates

  // Get current gallery state for total calculation
  const currentGalleryTotal = useSelector(state => state.gallery.total);

  console.log("userId >>>", userId)

  const [message, setMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [captions, setCaptions] = useState({});
  const [activeFileIdx, setActiveFileIdx] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const handleSelectFiles = async () => {
    try {
      const files = await selectFiles();
      if (files && files.length > 0) {
        const limitedFiles = files.slice(0, 5);
        setSelectedFiles(limitedFiles);
        setCaptions({});
        setActiveFileIdx(limitedFiles.length - 1);
      }
    } catch (err) {
      console.error('File selection error:', err);
    }
  };

  const handleRemoveFile = idx => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== idx);
      if (activeFileIdx === idx) {
        setActiveFileIdx(newFiles.length ? Math.max(0, idx - 1) : null);
      } else if (activeFileIdx > idx) {
        setActiveFileIdx(activeFileIdx - 1);
      }
      return newFiles;
    });
    setCaptions(prev => {
      const newCaptions = { ...prev };
      delete newCaptions[idx];
      const shifted = {};
      Object.keys(newCaptions).forEach(key => {
        const k = parseInt(key, 10);
        shifted[k < idx ? k : k - 1] = newCaptions[key];
      });
      return shifted;
    });
  };

  const handleCaptionChange = text => {
    if (activeFileIdx !== null) {
      setCaptions(prev => ({ ...prev, [activeFileIdx]: text }));
    } else {
      setMessage(text);
    }
  };

  const handleSend = async () => {
    emitTypingStatus(false, conversationId, receiverId);

    if (isSendingMessage) {
      return;
    }
    if ((!message.trim() && selectedFiles.length === 0) || isSendingMessage) {
      return;
    }
    setIsSendingMessage(true);
    setUploading(true);
    let uploadedFiles = [];

    try {
      // Upload files if any
      if (selectedFiles.length > 0) {
        uploadedFiles = await uploadFiles(selectedFiles);
        uploadedFiles = uploadedFiles.map((file, idx) => ({
          ...file,
          caption: captions[idx] || '',
        }));
      }
      setUploading(false);

      // Send text message if there's text and no files
      if (selectedFiles.length === 0 && message.trim()) {
        const payloads = prepareMessagePayload({
          text: message,
          files: [],
          senderId: userId,
          receiverId,
          replyTo: replyMessage?._id || replyMessage?.id || undefined,
        });

        for (const payload of payloads) {
          const apiResponse = await sendMessage({ payload });
          if (apiResponse?.response?.success) {
            setConversations &&
              setConversations(prev =>
                dedupeMessages([...(prev || []), apiResponse.response.data]),
              );
            playSoundEffect('send');
            ReactNativeHapticFeedback.trigger('impactLight');
          } else {
            console.error(
              'Failed to send message:',
              apiResponse?.response?.message,
            );
          }
        }
      }

      if (uploadedFiles.length > 0) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          const file = uploadedFiles[i];
          const payload = prepareMessagePayload({
            text: file.caption || '',
            files: [file],
            senderId: userId,
            receiverId,
            replyTo: replyMessage?._id || replyMessage?.id || undefined,
          })[0];

          const apiResponse = await sendMessage({ payload });

          if (apiResponse?.response?.success) {
            setConversations &&
              setConversations(prev =>
                dedupeMessages([...(prev || []), apiResponse.response.data]),
              );
            playSoundEffect('send');
            ReactNativeHapticFeedback.trigger('impactLight');

            const newMediaItem = apiResponse.response.data;
            console.log("newMediaItem >>>", newMediaItem)
            if (newMediaItem && newMediaItem.type === 'image') {
              console.log("2222 >>>", currentGalleryTotal)
              dispatch(appendGalleryData({
                data: [newMediaItem],
                total: currentGalleryTotal + 1,
                page: 1,
                per_page: 50
              }));
            }
          } else {
            console.error(
              'Failed to send file message:',
              apiResponse?.response?.message,
            );
          }
        }
      }

      if (uploadedFiles.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['gallery', receiverId] });
      }

      // Reset form
      setMessage('');
      setSelectedFiles([]);
      setCaptions({});
      setActiveFileIdx(null);
      if (replyMessage && onCancelReply) {
        onCancelReply();
      }
    } catch (error) {
      setUploading(false);
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const renderFilePreviews = () => {
    if (!selectedFiles.length) {
      return null;
    }
    return (
      <ScrollView horizontal style={styles.previewContainer}>
        {selectedFiles.map((file, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.previewItem,
              activeFileIdx === idx && styles.activePreviewItem,
            ]}
            onPress={() => {
              setActiveFileIdx(idx);
              if (file.type && file.type.startsWith('image')) {
                setMediaPreview({ type: 'image', uri: file.uri });
              } else if (file.type && file.type.startsWith('video')) {
                setMediaPreview({ type: 'video', uri: file.uri });
              }
            }}
            activeOpacity={0.8}>
            {file.type && file.type.startsWith('image') ? (
              <Image source={{ uri: file.uri }} style={styles.previewImage} />
            ) : (
              <Icon name="document" size={32} color="#fff" />
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={e => {
                e.stopPropagation && e.stopPropagation();
                handleRemoveFile(idx);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
              <Icon name="close-circle" size={24} color="#f55" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <MediaPreview
          visible={!!mediaPreview}
          media={mediaPreview}
          onClose={() => setMediaPreview(null)}
        />
      </ScrollView>
    );
  };

  const renderReplyPreview = () => {
    if (!replyMessage) {
      return null;
    }
    const isImage = replyMessage.type === 'image' && replyMessage.content;
    const isSent = replyMessage.sender?._id === userId;
    const senderLabel = isSent ? 'You' : replyMessage.sender?.name || 'User';

    const replyBarBg = isSent
      ? 'rgba(210,138,140,0.18)'
      : 'rgba(120,88,90,0.18)';

    const replyBarBorder = isSent ? '#D28A8C' : '#7b585a';
    const replyLabelColor = isSent ? '#D28A8C' : '#7b585a';

    return (
      <View
        style={[
          styles.replyPreviewBar,
          { backgroundColor: replyBarBg, borderLeftColor: replyBarBorder },
        ]}>
        <View
          style={[styles.replyIndicator, { backgroundColor: replyBarBorder }]}
        />
        <View style={styles.replyContent}>
          <Text
            style={[styles.replyLabel, { color: replyLabelColor }]}
            numberOfLines={1}>
            {senderLabel}
          </Text>
          <View style={styles.replyRow}>
            {isImage && (
              <Image
                source={{ uri: replyMessage.content }}
                style={styles.replyThumb}
              />
            )}
            <Text
              style={[styles.replyText, isImage && styles.replyTextWithImage]}
              numberOfLines={1}>
              {replyMessage.text || replyMessage.content || '[Media]'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.replyCloseBtn} onPress={onCancelReply}>
          <Icon name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Main message/caption input
  const renderMainInput = () => (
    <TextInput
      style={styles.input}
      placeholder={
        selectedFiles.length > 0 ? 'Add a caption...' : 'Type a message'
      }
      placeholderTextColor="#bbb"
      value={
        selectedFiles.length > 0 && activeFileIdx !== null
          ? captions[activeFileIdx] || ''
          : message
      }
      onChangeText={text => {
        handleCaptionChange(text);
        if (emitTypingStatus) {
          emitTypingStatus(!!text && text.trim().length > 0, conversationId, receiverId);
        }
      }}
      selectionColor="#fff"
      returnKeyType="send"
      autoFocus={false}
      multiline
    />
  );

  return (
    <View>
      {replyMessage && renderReplyPreview()}
      {renderFilePreviews()}
      <View style={styles.container}>
        {renderMainInput()}
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="mic" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleSend}
          disabled={isSendingMessage || uploading}>
          {isSendingMessage || uploading ? (
            <PrimaryLoader size={20} />
          ) : (
            <Icon name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleSelectFiles}>
          <Icon name="add-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SendChat;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#383838',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  iconButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 4,
  },
  previewItem: {
    position: 'relative',
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    padding: 2,
    backgroundColor: '#222',
  },
  activePreviewItem: {
    borderColor: '#4BB543',
    backgroundColor: '#333',
  },
  previewImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  captionInput: {
    marginTop: 4,
    minWidth: 60,
    maxWidth: 100,
    color: '#fff',
    fontSize: 13,
    backgroundColor: '#222',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  replyPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(210,138,140,0.18)',
    borderLeftWidth: 4,
    borderLeftColor: '#D28A8C',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 12,
    marginTop: 4,
    borderRadius: 8,
    marginBottom: 2,
  },
  replyIndicator: {
    width: 4,
    height: 36,
    backgroundColor: '#D28A8C',
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  replyLabel: {
    color: '#D28A8C',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  replyText: {
    color: '#fff',
    fontSize: 14,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyThumb: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 4,
    backgroundColor: '#222',
  },
  replyTextWithImage: {
    marginLeft: 6,
  },
  replyCloseBtn: {
    marginLeft: 8,
    padding: 4,
  },
});
