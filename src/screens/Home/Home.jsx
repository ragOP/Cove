import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, FlatList, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Text,
  Searchbar,
  IconButton,
  Chip,
  Menu,
  Avatar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/slice/authSlice';
import { getUserContacts } from '../../apis/getUserContacts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserPendingRequests } from '../../apis/getUserPendingRequests';
import useChatListSocket from '../../hooks/useChatListSocket';
import {
  setContacts,
  setLoading,
  setError,
  setContactType,
  setPage,
  updateContact,
  addContact,
  setIsFetched,
  clearContacts,
  setBottomNavIndex,
} from '../../redux/slice/chatSlice';
import { Paths } from '../../navigation/paths';
import ContactRow from './components/ContactRow';
import SelectedContactBar from './components/SelectedContactBar';
import EmptyContactsState from './components/EmptyContactsState';
import ContactsUniversalSearch from './components/ContactsUniversalSearch';
import CustomDialog from '../../components/CustomDialog/CustomDialog';
import HomeStyles from './styles/HomeStyles';

const OutlinedIcon = props => (
  <Icon name="add-circle-outline" size={28} color="#fff" {...props} />
);

// Custom white icons for menu
const ProfileIcon = () => (
  <MaterialCommunityIcons name="account" size={24} color="#fff" />
);

const LogoutIcon = () => (
  <MaterialCommunityIcons name="logout" size={24} color="#fff" />
);

