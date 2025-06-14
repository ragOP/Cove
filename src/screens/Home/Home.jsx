import {useNavigation} from '@react-navigation/native';
import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Animated,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Avatar,
  Searchbar,
  IconButton,
  Badge,
  Chip,
  Button,
  Menu,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Paths} from '../../navigaton/paths';
import {useQuery} from '@tanstack/react-query';
import {getUserContacts} from '../../apis/getUserContacts';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../../redux/slice/authSlice';
import UserAvatar from '../../components/CustomAvatar/UserAvatar';
import {getChatDisplayInfo} from '../../utils/chat/getChatDisplayInfo';
import {showSnackbar} from '../../redux/slice/snackbarSlice';
import {getMessagePreview} from '../../helpers/messages/getMessagePreview';
import {formatChatTime} from '../../utils/message/formatChatTime';
import {getUserPendingRequests} from '../../apis/getUserPendingRequests';
import useDebounce from '../../hooks/useDebounce';
import useChatListSocket from '../../hooks/useChatListSocket';

const ContactRow = ({item, onPress, onLongPress, selected, userId}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const [isHeld, setIsHeld] = useState(false);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: false,
        speed: 50,
        bounciness: 10,
      }),
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: false,
        speed: 50,
        bounciness: 10,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
    setIsHeld(false);
  };

  const handleLongPress = () => {
    setIsHeld(true);
    if (onLongPress) {
      onLongPress(item);
    }
  };

  const backgroundColor = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [selected || isHeld ? '#232323' : 'transparent', '#292929'],
  });

  const display = getChatDisplayInfo(item, userId);
  const unreadCount = item.unreadCount || 0;
  const lastMessage = item.lastMessage || null;
  const isGroup = Boolean(item.participants.length > 2);
  const previewMessage = lastMessage
    ? getMessagePreview(lastMessage, userId, isGroup)
    : '';
  const lastMessageTime = lastMessage?.timestamp
    ? lastMessage?.timestamp
    : item?.updatedAt;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      style={styles.pressable}
      android_ripple={{color: '#233d2e'}}>
      <Animated.View
        style={[styles.contactRow, {transform: [{scale}], backgroundColor}]}>
        <UserAvatar
          profilePicture={display.profilePicture}
          name={display.name}
          _id={display._id}
          size={54}
        />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{display.name}</Text>
          {Array.isArray(previewMessage) ? (
            <View style={styles.previewMessage}>
              <Icon name="checkmark-done" size={16} color="#4BB543" />
              <Text
                style={styles.previewText}
                numberOfLines={1}
                ellipsizeMode="tail"
                allowFontScaling={false}>
                {typeof previewMessage[1] === 'string'
                  ? previewMessage[1]
                  : String(previewMessage[1])}
              </Text>
            </View>
          ) : (
            <Text
              style={styles.previewText}
              numberOfLines={1}
              ellipsizeMode="tail"
              allowFontScaling={false}>
              {typeof previewMessage === 'string'
                ? previewMessage
                : String(previewMessage)}
            </Text>
          )}
        </View>
        <View style={styles.contactMeta}>
          <Text style={styles.contactTime}>
            {formatChatTime(lastMessageTime)}
          </Text>
          {unreadCount > 0 && (
            <Badge style={styles.badge}>
              {unreadCount === 1 ? 1 : `+${unreadCount - 1}`}
            </Badge>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

// --- SelectedContactBar Component ---
const SelectedContactBar = ({
  selectedContacts,
  onClose,
  onDelete,
  onFavorite,
}) => {
  if (!selectedContacts || selectedContacts.length === 0) {
    return null;
  }
  return (
    <View style={styles.selectedBarContainer}>
      <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
        <Icon name="close" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.selectedContactInfoCount}>
        <Text style={styles.selectedContactCount}>
          {selectedContacts.length}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onFavorite(selectedContacts)}
        style={styles.iconBtn}>
        <Icon name="star-outline" size={22} color="#D28A8C" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onDelete(selectedContacts)}
        style={styles.iconBtn}>
        <Icon name="trash" size={22} color="#f55" />
      </TouchableOpacity>
    </View>
  );
};

const OutlinedIcon = _props => (
  <Icon name="add-circle-outline" size={28} color="#fff" />
);

