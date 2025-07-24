import { useEffect, useRef, memo } from 'react';
import { Animated, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDateLabel } from '../../utils/date/formatDateLabel';
import { formatTime } from '../../utils/time/formatTime';
import RenderMessageContent from './RenderMessageContent';
import Icon from 'react-native-vector-icons/Ionicons';

const MessageItem = memo(({
  item,
  conversationId,
  index,
  showDateLabel,
  userId,
  showSenderLabel = false,
  onMarkSensitive,
  onMarkUnsensitive,
  onDelete,
  onRetry,
}) => {
  const isSent = item?.sender?._id === userId;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  let senderLabel = null;

  if (showSenderLabel) {
    senderLabel = (
      <Text style={styles.senderLabel}>
        {isSent ? 'You: ' : item.sender?.name ? item.sender.name + ': ' : ''}
      </Text>
    );
  }

  return (
    <Animated.View style={[styles.messageWrapper, { opacity: fadeAnim }]}>
      {showDateLabel && (
        <View style={styles.dateLabelContainer}>
          <Text style={styles.dateLabelText}>
            {formatDateLabel(item.timestamp)}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.messageContainer,
          isSent ? styles.sentMessage : styles.receivedMessage,
        ]}>
        <RenderMessageContent
          item={item}
          conversationId={conversationId}
          isSent={isSent}
          onMarkSensitive={onMarkSensitive}
          onMarkUnsensitive={onMarkUnsensitive}
          onDelete={onDelete}
        />
        <View style={styles.timeStatusRow}>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
          {isSent && <TickIcon status={item.status} anim={fadeAnim} />}
          {isSent && item.status === 'failed' && onRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => onRetry(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="refresh" size={14} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
});

export default MessageItem;

export const TickIcon = ({ status, anim }) => {
  if (status === 'read') {
    return (
      <Animated.View style={{ opacity: anim }}>
        <Icon name="checkmark-done" size={16} color="#4BB543" />
      </Animated.View>
    );
  } else if (status === 'delivered') {
    return (
      <Animated.View style={{ opacity: anim }}>
        <Icon name="checkmark-done" size={16} color="#bbb" />
      </Animated.View>
    );
  } else if (status === 'sent' || status === 'unread') {
    // Treat both sent and unread as delivered since all messages are at least delivered
    return (
      <Animated.View style={{ opacity: anim }}>
        <Icon name="checkmark-done" size={16} color="#bbb" />
      </Animated.View>
    );
  } else if (status === 'sending') {
    return (
      <Animated.View style={{ opacity: anim }}>
        <Icon name="time-outline" size={16} color="#ffb300" />
      </Animated.View>
    );
  } else if (status === 'failed') {
    return (
      <Animated.View style={{ opacity: anim }}>
        <Icon name="close-circle" size={16} color="#ff4444" />
      </Animated.View>
    );
  } else {
    return (
      <Animated.View style={{ opacity: anim }}>
        <Icon name="checkmark-done" size={16} color="#bbb" />
      </Animated.View>
    );
  }
};

export const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 10,
    minHeight: 0,
    flexShrink: 1,
    alignSelf: 'stretch',
  },
  messageWrapper: {
    marginBottom: 12,
    width: '100%',
  },
  senderLabel: {
    color: '#D28A8C',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    borderBottomLeftRadius: 0,
  },
  dateLabelContainer: {
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  dateLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#7b585a',
    borderBottomRightRadius: 0,
  },
  sentText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 12,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  receivedText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 12,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  imageMessage: {
    width: 240,
    height: 180,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#222',
  },
  videoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#ddd',
    textAlign: 'right',
    marginTop: 4,
  },
  timeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  retryButton: {
    padding: 2,
    marginLeft: 4,
  },
  protectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#D28A8C',
    borderRadius: 10,
    padding: 4,
    zIndex: 1,
  },
});
