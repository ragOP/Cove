import React, {useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Animated,
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

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const SCROLL_TO_BOTTOM_THRESHOLD = 10;

const ChatsContainer = ({conversationId, conversations, setConversations}) => {
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
      <AnimatedFlatList
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

          return (
            <MessageItem
              item={item}
              index={index}
              showDateLabel={showDateLabel}
              userId={userId}
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
});