const EmptyContactsState = ({onAddPress}) => (
  <View style={styles.emptyStateContainer}>
    <Avatar.Icon
      icon="message-text-outline"
      size={100}
      style={styles.emptyAvatar}
      color="#D28A8C"
    />
    <Text style={styles.emptyTitle}>No Chats Yet</Text>
    <Text style={styles.emptySubtitle}>
      Start a new conversation by adding a contact. Your chats will appear here.
    </Text>
    <Button
      mode="contained"
      icon="account-plus"
      style={styles.emptyButton}
      labelStyle={styles.emptyButtonLabel}
      onPress={onAddPress}>
      Add Contact
    </Button>
  </View>
);

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const userId = useSelector(state => state.auth.user?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [params, setParams] = useState({
    search: '',
    page: 1,
    per_page: 20,
    contact_type: 'all',
  });
  const [allContacts, setAllContacts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const {
    data: requests = [],
    refetch: refetchRequests,
    isRefetching,
  } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: getUserPendingRequests,
    select: data => data?.response?.data || [],
  });

  const pendingRequestsCount = requests.length || 0;

  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
    refetch,
  } = useQuery({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const apiResponse = await getUserContacts({params});
      if (apiResponse?.response?.success) {
        const data = apiResponse.response.data || [];
        // If page is 1, reset allContacts; else, append and dedupe
        setAllContacts(prev => {
          if (params.page === 1) {
            return data;
          } else {
            const ids = new Set(prev.map(c => c._id));
            const deduped = [...prev];
            data.forEach(c => {
              if (!ids.has(c._id)) {
                deduped.push(c);
              }
            });
            return deduped;
          }
        });
        setHasMore(data.length === params.per_page);
        return data;
      } else {
        console.error('Failed to fetch contacts:', apiResponse);
        dispatch(
          showSnackbar({
            title: 'Error',
            subtitle:
              apiResponse?.response?.message || 'Failed to fetch contacts.',
            type: 'error',
          }),
        );
        return [];
      }
    },
  });

  useEffect(() => {
    setParams(prev => ({
      ...prev,
      search: debouncedSearch,
      page: 1,
    }));
    setAllContacts([]); // Reset on search
  }, [debouncedSearch]);

  useEffect(() => {
    setAllContacts([]); // Reset on filter change
  }, [params.contact_type]);

  const totalUnread = contacts.reduce(
    (sum, c) => sum + (c.unreadCount > 0 ? 1 : 0),
    0,
  );

  // Dynamic filter chips structure
  const chatFilters = [
    {
      key: 'all',
      label: 'All',
      show: true,
      getCount: () => null,
    },
    {
      key: 'unread',
      label: 'Unread',
      show: totalUnread > 0,
      getCount: () => totalUnread,
    },
    {
      key: 'favorites',
      label: 'Favorites',
      show: true,
      getCount: () => null,
    },
  ];

  // Filter contacts based on params.contact_type
  let filteredContacts = allContacts;
  if (params.contact_type === 'unread') {
    filteredContacts = allContacts.filter(c => c.unreadCount > 0);
  } else if (params.contact_type === 'favorites') {
    filteredContacts = allContacts.filter(c => c.isFavorite);
  }

  const handleContactPress = item => {
    if (selectedIds.length > 0) {
      if (selectedIds.includes(item._id)) {
        const newIds = selectedIds.filter(id => id !== item._id);
        setSelectedIds(newIds);
        setSelectedContacts(selectedContacts.filter(c => c._id !== item._id));
      } else {
        setSelectedIds([...selectedIds, item._id]);
        setSelectedContacts([...selectedContacts, item]);
      }
    } else {
      setSelectedIds([]);
      setSelectedContacts([]);
      navigation.navigate(Paths.CONTACT_CHAT, {contact: item});
    }
  };
  const handleContactLongPress = item => {
    if (!selectedIds.includes(item._id)) {
      setSelectedIds([...selectedIds, item._id]);
      setSelectedContacts([...selectedContacts, item]);
    }
  };
  const handleClearSelected = () => {
    setSelectedIds([]);
    setSelectedContacts([]);
  };

  const handleDeleteContact = contact => {
    // TODO: Implement delete logic (API call, update state, etc.)
    handleClearSelected();
  };

  const handleFavoriteContact = contact => {
    // TODO: Implement favorite/unfavorite logic (API call, update state, etc.)
    handleClearSelected();
  };

  const handlePageRefresh = async () => {
    setRefreshing(true);
    setSearchQuery('');
    setSelectedIds([]);
    setParams({
      search: '',
      page: 1,
      per_page: 20,
      contact_type: 'all',
    });
    await Promise.all([refetch(), refetchRequests()]);
    setRefreshing(false);
  };

  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleLogout = () => {
    closeMenu();
    dispatch(logout());
  };

  useChatListSocket({
    onChatListUpdate: updatedContact => {
      setAllContacts(prev => {
        const idx = prev.findIndex(c => c._id === updatedContact._id);
        if (idx !== -1) {
          // Update existing contact
          const updated = [...prev];
          updated[idx] = {...updated[idx], ...updatedContact};
          return updated;
        } else {
          // Add new contact to the top
          return [updatedContact, ...prev];
        }
      });
    },
  });

  return (
    <View style={styles.container}>
      {selectedContacts.length > 0 ? (
        <SelectedContactBar
          selectedContacts={selectedContacts}
          onClose={handleClearSelected}
          onDelete={handleDeleteContact}
          onFavorite={handleFavoriteContact}
        />
      ) : (
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>All Chats</Text>
          <View style={styles.headerInnerRow}>
            <TouchableOpacity
              style={styles.friendRequestBtn}
              onPress={() => navigation.navigate(Paths.FRIEND_REQUESTS)}
              activeOpacity={0.8}>
              <View style={styles.friendRequestIconWrapper}>
                <MaterialCommunityIcons
                  name="account-plus"
                  size={24}
                  color="#fff"
                />
                {pendingRequestsCount > 0 && (
                  <View style={styles.friendRequestCountBubble}>
                    <Text style={styles.friendRequestCountText}>
                      {pendingRequestsCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <IconButton
              icon={OutlinedIcon}
              size={28}
              onPress={() => navigation.navigate(Paths.ADD_CONTACT)}
              style={styles.plusIcon}
            />
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  iconColor="#fff"
                  size={28}
                  onPress={openMenu}
                  style={styles.optionsIcon}
                />
              }
              style={styles.menuContent}>
              <Menu.Item
                onPress={() => navigation.navigate(Paths.PROFILE)}
                title="Profile"
                leadingIcon="account"
                style={styles.menuItemTitle}
              />
              <Menu.Item
                onPress={handleLogout}
                title="Logout"
                leadingIcon="logout"
                style={styles.menuItemTitle}
              />
            </Menu>
          </View>
        </View>
      )}
      <Searchbar
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
        iconColor="#D28A8C"
        placeholderTextColor="#D28A8C"
      />
      <View style={styles.chipRow}>
        {chatFilters.map(filter => {
          const selected = params.contact_type === filter.key;
          return (
            <Chip
              key={filter.key}
              style={[styles.unreadChip, selected && styles.unreadChipSelected]}
              textStyle={[
                styles.unreadChipText,
                selected && styles.unreadChipTextSelected,
              ]}
              selected={selected}
              selectedColor="#fff"
              onPress={() => {
                setParams(prev => ({...prev, contact_type: filter.key}));
              }}>
              {filter.label}
              {filter.show && filter.getCount() !== null
                ? ` (${filter.getCount()})`
                : ''}
            </Chip>
          );
        })}
      </View>
      <FlatList
        data={filteredContacts}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <ContactRow
            item={item}
            onPress={() => handleContactPress(item)}
            onLongPress={() => handleContactLongPress(item)}
            selected={selectedIds.includes(item._id)}
            userId={userId}
          />
        )}
        contentContainerStyle={
          contacts && contacts.length === 0
            ? styles.emptyListContent
            : styles.listContent
        }
        ListEmptyComponent={
          isLoadingContacts ? (
            <View style={styles.loadingContainer}>
              <Avatar.Icon
                icon="message-text"
                size={64}
                style={styles.loadingAvatar}
              />
              <Text style={styles.loadingText}>Loading chats...</Text>
            </View>
          ) : (
            <EmptyContactsState
              onAddPress={() => navigation.navigate(Paths.ADD_CONTACT)}
            />
          )
        }
        refreshing={refreshing}
        onRefresh={handlePageRefresh}
        onEndReached={() => {
          if (hasMore && !isLoadingContacts) {
            setParams(prev => ({...prev, page: prev.page + 1}));
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  headerInnerRow: {flexDirection: 'row', alignItems: 'center'},
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginLeft: 72,
  },
  plusIcon: {
    margin: 0,
  },
  optionsIcon: {
    margin: 0,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  unreadChip: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingHorizontal: 2,
    paddingVertical: 0,
    transitionProperty: 'background-color',
    transitionDuration: '200ms',
  },
  unreadChipSelected: {
    backgroundColor: '#D28A8C', // Use Add Contact button color
  },
  unreadChipText: {
    color: '#fff',
    fontSize: 14,
    transitionProperty: 'color',
    transitionDuration: '200ms',
  },
  unreadChipTextSelected: {
    color: '#fff', // White text for selected chip
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 24,
    backgroundColor: '#000',
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
  pressable: {
    width: '100%',
    alignSelf: 'stretch',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: 'transparent',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    gap: 6,
  },
  contactName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  previewMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewText: {
    color: '#fff',
    fontSize: 14,
  },
  previewTextBold: {
    fontWeight: 'bold',
  },
  contactMessage: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 14,
    marginTop: 2,
  },
  contactMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  contactTime: {
    fontSize: 12,
    color: '#888',
  },
  badge: {
    backgroundColor: '#fff',
    color: '#000',
    fontWeight: 'bold',
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
  emptyButton: {
    backgroundColor: '#D28A8C',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 6,
    alignSelf: 'center',
    elevation: 2,
  },
  emptyButtonLabel: {fontWeight: 'bold'},
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  loadingAvatar: {
    backgroundColor: '#232323',
  },
  loadingText: {
    color: '#bbb',
    marginTop: 16,
    fontSize: 16,
  },
  friendRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  friendRequestIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendRequestCountBubble: {
    position: 'absolute',
    top: -8,
    right: -15,
    backgroundColor: '#D28A8C',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#232323',
    zIndex: 2,
    paddingHorizontal: 4,
  },
  friendRequestCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  emptyAvata: {
    backgroundColor: '#232323',
    marginBottom: 24,
    opacity: 0.92,
    alignSelf: 'center',
  },
  // --- Styles for SelectedContactBar ---
  selectedBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  iconBtn: {
    padding: 6,
    marginHorizontal: 2,
  },
  selectedContactInfoCount: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedContactCount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  menuContent: {
    backgroundColor: '#232323',
  },
  menuItemTitle: {
    color: '#fff',
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
});
