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
import {Text, Avatar, Divider, IconButton} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {getUserPendingRequests} from '../../apis/getUserPendingRequests';
import {acceptFriendRequest} from '../../apis/acceptFriendRequest';
import {getInitials} from '../../utils/name/getInitials';
import UserAvatar from '../../components/CustomAvatar/UserAvatar';
import {useDispatch} from 'react-redux';
import {showSnackbar} from '../../redux/slice/snackbarSlice';

const DUMMY_REQUESTS = [
  {
    id: '1',
    name: 'Jane Doe',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    mutual: 3,
    username: 'janedoe',
  },
  {
    id: '2',
    name: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    mutual: 1,
    username: 'johnsmith',
  },
  {
    id: '3',
    name: 'Alice Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    mutual: 0,
    username: 'alicej',
  },
  {
    id: '4',
    name: 'Mike Taylor',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    mutual: 2,
    username: 'miket',
  },
  {
    id: '5',
    name: 'Samantha Green',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    mutual: 1,
    username: 'samgreen',
  },
  {
    id: '6',
    name: 'Chris Brown',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    mutual: 4,
    username: 'chrisb',
  },
];

// export const getUserPendingRequests = async () => {
//   await new Promise(res => setTimeout(res, 600));
//   return DUMMY_REQUESTS;
// };

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FriendRequestRow = ({item, onAccept, onDecline}) => (
  <View style={styles.card}>
    <View style={styles.avatarContainer}>
      <UserAvatar
        profilePicture={item.profilePicture}
        name={item.name}
        id={item._id}
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
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.username}>@{item.username}</Text>
    </View>
    <View style={styles.actions}>
      <TouchableOpacity
        onPress={() => onAccept(item._id)}
        style={styles.acceptBtn}>
        <MaterialCommunityIcons name="check" size={20} color="#fff" />
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
  const [isAccepting, setIsAccepting] = useState(false);
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

  const handleAccept = async id => {
    if (isAccepting) return;

    try {
      setIsAccepting(true);

      const apiResponse = await acceptFriendRequest({requestId: id});

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
      setIsAccepting(false);
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
    await refetch();
    setRefreshing(false);
  };

  const visibleRequests = expanded ? requests : requests.slice(0, 5);

  const renderItem = ({item, index}) => (
    <>
      <FriendRequestRow
        item={item?.sender}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
      {index === visibleRequests.length - 1 && requests.length > 5 && (
        <TouchableOpacity
          onPress={handleToggleExpand}
          style={styles.showMoreBtn}>
          <Text style={styles.showMoreText}>
            {expanded ? 'Show Less' : 'Show More'}
          </Text>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#D28A8C"
          />
        </TouchableOpacity>
      )}
      <Divider style={styles.divider} />
    </>
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
          <Text style={styles.emptyText}>No pending requests.</Text>
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
    borderBottomWidth: 0.5,
    borderBottomColor: '#232323',
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
});