const Home = ({
  onNavigateToChat,
  onNavigateToAddContact,
  onNavigateToFriendRequests
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  // Use passed navigation handlers or fall back to direct navigation
  const handleNavigateToChat = onNavigateToChat || ((contact) => {
    navigation.navigate(Paths.CONTACT_CHAT, { contact });
  });

  const handleNavigateToAddContact = onNavigateToAddContact || (() => {
    navigation.navigate(Paths.ADD_CONTACT);
  });

  const handleNavigateToFriendRequests = onNavigateToFriendRequests || (() => {
    console.log('Navigating to friend requests');
    navigation.navigate(Paths.FRIEND_REQUESTS);
  });

  const contactsRaw = useSelector(state => state.chat.contacts);
  const contacts = useMemo(() => contactsRaw || [], [contactsRaw]);
  const loading = useSelector(state => state.chat.loading);
  const error = useSelector(state => state.chat.error);
  const contactType = useSelector(state => state.chat.contactType);
  const page = useSelector(state => state.chat.page);
  const perPage = useSelector(state => state.chat.perPage);
  const hasMore = useSelector(state => state.chat.hasMore);
  const isFetched = useSelector(state => state.chat.isFetched);

  const userId = useSelector(state => state.auth.user?.id);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const {
    data: requests = [],
    refetch: refetchRequests,
    isLoading: isLoadingRequests
  } = useQuery({
    queryKey: ['pendingRequests', userId],
    queryFn: getUserPendingRequests,
    select: data => data?.response?.data || [],
    enabled: !!userId,
  });
  const [pendingRequestsCount, setPendingRequestsCount] = useState(
    requests.length || 0,
  );

  // Simple contact fetching logic
  useEffect(() => {


    const fetchContacts = async () => {
      try {
        dispatch(setLoading(true));

        const apiResponse = await getUserContacts({
          params: {
            page,
            per_page: perPage,
            contact_type: contactType,
          },
        });

        if (apiResponse?.response?.success) {
          console.log('API Response:', apiResponse.response.data);
          dispatch(
            setContacts({
              contacts: apiResponse.response.data || [],
              page,
              hasMore: (apiResponse.response.data || []).length === (perPage || 20),
              contactType,
            }),
          );
        } else {
          console.error('API Error:', apiResponse?.response?.message);
          dispatch(setError(apiResponse?.response?.message || 'Failed to fetch contacts.'));
        }
      } catch (err) {
        console.error('Fetch contacts error:', err);
        dispatch(setError('Failed to fetch contacts.'));
      } finally {
        dispatch(setLoading(false));
        dispatch(setIsFetched(true));
      }
    };

    fetchContacts();
  }, [userId, page, perPage, contactType, dispatch]);

  // useEffect(() => {
  //   if (userId && isUserLoaded) {
  //     console.log('User loaded, clearing contacts for fresh start');
  //     dispatch(clearContacts());
  //     queryClient.clear();
  //   }
  // }, [userId, isUserLoaded, dispatch, queryClient]);

  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchResults(contacts);
      return;
    }
    const lower = searchInput.toLowerCase();
    const filtered = contacts.filter(c => {
      const name = c.displayName || c.name || '';
      return name.toLowerCase().includes(lower);
    });
    console.log('Filtered contacts by search:', filtered.length);
    setSearchResults(filtered);
  }, [searchInput, contacts]);

  const totalUnread = contacts.reduce(
    (sum, c) => sum + (c.unreadCount > 0 ? 1 : 0),
    0,
  );

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
      handleNavigateToChat(item);
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
    setSelectedIds([]);
    try {
      queryClient.clear();
      await refetchRequests();
      dispatch(setPage(1));
    } catch (e) {
      console.error(e)
    } finally {
      setRefreshing(false);
    }
  };

  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleLogout = () => {
    closeMenu();
    setLogoutDialogVisible(true);
  };

  const handleConfirmLogout = () => {
    queryClient.clear();
    dispatch(logoutUser());
  };

  const handleChatListUpdate = updatedContact => {
    if (!updatedContact || !updatedContact._id) {
      return;
    }

    dispatch(updateContact(updatedContact));
    const exists = contacts.some(c => c._id === updatedContact._id);

    if (exists) {
      dispatch(updateContact(updatedContact));
    } else {
      dispatch(addContact(updatedContact));
    }
  };

  const handlePendingRequestCountUpdate = data => {
    if (data?.count !== undefined) {
      setPendingRequestsCount(data?.count);
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    }
  };

  console.log(">>>", contacts)

  const handleDebugLoadContacts = () => {
    dispatch(setPage(1));
    dispatch(setContactType('all'));
  };

  useChatListSocket({
    onChatListUpdate: handleChatListUpdate,
    onFriendRequestReceived: handlePendingRequestCountUpdate,
    onFriendRequestRejected: handlePendingRequestCountUpdate,
  });

  useEffect(() => {
    setPendingRequestsCount(requests.length || 0);
  }, [requests]);

  return (
    <View style={[
      HomeStyles.container,
      {
        paddingTop: selectedContacts.length > 0 ? insets.top : Math.max(insets.top, 12),
      }
    ]}>
      {selectedContacts.length > 0 ? (
        <SelectedContactBar
          selectedContacts={selectedContacts}
          onClose={handleClearSelected}
          onDelete={handleDeleteContact}
          onFavorite={handleFavoriteContact}
        />
      ) : (
        <View style={HomeStyles.headerRow}>
          <Text style={HomeStyles.headerText}>Cove</Text>
          <View style={HomeStyles.headerInnerRow}>
            <TouchableOpacity
              style={HomeStyles.friendRequestBtn}
              onPress={() => {
                handleNavigateToFriendRequests();
              }}
              activeOpacity={0.8}>
              <View style={HomeStyles.friendRequestIconWrapper}>
                <MaterialCommunityIcons
                  name="account-plus"
                  size={24}
                  color="#fff"
                />
                {pendingRequestsCount > 0 && (
                  <View style={HomeStyles.friendRequestCountBubble}>
                    <Text style={HomeStyles.friendRequestCountText}>
                      {pendingRequestsCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <IconButton
              icon={OutlinedIcon}
              size={28}
              iconColor="#fff"
              onPress={handleNavigateToAddContact}
              style={HomeStyles.plusIcon}
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
                  style={HomeStyles.optionsIcon}
                  rippleColor="rgba(255, 255, 255, 0.1)"
                  underlayColor="transparent"
                />
              }
              style={HomeStyles.menuContent}
              contentStyle={HomeStyles.menuContent}>
              <Menu.Item
                onPress={() => {
                  dispatch(setBottomNavIndex(3));
                  closeMenu();
                }}
                title="Profile"
                leadingIcon={ProfileIcon}
                style={[HomeStyles.menuItemTitle, HomeStyles.menuItem]}
                titleStyle={HomeStyles.menuItemTitle}
                iconColor="#fff"
              />
              <Menu.Item
                onPress={handleLogout}
                title="Logout"
                leadingIcon={LogoutIcon}
                style={[HomeStyles.menuItemTitle, HomeStyles.menuItemLast]}
                titleStyle={HomeStyles.menuItemTitle}
                iconColor="#fff"
              />
            </Menu>
          </View>
        </View>
      )}
      <View style={HomeStyles.searchBarContainer}>
        <Searchbar
          placeholder="Search"
          value={searchInput}
          onChangeText={setSearchInput}
          onFocus={() => setShowSearchPage(true)}
          style={HomeStyles.searchBar}
          iconColor="#D28A8C"
          placeholderTextColor="#D28A8C"
          inputStyle={{ color: '#fff' }}
          editable={true}
          pointerEvents="auto"
        />
      </View>
      {showSearchPage && (
        <ContactsUniversalSearch
          contacts={contacts}
          onClose={() => setShowSearchPage(false)}
          navigation={navigation}
          userId={userId}
        />
      )}
      <View style={HomeStyles.chipRow}>
        {chatFilters.map(filter => {
          const selected = contactType === filter.key;
          return (
            <Chip
              key={filter.key}
              style={[
                HomeStyles.unreadChip,
                selected && HomeStyles.unreadChipSelected,
              ]}
              textStyle={[
                HomeStyles.unreadChipText,
                selected && HomeStyles.unreadChipTextSelected,
              ]}
              selected={selected}
              selectedColor="#fff"
              onPress={() => {
                if (contactType !== filter.key) {
                  dispatch(setContactType(filter.key));
                }
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
        data={searchResults}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <ContactRow
            item={item}
            onPress={() => handleContactPress(item)}
            onLongPress={() => handleContactLongPress(item)}
            selected={selectedIds.includes(item._id)}
            userId={userId}
            isActive={item.isActive}
          />
        )}
        contentContainerStyle={
          contacts && contacts.length === 0
            ? HomeStyles.emptyListContent
            : HomeStyles.listContent
        }
        ListEmptyComponent={
          loading || (!isFetched && contacts.length === 0) ? (
            <View style={HomeStyles.loadingContainer}>
              <Avatar.Icon
                icon="message-text"
                size={64}
                style={HomeStyles.loadingAvatar}
              />
              <Text style={HomeStyles.loadingText}>Loading chats...</Text>
            </View>
          ) : isFetched && contacts.length === 0 ? (
            <EmptyContactsState
              onAddPress={handleNavigateToAddContact}
            />
          ) : null
        }
        refreshing={refreshing}
        onRefresh={handlePageRefresh}
        onEndReached={() => {
          if (hasMore && !loading) {
            dispatch(setPage(page + 1));
          }
        }}
        onEndReachedThreshold={0.5}
      />

      {/* Logout Confirmation Dialog */}
      <CustomDialog
        visible={logoutDialogVisible}
        onDismiss={() => setLogoutDialogVisible(false)}
        title="Logout"
        message="Are you sure you want to logout?"
        icon="logout"
        iconColor="#ff4444"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutDialogVisible(false)}
        destructive={true}
      />
    </View>
  );
};

export default Home;
