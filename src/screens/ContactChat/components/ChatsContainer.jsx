import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getConversations } from '../../../apis/getConversations';
import { useSelector } from 'react-redux';
import MessageItem from '../../../components/Messages/MessageItem';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import useChatSocket from '../../../hooks/useChatSocket';
import PrimaryLoader from '../../../components/Loaders/PrimaryLoader';
import BlinkingDots from '../../../components/Loaders/BlinkingDots';
import { dedupeMessages } from '../../../utils/messages/dedupeMessages';

const SCROLL_TO_BOTTOM_THRESHOLD = 10;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const ChatMessageRow = ({
  item,
  index,
  showDateLabel,
  userId,
  onReply,
  onSelectMessage,
  selected,
  onMarkSensitive,
  onMarkUnsensitive,
  onDelete,
}) => {
  const held = useSharedValue(false);
  const translateX = useSharedValue(0);


  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor:
        held.value || selected ? 'rgba(210,138,140,0.13)' : 'transparent',
      transform: [{ translateX: translateX.value }],
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
        translateX.value = withTiming(0, { duration: 150 });
        onReply && runOnJS(onReply)(item);
      } else {
        translateX.value = withTiming(0, { duration: 150 });
      }
    })
    .onFinalize(() => {
      translateX.value = withTiming(0, { duration: 150 });
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
          onMarkSensitive={onMarkSensitive}
          onMarkUnsensitive={onMarkUnsensitive}
          onDelete={onDelete}
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
  onLoadMore,
  hasMore,
  loadingMore,
  initialLoad,
  onMarkSensitive,
  onMarkUnsensitive,
  onDelete,
}) => {
  const flatListRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const userId = useSelector(state => state.auth.user?.id);

  const queryClient = useQueryClient();

  const { isLoading, refetch } = useQuery({
    queryKey: ['user_conversations', conversationId],
    queryFn: async () => {
      const apiResponse = await getConversations({ id: conversationId });
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

  // useEffect(() => {
  //   if (
  //     !isLoading &&
  //     flatListRef?.current &&
  //     conversations &&
  //     conversations.length > 0
  //   ) {
  //     const lastMessage = conversations[conversations.length - 1];
  //     if (lastMessage && lastMessage._id) {
  //       flatListRef.current?.scrollToItem({
  //         item: lastMessage,
  //         animated: false,
  //       });
  //     } else {
  //       flatListRef.current?.scrollToEnd({ animated: false });
  //     }
  //   }
  // }, [isLoading, conversations, conversations?.length]);

  // For inverted FlatList, bottom is at offset 0
  const handleScroll = event => {
    const { contentOffset } = event.nativeEvent;
    const paddingToTop = 40;
    const isAtBottom = contentOffset.y <= paddingToTop;
    setShowScrollToBottom(
      !isAtBottom && conversations.length > SCROLL_TO_BOTTOM_THRESHOLD,
    );
  };

  const scrollToBottom = () => {
    if (flatListRef?.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };
  // Auto-scroll to bottom (top of list when inverted) when conversations change
  useEffect(() => {
    const hasConversations = conversations && conversations.length > 0;
    if (flatListRef.current && hasConversations) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [conversations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEndReached = () => {
    if (hasMore && !loadingMore && typeof onLoadMore === 'function') {
      onLoadMore();
    }
  };

  useChatSocket({
    onMessageReceived: message => {
      setConversations &&
        setConversations(prev => dedupeMessages([...(prev || []), message]));
    },
    onTypingStatusUpdate: status => {
      setIsTyping(status);
    },
    receiverId: conversationId,
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={[
            styles.loadingContainer,
            { flex: 1, justifyContent: 'center', alignItems: 'center' },
          ]}>
          <PrimaryLoader />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        ref={flatListRef}
        data={
          isTyping
            ? [
              ...[
                ...(conversations || []),
                { _id: 'typing-indicator', isTyping: true },
              ].reverse(),
            ]
            : [...(conversations || [])].reverse()
        }
        keyExtractor={item => item?._id || item?.localId || 'typing-indicator'}
        renderItem={({ item, index }) => {
          if (item?.isTyping) {
            return (
              <View style={[styles.fullRow, styles.alignStart]}>
                <BlinkingDots isSender={false} />
              </View>
            );
          }
          const currentDate = new Date(item?.timestamp).toDateString();
          const reversedConversations = [...(conversations || [])].reverse();
          const previousDate =
            index < reversedConversations?.length - 1
              ? new Date(
                reversedConversations[index + 1].timestamp,
              ).toDateString()
              : null;
          const showDateLabel = index === reversedConversations?.length - 1 || currentDate !== previousDate;
          const isSelected =
            selectedMessage && item?._id === selectedMessage._id;
          return (
            <ChatMessageRow
              item={item}
              index={index}
              showDateLabel={showDateLabel}
              userId={userId}
              onReply={onReply}
              onSelectMessage={msg => {
                if (selectedMessage && selectedMessage?._id === msg?._id) {
                  onSelectMessage(null);
                } else {
                  onSelectMessage(msg);
                }
              }}
              selected={isSelected}
              onMarkSensitive={onMarkSensitive}
              onMarkUnsensitive={onMarkUnsensitive}
              onDelete={onDelete}
            />
          );
        }}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        // onScrollToIndexFailed={({ index, highestMeasuredFrameIndex }) => {
        //   // Scroll to the highest measured frame, then try again after a short delay
        //   flatListRef.current?.scrollToIndex({
        //     index: highestMeasuredFrameIndex,
        //     animated: false,
        //   });
        //   setTimeout(() => {
        //     flatListRef.current?.scrollToIndex({ index, animated: false });
        //   }, 100);
        // }}
        inverted
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ padding: 12 }}>
              <PrimaryLoader />
            </View>
          ) : null
        }
      />
      {showScrollToBottom && (
        <View style={styles.centeredScrollBtnWrap} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.centeredScrollBtn}
            onPress={scrollToBottom}
            activeOpacity={0.85}>
            <Icon name="arrow-down-outline" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
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
  centeredScrollBtnWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  centeredScrollBtn: {
    backgroundColor: '#232323',
    borderRadius: 24,
    padding: 10,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
