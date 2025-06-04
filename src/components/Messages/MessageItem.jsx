import {useEffect, useRef} from 'react';
import {Animated, Text, View, StyleSheet} from 'react-native';
import {formatDateLabel} from '../../utils/date/formatDateLabel';
import {formatTime} from '../../utils/time/formatTime';
import {renderMessageContent} from '../../helpers/messages/renderMessageContent';

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

  // Sender label logic
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
        {renderMessageContent(item, isSent)}
        <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
      </View>
    </Animated.View>
  );
};

export default MessageItem;

export const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 10,
    // Remove horizontal margin so highlight covers full row
  },
  messageWrapper: {
    marginBottom: 12,
    width: '100%', // Make highlight cover full row
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
    width: 180,
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
});
