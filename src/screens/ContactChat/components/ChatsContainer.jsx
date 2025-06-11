import React, {useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';
import {getConversations} from '../../../apis/getConversations';
import {useSelector} from 'react-redux';
import MessageItem from '../../../components/Messages/MessageItem';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import useChatSocket from '../../../hooks/useChatSocket';
import PrimaryLoader from '../../../components/Loaders/PrimaryLoader';
import BlinkingDots from '../../../components/Loaders/BlinkingDots';
import {dedupeMessages} from '../../../utils/messages/dedupeMessages';

const SCROLL_TO_BOTTOM_THRESHOLD = 10;

const ChatMessageRow = ({
  item,
  index,
  showDateLabel,
  userId,
  onReply,
  onSelectMessage,
  selected,
}) => {
  const held = useSharedValue(false);
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor:
        held.value || selected ? 'rgba(210,138,140,0.13)' : 'transparent',
      transform: [{translateX: translateX.value}],
    };
  });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .onUpdate(e => {
      if (e.translationX > 0) {
        translateX.value = e.translationX > 80 ? 80 : e.translationX;
      }
    })
    .onEnd(e => {
      if (
        e.translationX > 60 &&
        Math.abs(e.translationX) > Math.abs(e.translationY)
      ) {
        translateX.value = withTiming(0, {duration: 150});
        onReply && runOnJS(onReply)(item);
      } else {
        translateX.value = withTiming(0, {duration: 150});
      }
    })
    .onFinalize(() => {
      translateX.value = withTiming(0, {duration: 150});
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(350)
    .onStart(() => {
      held.value = true;
    })
    .onEnd(() => {
      held.value = false;
      onSelectMessage && runOnJS(onSelectMessage)(item);
    })
    .onFinalize(() => {
      held.value = false;
    });

  const composedGesture = Gesture.Simultaneous(panGesture, longPressGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.fullRow, animatedStyle]}>
        <MessageItem
          item={item}
          index={index}
          showDateLabel={showDateLabel}
          userId={userId}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const ChatsContainer = ({
  conversationId,
  conversations,
  setConversations,
  onReply,
  onSelectMessage,
  selectedMessage,
  setUserConversationId,
}) => {
  const flatListRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const userId = useSelector(state => state.auth.user?.id);

  console.log('ChatsContainer mounted with conversationId:', conversations);

  const {isLoading, refetch} = useQuery({
    queryKey: ['user_conversations', conversationId],
    queryFn: async () => {
      const apiResponse = await getConversations({id: conversationId});
      if (apiResponse?.response?.success) {
        const responseData = apiResponse.response.data;
        const data = responseData?.[0]?.messages;

        setUserConversationId(responseData?.[0]?._id);
        setConversations?.(dedupeMessages(data));
        return data || [];
      } else {
        setConversations?.([]);
        return [];
      }
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!isLoading && flatListRef?.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({animated: false});
      }, 100);
    }
  }, [isLoading, conversations?.length]);

  const handleScroll = event => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const paddingToBottom = 40;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    setShowScrollToBottom(
      !isAtBottom && conversations.length > SCROLL_TO_BOTTOM_THRESHOLD,
    );
  };

  const scrollToBottom = () => {
    if (flatListRef?.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useChatSocket({
    onMessageReceived: message => {
      setConversations &&
        setConversations(prev => dedupeMessages([...(prev || []), message]));
    },
    onTypingStatusUpdate: status => {
      setIsTyping(status);
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <PrimaryLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={
          isTyping
            ? [
                ...(conversations || []),
                {_id: 'typing-indicator', isTyping: true},
              ]
            : conversations || []
        }
        keyExtractor={item => item._id || item.localId || 'typing-indicator'}
        renderItem={({item, index}) => {
          if (item.isTyping) {
            return (
              <View style={[styles.fullRow, styles.alignStart]}>
                <BlinkingDots isSender={false} />
              </View>
            );
          }
          const currentDate = new Date(item.timestamp).toDateString();
          const previousDate =
            index > 0
              ? new Date(conversations[index - 1].timestamp).toDateString()
              : null;
          const showDateLabel = index === 0 || currentDate !== previousDate;
          const isSelected =
            selectedMessage && item._id === selectedMessage._id;
          return (
            <ChatMessageRow
              item={item}
              index={index}
              showDateLabel={showDateLabel}
              userId={userId}
              onReply={onReply}
              onSelectMessage={msg => {
                if (selectedMessage && selectedMessage._id === msg._id) {
                  onSelectMessage(null);
                } else {
                  onSelectMessage(msg);
                }
              }}
              selected={isSelected}
            />
          );
        }}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (flatListRef?.current && conversations?.length > 0) {
            flatListRef.current.scrollToEnd({animated: false});
          }
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
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
  scrollToBottomBtn: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#383838',
    borderRadius: 20,
    padding: 2,
    elevation: 4,
  },
  fullRow: {
    width: '100%',
    paddingHorizontal: 0,
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'rgba(56,56,56,0.85)',
    borderRadius: 12,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  typingText: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 8,
  },
  alignStart: {
    alignItems: 'flex-start',
  },
});
