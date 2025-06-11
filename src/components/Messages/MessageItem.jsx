import {useEffect, useRef} from 'react';
import {Animated, Text, View, StyleSheet} from 'react-native';
import {formatDateLabel} from '../../utils/date/formatDateLabel';
import {formatTime} from '../../utils/time/formatTime';
import RenderMessageContent from './RenderMessageContent';
import Icon from 'react-native-vector-icons/Ionicons';

const MessageItem = ({
  item,
  index,
  showDateLabel,
  userId,
  showSenderLabel = false,
}) => {
  const isSent = item.sender._id === userId;
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
    <Animated.View style={[styles.messageWrapper, {opacity: fadeAnim}]}>
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
        <RenderMessageContent item={item} isSent={isSent} />
        <View style={styles.timeStatusRow}>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
          {isSent && <TickIcon status={item.status} anim={fadeAnim} />}
        </View>
      </View>
    </Animated.View>
  );
};

export default MessageItem;

export const TickIcon = ({status, anim}) => {
  if (status === 'read') {
    return (
      <Animated.View style={{opacity: anim}}>
        <Icon name="checkmark-done" size={16} color="#4BB543" />
      </Animated.View>
    );
  } else if (status === 'delivered') {
    return (
      <Animated.View style={{opacity: anim}}>
        <Icon name="checkmark-done" size={16} color="#bbb" />
      </Animated.View>
    );
  } else if (status === 'sent' || status === 'unread') {
    return (
      <Animated.View style={{opacity: anim}}>
        <Icon name="checkmark" size={16} color="#bbb" />
      </Animated.View>
    );
  }
  return null;
};

export const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 10,
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
  },
  receivedText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 12,
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
});
