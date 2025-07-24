import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Text,
  AppState,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { sendMessage } from '../../../apis/sendMessage';
import { useSelector, useDispatch } from 'react-redux';
import { prepareMessagePayload } from '../../../helpers/messages/prepareMessagePayload';
import { selectFiles } from '../../../helpers/files/selectFiles';
import { uploadFiles } from '../../../helpers/files/uploadFiles';
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
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // Get current gallery state for total calculation
  const currentGalleryTotal = useSelector(state => state.gallery.total);

  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [captions, setCaptions] = useState({});
  const [activeFileIdx, setActiveFileIdx] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [messageQueue, setMessageQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const isMountedRef = useRef(true);

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

  const processMessageQueue = useCallback(async () => {
    if (isProcessingQueue) {
      return;
    }

    setIsProcessingQueue(true);

    try {
      const currentQueue = [...messageQueue];

      if (currentQueue.length === 0) {
        setIsProcessingQueue(false);
        return;
      }

      // Clear the queue immediately
      setMessageQueue([]);

      // Process all items in the queue
      for (const queueItem of currentQueue) {
        if (queueItem.type === 'text') {
          await processTextMessage(queueItem);
        } else if (queueItem.type === 'file') {
          await processFileMessage(queueItem);
        }
      }

      setIsProcessingQueue(false);
    } catch (error) {
      console.error('Error processing message queue:', error);
      setIsProcessingQueue(false);
    }
  }, [isProcessingQueue, messageQueue, processTextMessage, processFileMessage]);

  const processTextMessage = useCallback(async (queueItem) => {
    const { messageText, replyMessage: replyMsg } = queueItem;

    const payloads = prepareMessagePayload({
      text: messageText,
      files: [],
      senderId: userId,
      receiverId,
      replyTo: replyMsg?._id || replyMsg?.id || undefined,
    });

    for (const payload of payloads) {
      const optimisticMessage = {
        _id: `temp_${Date.now()}_${Math.random()}`,
        content: messageText,
        type: 'text',
        sender: { _id: userId, name: reduxUser?.name },
        receiver: { _id: receiverId },
        timestamp: new Date().toISOString(),
        status: 'sending',
        ...(replyMsg && { replyTo: replyMsg }),
      };

      // Add optimistic message immediately
      try {
        setConversations(prev =>
          dedupeMessages([...(prev || []), optimisticMessage]),
        );

        // Play sound and haptic feedback immediately
        playSoundEffect('send');
        ReactNativeHapticFeedback.trigger('impactLight');

        const apiResponse = await sendMessage({ payload });
        if (apiResponse?.response?.success) {
          const response = apiResponse.response.data
          console.log("RESPONSE", response, conversations?.reverse()?.slice(0, 10), optimisticMessage._id)
          setConversations(prev =>
            prev.map(msg =>
              msg._id === optimisticMessage._id
                ? { ...response, status: 'sent' }
                : msg
            ),
          );

        } else {
          setConversations(prev =>
            prev.map(msg =>
              msg._id === optimisticMessage._id
                ? { ...msg, status: 'failed' }
                : msg
            ),
          );
        }


      } catch (error) {
        console.error('Error processing text message:', error);
        try {
          setConversations(prev =>
            prev.map(msg =>
              msg._id === optimisticMessage._id
                ? { ...msg, status: 'failed' }
                : msg
            ),
          );

        } catch (stateError) {
          console.error('Error updating message status:', stateError);
        }
      }
    }
  }, [userId, receiverId, reduxUser?.name, setConversations]);

  const processFileMessage = useCallback(async (queueItem) => {
    const { file, replyMessage: replyMsg } = queueItem;

    // Upload file first
    const uploadedFiles = await uploadFiles([file]);
    const uploadedFile = uploadedFiles[0];

    if (!uploadedFile) {
      console.error('Failed to upload file');
      return;
    }

    const payload = prepareMessagePayload({
      text: file.caption || '',
      files: [uploadedFile],
      senderId: userId,
      receiverId,
      replyTo: replyMsg?._id || replyMsg?.id || undefined,
    })[0];

    // Create optimistic message for file
    const optimisticMessage = {
      _id: `temp_${Date.now()}_${Math.random()}`,
      content: file.caption || '',
      type: uploadedFile.fileType.startsWith('image') ? 'image' : 'file',
      mediaUrl: uploadedFile.url,
      sender: { _id: userId, name: reduxUser?.name },
      receiver: { _id: receiverId },
      timestamp: new Date().toISOString(),
      status: 'sending',
      meta: {
        originalName: uploadedFile.originalName,
        fileType: uploadedFile.fileType,
        fileSize: uploadedFile.fileSize,
      },
      ...(replyMsg && { replyTo: replyMsg }),
    };

    // Add optimistic message immediately
    try {
      if (isMountedRef.current && setConversations) {
        setConversations(prev =>
          dedupeMessages([...(prev || []), optimisticMessage]),
        );
      }

      // Play sound and haptic feedback immediately
      playSoundEffect('send');
      ReactNativeHapticFeedback.trigger('impactLight');

      // Send to API
      const apiResponse = await sendMessage({ payload });

      if (apiResponse?.response?.success) {
        // Replace optimistic message with real message
        if (isMountedRef.current && setConversations) {
          setConversations(prev =>
            prev.map(msg =>
              msg._id === optimisticMessage._id
                ? { ...apiResponse.response.data, status: 'sent' }
                : msg
            ),
          );
        }

        const newMediaItem = apiResponse.response.data;

        if (newMediaItem && newMediaItem.type === 'image') {
          dispatch(appendGalleryData({
            data: [newMediaItem],
            total: currentGalleryTotal + 1,
            page: 1,
            per_page: 50
          }));
        }
      } else {
        // Mark as failed
        if (isMountedRef.current && setConversations) {
          setConversations(prev =>
            prev.map(msg =>
              msg._id === optimisticMessage._id
                ? { ...msg, status: 'failed' }
                : msg
            ),
          );
        }
        console.error(
          'Failed to send file message:',
          apiResponse?.response?.message,
        );
      }
    } catch (error) {
      console.error('Error processing file message:', error);
      // Mark as failed if there's an error
      try {
        if (isMountedRef.current && setConversations) {
          setConversations(prev =>
            prev.map(msg =>
              msg._id === optimisticMessage._id
                ? { ...msg, status: 'failed' }
                : msg
            ),
          );
        }
      } catch (stateError) {
        console.error('Error updating file message status:', stateError);
      }
    }
  }, [userId, receiverId, reduxUser?.name, setConversations, dispatch, currentGalleryTotal]);

  const handleRetryMessage = async (failedMessage) => {
    try {
      // Update status to sending
      setConversations &&
        setConversations(prev =>
          prev.map(msg =>
            msg._id === failedMessage._id
              ? { ...msg, status: 'sending' }
              : msg
          ),
        );

      // Prepare payload based on message type
      let payload;
      if (failedMessage.type === 'text') {
        payload = prepareMessagePayload({
          text: failedMessage.content,
          files: [],
          senderId: userId,
          receiverId,
          replyTo: failedMessage.replyTo,
        })[0];
      } else {
        // For media messages, we need to re-upload the file
        // This is a simplified retry - in a real app you might want to store the original file
        console.log('Retry for media messages not implemented yet');
        return;
      }

      // Send to API
      const apiResponse = await sendMessage({ payload });
      if (apiResponse?.response?.success) {
        // Replace with real message
        setConversations &&
          setConversations(prev =>
            prev.map(msg =>
              msg._id === failedMessage._id
                ? { ...apiResponse.response.data, status: 'sent' }
                : msg
            ),
          );
      } else {
        // Mark as failed again
        setConversations &&
          setConversations(prev =>
            prev.map(msg =>
              msg._id === failedMessage._id
                ? { ...msg, status: 'failed' }
                : msg
            ),
          );
        console.error(
          'Failed to retry message:',
          apiResponse?.response?.message,
        );
      }
    } catch (error) {
      // Mark as failed
      setConversations &&
        setConversations(prev =>
          prev.map(msg =>
            msg._id === failedMessage._id
              ? { ...msg, status: 'failed' }
              : msg
          ),
        );
      console.error('Error retrying message:', error);
    }
  };

  const handleSend = async () => {
    emitTypingStatus(false, conversationId, receiverId);

    if ((!message.trim() && selectedFiles.length === 0)) {
      return;
    }

    // Clear input immediately
    const currentMessage = message;
    const currentSelectedFiles = [...selectedFiles];
    const currentCaptions = { ...captions };
    const currentReplyMessage = replyMessage;

    setMessage('');
    setSelectedFiles([]);
    setCaptions({});
    setActiveFileIdx(null);
    if (replyMessage && onCancelReply) {
      onCancelReply();
    }

    // Add messages to queue
    const newQueueItems = [];

    // Add text message to queue if there's text and no files
    if (currentSelectedFiles.length === 0 && currentMessage.trim()) {
      newQueueItems.push({
        type: 'text',
        messageText: currentMessage,
        replyMessage: currentReplyMessage,
      });
    }

    // Add file messages to queue
    if (currentSelectedFiles.length > 0) {
      for (let i = 0; i < currentSelectedFiles.length; i++) {
        const file = currentSelectedFiles[i];
        newQueueItems.push({
          type: 'file',
          file: {
            ...file,
            caption: currentCaptions[i] || '',
          },
          replyMessage: currentReplyMessage,
        });
      }
    }

    // Add to queue
    setMessageQueue(prev => [...prev, ...newQueueItems]);
  };

  // Auto-process queue when new items are added
  useEffect(() => {
    if (messageQueue.length > 0 && !isProcessingQueue) {
      processMessageQueue();
    }
  }, [messageQueue.length, isProcessingQueue, processMessageQueue]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (emitTypingStatus) {
          emitTypingStatus(false, conversationId, receiverId);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      isMountedRef.current = false;
      subscription?.remove();
      if (emitTypingStatus) {
        emitTypingStatus(false, conversationId, receiverId);
      }
    };
  }, [emitTypingStatus, conversationId, receiverId]);

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
      onBlur={() => {
        if (emitTypingStatus) {
          emitTypingStatus(false, conversationId, receiverId);
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
          onPress={handleSend}>
          <Icon name="send" size={24} color="#fff" />
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
