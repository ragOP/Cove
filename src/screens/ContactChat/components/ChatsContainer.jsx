import React, {useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';
import {getConversations} from '../../../apis/getConversations';
import {useSelector} from 'react-redux';
import MessageItem from '../../../components/Messages/MessageItem';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, runOnJS} from 'react-native-reanimated';

const SCROLL_TO_BOTTOM_THRESHOLD = 10;
const THEME_COLOR = '#D28A8C';

function ChatMessageRow({
  item,
  index,
  showDateLabel,
  userId,
  onReply,
  onSelectMessage,
  selected,
}) {
  const held = useSharedValue(false);
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: held.value || selected ? 'rgba(210,138,140,0.13)' : 'transparent',
      transform: [{translateX: translateX.value}],
    };
  });

  // Pan for swipe-to-reply (should trigger for the whole row)
  const panGesture = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .onUpdate(e => {
      if (e.translationX > 0) {
        translateX.value = e.translationX > 80 ? 80 : e.translationX;
      }
    })
    .onEnd(e => {
      if (e.translationX > 60 && Math.abs(e.translationX) > Math.abs(e.translationY)) {
        translateX.value = withTiming(0, {duration: 150});
        onReply && runOnJS(onReply)(item);
      } else {
        translateX.value = withTiming(0, {duration: 150});
      }
    })
    .onFinalize(() => {
      translateX.value = withTiming(0, {duration: 150});
    });

  // Long press for background highlight and select message
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

  // Combine gestures
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
}

const ChatsContainer = ({conversationId, conversations, setConversations, onReply, onSelectMessage, selectedMessage}) => {
  const flatListRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const userId = useSelector(state => state.auth.user?.id);

  const {isLoading, refetch} = useQuery({
    queryKey: ['user_conversations', conversationId],
    queryFn: async () => {
      const apiResponse = await getConversations({id: conversationId});
      if (apiResponse?.response?.success) {
        const data = apiResponse.response.data?.[0]?.messages;
        setConversations?.(data);
        return data || [];
      } else {
        setConversations?.([]);
        return [];
      }
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!isLoading && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({animated: false});
      }, 100);
    }
  }, [isLoading, conversations.length]);

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
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading || !conversations) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={conversations}
        keyExtractor={item => item._id || item.localId}
        renderItem={({item, index}) => {
          const currentDate = new Date(item.timestamp).toDateString();
          const previousDate =
            index > 0
              ? new Date(conversations[index - 1].timestamp).toDateString()
              : null;
          const showDateLabel = index === 0 || currentDate !== previousDate;
          const isSelected = selectedMessage && (item._id === selectedMessage._id);
          return (
            <ChatMessageRow
              item={item}
              index={index}
              showDateLabel={showDateLabel}
              userId={userId}
              onReply={onReply}
              onSelectMessage={onSelectMessage}
              selected={isSelected}
            />
          );
        }}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (flatListRef.current && conversations.length > 0) {
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
    // Remove padding so highlight covers the full row
  },
});
