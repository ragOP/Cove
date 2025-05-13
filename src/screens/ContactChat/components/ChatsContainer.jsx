import React from 'react';
import {StyleSheet, View, Text, Animated} from 'react-native';
import ContactHeader from './ContactHeader';

const messages = [
  {
    id: '1',
    type: 'sent',
    text: 'Hello! Are you coming to the party?',
    time: '8:00PM',
  },
  {
    id: '2',
    type: 'received',
    text: 'Yes, I will be there in 10 minutes.',
    time: '8:01PM',
  },
  {
    id: '3',
    type: 'sent',
    text: 'Awesome! See you soon.',
    time: '8:02PM',
  },
  {
    id: '4',
    type: 'received',
    text: 'Do you want me to bring anything?',
    time: '8:03PM',
  },
  {
    id: '5',
    type: 'sent',
    text: 'No, just bring yourself!',
    time: '8:04PM',
  },
  {
    id: '6',
    type: 'received',
    text: 'Haha, okay! 😊',
    time: '8:05PM',
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(
  require('react-native').FlatList,
);

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
      <Text style={styles.timeText}>{item.time}</Text>
    </Animated.View>
  );
};

const ChatsContainer = () => {
  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <MessageItem item={item} index={index} />
        )}
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
});
