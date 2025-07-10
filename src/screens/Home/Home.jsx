import React, {useState, useEffect, useMemo} from 'react';
import {View, FlatList, TouchableOpacity} from 'react-native';
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
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../../redux/slice/authSlice';
import {getUserContacts} from '../../apis/getUserContacts';
import {useIsFetching, useQuery} from '@tanstack/react-query';
import {getUserPendingRequests} from '../../apis/getUserPendingRequests';
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
} from '../../redux/slice/chatSlice';
import {Paths} from '../../navigaton/paths';
import ContactRow from './components/ContactRow';
import SelectedContactBar from './components/SelectedContactBar';
import EmptyContactsState from './components/EmptyContactsState';
import ContactsUniversalSearch from './components/ContactsUniversalSearch';
import HomeStyles from './styles/HomeStyles';

const OutlinedIcon = props => (
  <Icon name="add-circle-outline" size={28} color="#fff" {...props} />
);

const Home = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

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

  const {data: requests = [], refetch: refetchRequests} = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: getUserPendingRequests,
    select: data => data?.response?.data || [],
  });
  const [pendingRequestsCount, setPendingRequestsCount] = useState(
    requests.length || 0,
  );

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
          dispatch(
            setContacts({
              contacts: apiResponse.response.data || [],
              page,
              hasMore:
                (apiResponse.response.data || []).length === (perPage || 20),
              contactType,
            }),
          );
        } else {
          dispatch(
            setError(
              apiResponse?.response?.message || 'Failed to fetch contacts.',
            ),
          );
        }
      } catch (err) {
        dispatch(setError('Failed to fetch contacts.'));
      } finally {
        dispatch(setLoading(false));
        dispatch(setIsFetched(true));
      }
    };

    fetchContacts();
  }, [page, perPage, contactType, dispatch]);

  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchResults(contacts);
      return;
    }
    const lower = searchInput.toLowerCase();
    setSearchResults(
      contacts.filter(c => {
        const name = c.displayName || c.name || '';
        return name.toLowerCase().includes(lower);
      }),
    );
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
    setSelectedIds([]);
    dispatch(setPage(1));
    try {
      await refetchRequests();
    } finally {
      setRefreshing(false);
    }
  };

  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleLogout = () => {
    closeMenu();
    dispatch(logout());
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
    if (data?.count) {
      setPendingRequestsCount(data?.count);
    }
  };

  useChatListSocket({
    onChatListUpdate: handleChatListUpdate,
    onFriendRequestReceived: handlePendingRequestCountUpdate,
  });

  useEffect(() => {
    setPendingRequestsCount(requests.length || 0);
  }, [requests]);

  return (
    <View style={HomeStyles.container}>
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
              onPress={() => navigation.navigate(Paths.FRIEND_REQUESTS)}
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
              onPress={() => navigation.navigate(Paths.ADD_CONTACT)}
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
                />
              }
              style={HomeStyles.menuContent}>
              <Menu.Item
                onPress={() => navigation.navigate(Paths.PROFILE)}
                title="Profile"
                leadingIcon="account"
                style={HomeStyles.menuItemTitle}
              />
              <Menu.Item
                onPress={handleLogout}
                title="Logout"
                leadingIcon="logout"
                style={HomeStyles.menuItemTitle}
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
            ? HomeStyles.emptyListContent
            : HomeStyles.listContent
        }
        ListEmptyComponent={
          loading ? (
            <View style={HomeStyles.loadingContainer}>
              <Avatar.Icon
                icon="message-text"
                size={64}
                style={HomeStyles.loadingAvatar}
              />
              <Text style={HomeStyles.loadingText}>Loading chats...</Text>
            </View>
          ) : !loading && isFetched && contacts.length === 0 ? (
            <EmptyContactsState
              onAddPress={() => navigation.navigate(Paths.ADD_CONTACT)}
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
    </View>
  );
};

export default Home;
