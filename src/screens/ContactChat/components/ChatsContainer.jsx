import React from 'react';
import {StyleSheet, View, Text, Animated, FlatList} from 'react-native';
import {messages} from '../../../utils/testing/messages';
import {formatTime} from '../../../utils/time/formatTime';
import {formatDateLabel} from '../../../utils/date/formatDateLabel';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const MessageItem = ({item, index}) => {
  const isSent = item.type === 'sent';
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isSent ? styles.sentMessage : styles.receivedMessage,
        {opacity: fadeAnim},
      ]}>
      <Text style={isSent ? styles.sentText : styles.receivedText}>
        {item.text}
      </Text>
      <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
    </Animated.View>
  );
};

const ChatsContainer = () => {
  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => {
          const currentDate = new Date(item.timestamp).toDateString();
          const previousDate =
            index > 0
              ? new Date(messages[index - 1].timestamp).toDateString()
              : null;
          const showDateLabel = index === 0 || currentDate !== previousDate;

          return (
            <>
              {showDateLabel && (
                <View style={styles.dateLabelContainer}>
                  <Text style={styles.dateLabelText}>
                    {formatDateLabel(item.timestamp)}
                  </Text>
                </View>
              )}
              <MessageItem item={item} index={index} />
            </>
          );
        }}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ChatsContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
    borderRadius: 18,
    padding: 10,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#7b585a',
    borderBottomRightRadius: 0,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    borderBottomLeftRadius: 0,
  },
  sentText: {
    color: '#fff',
    fontSize: 14,
  },
  receivedText: {
    color: '#fff',
    fontSize: 14,
  },
  timeText: {
    fontSize: 10,
    color: '#ddd',
    textAlign: 'right',
    marginTop: 4,
  },
  dateLabelContainer: {
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
