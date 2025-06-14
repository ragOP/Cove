import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import {Text, Avatar, IconButton} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {getUserPendingRequests} from '../../apis/getUserPendingRequests';
import {acceptFriendRequest} from '../../apis/acceptFriendRequest';
import UserAvatar from '../../components/CustomAvatar/UserAvatar';
import {useDispatch} from 'react-redux';
import {showSnackbar} from '../../redux/slice/snackbarSlice';
import PrimaryLoader from '../../components/Loaders/PrimaryLoader';
import {getSentFriendRequests} from '../../apis/getSentFriendRequests';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FriendRequestRow = ({item, onAccept, onDecline, isAcceptingId}) => (
  <View style={styles.card}>
    <View style={styles.avatarContainer}>
      <UserAvatar
        profilePicture={item.sender?.profilePicture}
        name={item.sender?.name}
        id={item.sender?._id}
      />
      {item.mutual > 0 && (
        <View style={styles.mutualBadge}>
          <MaterialCommunityIcons
            name="account-multiple"
            size={12}
            color="#fff"
          />
          <Text style={styles.mutualText}>{item.mutual}</Text>
        </View>
      )}
    </View>
    <View style={styles.userInfo}>
      <Text style={styles.name}>{item.sender?.name}</Text>
      <Text style={styles.username}>@{item.sender?.username}</Text>
    </View>
    <View style={styles.actions}>
      <TouchableOpacity
        onPress={() => onAccept(item.sender?._id)}
        style={styles.acceptBtn}
        disabled={isAcceptingId === item._id}>
        {isAcceptingId === item._id ? (
          <PrimaryLoader size={20} color="#fff" />
        ) : (
          <MaterialCommunityIcons name="check" size={20} color="#fff" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onDecline(item.id)}
        style={styles.declineBtn}>
        <MaterialCommunityIcons name="close" size={20} color="#D28A8C" />
      </TouchableOpacity>
    </View>
  </View>
);

const FriendRequests = ({navigation}) => {
  const dispatch = useDispatch();

  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAcceptingId, setIsAcceptingId] = useState(null);
  const [isDeclining, setIsDeclining] = useState(false);

  const {
    data: requests = [],
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: getUserPendingRequests,
    select: data => data?.response?.data || [],
  });

  const {
    data: sentRequests = [],
    refetch: refetchSent,
    isRefetching: isRefetchingSent,
  } = useQuery({
    queryKey: ['sentFriendRequests'],
    queryFn: getSentFriendRequests,
    select: data => data?.response?.data || [],
  });

  const handleAccept = async id => {
    console.log('Accepting friend request with ID:', id);
    if (isAcceptingId) {
      return;
    }
    try {
      setIsAcceptingId(id);
      const apiResponse = await acceptFriendRequest({requestId: id});
      console.log('Friend request accepted:', apiResponse, id);
      if (apiResponse?.response?.success) {
        dispatch(
          showSnackbar({
            title: 'Friend Request Accepted',
            subtitle: 'You are now friends with this user.',
            type: 'success',
          }),
        );
        refetch();
      } else {
        const errorMessage =
          apiResponse?.response?.message || 'Failed to accept friend request.';
        dispatch(
          showSnackbar({
            title: 'Error',
            subtitle: errorMessage,
            type: 'error',
          }),
        );
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setIsAcceptingId(null);
    }
  };

  const handleDecline = id => {
    // Decline logic here
  };

  const handleToggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchSent()]);
    setRefreshing(false);
  };

  const visibleRequests = expanded ? requests : requests.slice(0, 5);

  const renderItem = ({item}) => (
    <FriendRequestRow
      item={item}
      onAccept={handleAccept}
      onDecline={handleDecline}
      isAcceptingId={isAcceptingId}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-left"
          size={26}
          iconColor="#fff"
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
        />
        <Text style={styles.header}>
          Friend Requests ({requests.length || 0})
        </Text>
      </View>
      <FlatList
        data={visibleRequests}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing || isRefetching}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Avatar.Icon
              icon="account-multiple-plus"
              size={80}
              style={styles.emptyAvatar}
              color="#D28A8C"
            />
            <Text style={styles.emptyTitle}>No Pending Requests</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! When someone sends you a friend request, it
              will appear here.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
      {/* Sent Requests Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>Requests Sent</Text>
          <Text style={styles.sectionHeaderCount}>
            ({sentRequests.length || 0})
          </Text>
        </View>
      </View>
      <FlatList
        data={sentRequests}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <UserAvatar
                profilePicture={item.receiver?.profilePicture}
                name={item.receiver?.name}
                id={item.receiver?._id}
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{item.receiver?.name}</Text>
              <Text style={styles.username}>@{item.receiver?.username}</Text>
            </View>
            <View style={styles.actions}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={22}
                color="#ffb300"
              />
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshing={isRefetchingSent}
        onRefresh={refetchSent}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Avatar.Icon
              icon="clock-outline"
              size={80}
              style={styles.emptyAvatar}
              color="#ffb300"
            />
            <Text style={styles.emptyTitle}>No Sent Requests</Text>
            <Text style={styles.emptySubtitle}>
              You haven't sent any friend requests yet.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default FriendRequests;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    padding: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#181818',
    gap: 12,
  },
  backBtn: {
    marginRight: 2,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  mutualBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#D28A8C',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#232323',
  },
  mutualText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    color: '#bbb',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: '#D28A8C',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    elevation: 2,
  },
  declineBtn: {
    borderColor: '#D28A8C',
    borderWidth: 1.5,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  showMoreBtn: {
    marginTop: 2,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  showMoreText: {
    color: '#D28A8C',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
  divider: {
    marginVertical: 2,
    backgroundColor: '#232323',
    marginLeft: 74,
    marginRight: 0,
  },
  emptyText: {
    color: '#bbb',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  emptyAvatar: {
    backgroundColor: '#232323',
    marginBottom: 24,
    opacity: 0.92,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#bbb',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#181818',
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 4,
    marginLeft: 8,
    gap: 6,
  },
  sectionHeaderText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  sectionHeaderCount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 6,
  },
});
