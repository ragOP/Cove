import React, {useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {messages} from '../../../utils/testing/messages';
import {formatTime} from '../../../utils/time/formatTime';
import {formatDateLabel} from '../../../utils/date/formatDateLabel';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const SCROLL_TO_BOTTOM_THRESHOLD = 10;

const MessageItem = ({item, index, showDateLabel}) => {
  const isSent = item.type === 'sent';
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      // delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

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
        <Text style={isSent ? styles.sentText : styles.receivedText}>
          {item.text}
        </Text>
        <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
      </View>
    </Animated.View>
  );
};

const ChatsContainer = () => {
  const flatListRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom on mount (no animation)
  useEffect(() => {
    if (!loading && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({animated: false});
      }, 100);
    }
  }, [loading]);

  // Show scroll-to-bottom icon if not at bottom
  const handleScroll = event => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const paddingToBottom = 40;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    setShowScrollToBottom(
      !isAtBottom && messages.length > SCROLL_TO_BOTTOM_THRESHOLD,
    );
  };

  // Scroll to bottom when icon pressed (with animation)
  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        ref={flatListRef}
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
            <MessageItem
              item={item}
              index={index}
              showDateLabel={showDateLabel}
            />
          );
        }}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({animated: false});
          }
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      {showScrollToBottom && (
        <TouchableOpacity
          style={styles.scrollToBottomBtn}
          onPress={scrollToBottom}>
          <Icon name="chevron-down-circle" size={36} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ChatsContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  messageContainer: {
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
    marginBottom: 8,
  },
  dateLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollToBottomBtn: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#383838',
    borderRadius: 20,
    padding: 2,
    elevation: 4,
  },
});
