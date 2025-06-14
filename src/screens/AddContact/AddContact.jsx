import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Linking,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {Avatar, IconButton, Button} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {request, PERMISSIONS, RESULTS, check} from 'react-native-permissions';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {searchUsers} from '../../apis/searchUsers';
import useDebounce from '../../hooks/useDebounce';
import {getInitials} from '../../utils/name/getInitials';
import {sendFriendRequest} from '../../apis/sendFriendRequest';
import {useDispatch} from 'react-redux';
import {showSnackbar} from '../../redux/slice/snackbarSlice';
import PrimaryLoader from '../../components/Loaders/PrimaryLoader';
import {getConversations} from '../../apis/conversations';
import { Paths } from '../../navigaton/paths';

const SUGGESTED_USERS = [
  {
    id: '1',
    name: 'Alice Johnson',
    username: 'alicej',
    profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: '2',
    name: 'Bob Smith',
    username: 'bobsmith',
    profilePicture: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: '3',
    name: 'Charlie Lee',
    username: 'charlielee',
    profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: '4',
    name: 'Diana Prince',
    username: 'dianap',
    profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: '5',
    name: 'Eve Adams',
    username: 'evea',
    profilePicture: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
  {
    id: '6',
    name: 'Frank Miller',
    username: 'frankm',
    profilePicture: 'https://randomuser.me/api/portraits/men/6.jpg',
  },
  {
    id: '7',
    name: 'Grace Hopper',
    username: 'graceh',
    profilePicture: 'https://randomuser.me/api/portraits/women/7.jpg',
  },
  {
    id: '8',
    name: 'Henry Ford',
    username: 'henryf',
    profilePicture: 'https://randomuser.me/api/portraits/men/8.jpg',
  },
];

const IMPORT_CONTACT_USERS = [
  {
    id: '101',
    name: 'Ivy Lane',
    phone: '+1234567890',
    profilePicture: 'https://randomuser.me/api/portraits/women/9.jpg',
    onCove: true,
  },
  {
    id: '102',
    name: 'Jack Black',
    phone: '+1987654321',
    profilePicture: 'https://randomuser.me/api/portraits/men/10.jpg',
    onCove: false,
  },
  {
    id: '103',
    name: 'Karen White',
    phone: '+1122334455',
    profilePicture: 'https://randomuser.me/api/portraits/women/11.jpg',
    onCove: true,
  },
  {
    id: '104',
    name: 'Leo King',
    phone: '+1098765432',
    profilePicture: 'https://randomuser.me/api/portraits/men/12.jpg',
    onCove: false,
  },
  {
    id: '105',
    name: 'Mona Lisa',
    phone: '+1231231234',
    profilePicture: 'https://randomuser.me/api/portraits/women/13.jpg',
    onCove: false,
  },
  {
    id: '106',
    name: 'Nate River',
    phone: '+3213214321',
    profilePicture: 'https://randomuser.me/api/portraits/men/14.jpg',
    onCove: true,
  },
];

const contactOptions = [
  {key: 'add', label: 'Add Friend', icon: 'account-plus-outline'},
  {key: 'block', label: 'Block', icon: 'block-helper'},
];

const searchSuggestedUsers = async () => {
  await new Promise(res => setTimeout(res, 200));
  return SUGGESTED_USERS;
};

const ContactListItem = ({item, addingId, handleAdd, handleOptions, handleNavigateToChat}) => (
  <View style={styles.userRow}>
    {item.profilePicture ? (
      <Avatar.Image size={44} source={{uri: item.profilePicture}} />
    ) : (
      <Avatar.Text
        size={44}
        label={getInitials(item.name) || item._id}
        style={styles.avatarFallback}
      />
    )}
    <View style={styles.userInfo}>
      <Text style={styles.name}>{item.name}</Text>
      <Text className={styles.username}>@{item.username}</Text>
    </View>
    <TouchableOpacity
      style={styles.addBtn}
      onPress={
        item.isFriend
          ? () => handleNavigateToChat(item)
          : item.isRequestPending
          ? undefined
          : () => handleAdd(item)
      }
      disabled={
        addingId === (item.id || item._id) || item.isFriend || item.isRequestPending
      }
    >
      {item.isFriend ? (
        <MaterialCommunityIcons name="message-processing" size={26} color="#4caf50" />
      ) : item.isRequestPending ? (
        <MaterialCommunityIcons name="clock-outline" size={26} color="#ffb300" />
      ) : addingId === (item.id || item._id) ? (
        <MaterialCommunityIcons name="check-circle" size={26} color="#4caf50" />
      ) : (
        <MaterialCommunityIcons name="account-plus-outline" size={26} color="#fff" />
      )}
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.optionsBtn}
      onPress={() => handleOptions(item)}>
      <Ionicons name="ellipsis-vertical" size={20} color="#bbb" />
    </TouchableOpacity>
  </View>
);

const ImportContactListItem = ({item, addingId, handleAdd, handleInvite}) => (
  <View style={styles.userRow}>
    {item.profilePicture ? (
      <Avatar.Image size={44} source={{uri: item.profilePicture}} />
    ) : (
      <Avatar.Text
        size={44}
        label={getInitials(item.name) || item._id}
        style={{backgroundColor: '#444'}}
      />
    )}
    <View style={styles.userInfo}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.username}>{item.phone}</Text>
    </View>
    {item.onCove ? (
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => handleAdd(item)}
        disabled={addingId === (item.id || item._id)}>
        {addingId === (item.id || item._id) ? (
          <MaterialCommunityIcons
            name="check-circle"
            size={26}
            color="#4caf50"
          />
        ) : (
          <MaterialCommunityIcons
            name="account-plus-outline"
            size={26}
            color="#fff"
          />
        )}
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={styles.inviteBtn}
        onPress={() => handleInvite(item.phone, item.name)}>
        <MaterialCommunityIcons
          name="message-plus-outline"
          size={20}
          color="#fff"
        />
        <Text style={styles.inviteText}>Invite</Text>
      </TouchableOpacity>
    )}
  </View>
);

const AddContact = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const [params, setParams] = useState({page: 1, per_page: 20, query: ''});
  const [addingId, setAddingId] = useState(null);
  const [showAllSuggested, setShowAllSuggested] = useState(false);
  const [contactsPermission, setContactsPermission] = useState('undetermined');
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [optionUser, setOptionUser] = useState(null);
  const optionAnim = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setParams(prev => ({...prev, query: debouncedSearch}));
  }, [debouncedSearch]);

  const {
    data: searchedUsers = [],
    isLoading: isSearchingUsers,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const apiResponse = await searchUsers({params});
      if (apiResponse?.response?.success) {
        const data = apiResponse.response.data || [];
        return data;
      } else {
        return [];
      }
    },
  });

  const {
    data: filteredSuggested = [],
    isLoading: isLoadingSuggested,
    refetch: refetchSuggested,
    isRefetching: isRefetchingSuggested,
  } = useQuery({
    queryKey: ['suggested-users'],
    queryFn: () => searchSuggestedUsers(),
    initialData: SUGGESTED_USERS,
  });

  const requestContactsPermission = async () => {
    setContactsLoading(true);
    if (Platform.OS === 'android') {
      const {PermissionsAndroid} = require('react-native');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      );
      setContactsPermission(
        granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied',
      );
    } else {
      const result = await request(PERMISSIONS.IOS.CONTACTS);
      setContactsPermission(result === RESULTS.GRANTED ? 'granted' : 'denied');
    }
    setContactsLoading(false);
  };

  useEffect(() => {
    const checkPermission = async () => {
      if (Platform.OS === 'android') {
        const {PermissionsAndroid} = require('react-native');
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        );
        setContactsPermission(granted ? 'granted' : 'undetermined');
      } else {
        const result = await check(PERMISSIONS.IOS.CONTACTS);
        setContactsPermission(
          result === RESULTS.GRANTED
            ? 'granted'
            : result === RESULTS.DENIED
            ? 'denied'
            : 'undetermined',
        );
      }
    };
    checkPermission();
  }, []);

  const filteredContacts = IMPORT_CONTACT_USERS.filter(
    user =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search),
  );

  const handleAdd = async item => {
    const id = item._id;
    if (addingId) return;
    setAddingId(id);
    try {
      const apiResponse = await sendFriendRequest({
        payload: {receiverId: id},
      });
      if (apiResponse?.response?.success) {
        dispatch(
          showSnackbar({
            type: 'success',
            title: 'Friend Request Sent',
            subtitle: `Friend request sent to ${item.name}`,
          }),
        );
        refetch();
      } else {
        const error =
          apiResponse?.response?.message || 'Failed to send friend request';
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Error',
            subtitle: error,
          }),
        );
        console.error('Failed to send friend request:', error);
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Error',
          subtitle: 'Failed to send friend request',
        }),
      );
    } finally {
      setAddingId(null);
    }
  };

  const handleInvite = (phone, name) => {
    const smsBody = `Hey ${name}, join me on Cove! Download the app: https://yourapp.link`;
    let url = `sms:${phone}${
      Platform.OS === 'ios' ? '&' : '?'
    }body=${encodeURIComponent(smsBody)}`;
    Linking.openURL(url);
  };

  const handleOptions = user => {
    setOptionUser(user);
    setShowOptions(true);
    Animated.timing(optionAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleBlock = user => {
    setShowOptions(false);
    Animated.timing(optionAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    dispatch(
      showSnackbar({
        type: 'info',
        title: 'Blocked',
        subtitle: `Blocked ${user.name}`,
      }),
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchSuggested()]);
    setRefreshing(false);
  };

  // Fetch contact details and navigate to chat if friend
  const handleNavigateToChat = async user => {
    try {
      const apiResponse = await getConversations({id: user._id});
      if (apiResponse?.response?.success) {
        navigation.navigate(Paths.CONTACT_CHAT, {contact: user});
      } else {
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Error',
            subtitle: 'Could not fetch contact details',
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Error',
          subtitle: 'Could not fetch contact details',
        })
      );
    }
  };

  const renderOptionsSheet = () => {
    if (!optionUser) return null;
    return (
      <Animated.View
        style={[
          styles.optionsSheet,
          {
            opacity: optionAnim,
            transform: [
              {
                translateY: optionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [200, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.optionsHeader}>
          {optionUser.profilePicture ? (
            <Avatar.Image size={44} source={{uri: optionUser.profilePicture}} />
          ) : (
            <Avatar.Text
              size={44}
              label={getInitials(optionUser.name) || optionUser._id}
              style={{backgroundColor: '#444'}}
            />
          )}
          <View style={styles.optionsHeaderInfo}>
            <Text style={styles.name}>{optionUser.name}</Text>
            <Text style={styles.username}>
              @{optionUser.username || optionUser.phone}
            </Text>
          </View>
        </View>
        {contactOptions.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={styles.optionRow}
            onPress={() => {
              if (opt.key === 'add') handleAdd(optionUser);
              if (opt.key === 'block') handleBlock(optionUser);
            }}>
            <MaterialCommunityIcons
              name={opt.icon}
              size={22}
              color="#fff"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.optionCancel}
          onPress={() => {
            setShowOptions(false);
            Animated.timing(optionAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }}>
          <Text style={styles.optionCancelText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  console.log('>>>', searchedUsers);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <IconButton
          icon={({size}) => (
            <Ionicons name="arrow-back" size={size} color={'#fff'} />
          )}
          size={28}
          color="#fff"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <Text style={styles.headerText}>Add Contact</Text>
      </View>
      <View style={styles.searchBarContainer}>
        <Ionicons
          name="search"
          size={22}
          color="#bbb"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, username or phone"
          placeholderTextColor="#bbb"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={22} color="#bbb" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isRefetching || isRefetchingSuggested}
            onRefresh={handleRefresh}
            tintColor="#fff"
          />
        }>
        {/* Universal Search Results Block */}
        {search.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {isSearchingUsers || isRefetching ? (
              <View style={styles.loadingContainer}>
                <PrimaryLoader size={20} />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchedUsers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              searchedUsers.map(item => (
                <ContactListItem
                  key={item.id || item._id}
                  item={item}
                  addingId={addingId}
                  handleAdd={handleAdd}
                  handleOptions={handleOptions}
                  handleNavigateToChat={handleNavigateToChat}
                />
              ))
            )}
          </View>
        )}

        {/* Suggested Users */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Suggested ({filteredSuggested.length || 0})
            </Text>
            {filteredSuggested.length > 4 && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setShowAllSuggested(!showAllSuggested)}>
                <Text style={styles.showMoreText}>
                  {showAllSuggested ? 'Show Less' : 'Show More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {isLoadingSuggested || isRefetchingSuggested ? (
            <View style={styles.loadingContainer}>
              <PrimaryLoader />
              <Text style={styles.loadingText}>Loading suggestions...</Text>
            </View>
          ) : filteredSuggested.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No suggestions found</Text>
            </View>
          ) : (
            (showAllSuggested
              ? filteredSuggested
              : filteredSuggested.slice(0, 4)
            ).map(item => (
              <ContactListItem
                key={item.id}
                item={item}
                addingId={addingId}
                handleAdd={handleAdd}
                handleOptions={handleOptions}
                handleNavigateToChat={handleNavigateToChat}
              />
            ))
          )}
        </View>

        {/* Contacts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Contacts (
              {contactsPermission === 'granted' ? filteredContacts.length : 0})
            </Text>
          </View>
          {contactsPermission === 'undetermined' && (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>
                To find friends from your contacts, allow Cove to access your
                contacts.
              </Text>
              <Button
                mode="contained"
                onPress={requestContactsPermission}
                style={styles.allowBtn}>
                Allow Access
              </Button>
            </View>
          )}
          {contactsPermission === 'denied' && (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>
                Permission denied. Please enable contacts permission in
                settings.
              </Text>
            </View>
          )}
          {contactsPermission === 'granted' &&
            (contactsLoading ? (
              <View style={styles.loadingContainer}>
                <PrimaryLoader />
                <Text style={styles.loadingText}>Loading contacts...</Text>
              </View>
            ) : filteredContacts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No contacts found</Text>
              </View>
            ) : (
              filteredContacts.map(item => (
                <ImportContactListItem
                  key={item.id}
                  item={item}
                  addingId={addingId}
                  handleAdd={handleAdd}
                  handleInvite={handleInvite}
                />
              ))
            ))}
        </View>
      </ScrollView>
      {showOptions && renderOptionsSheet()}
    </View>
  );
};

export default AddContact;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#181818', paddingTop: 12},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  backBtn: {margin: 0},
  headerText: {fontSize: 22, fontWeight: 'bold', color: '#fff', marginLeft: 8},
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  searchIcon: {marginLeft: 8},
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  clearBtn: {marginRight: 8},
  scroll: {flex: 1},
  scrollContent: {paddingBottom: 24},
  section: {
    backgroundColor: '#202124',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  showMoreBtn: {paddingHorizontal: 8, paddingVertical: 2},
  showMoreText: {color: '#D28A8C', fontWeight: 'bold', fontSize: 15},
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  userInfo: {flex: 1, marginLeft: 16, justifyContent: 'center'},
  name: {fontWeight: 'bold', fontSize: 16, color: '#fff'},
  username: {color: '#bbb', fontSize: 14, marginTop: 2},
  addBtn: {
    marginLeft: 8,
    backgroundColor: '#383838',
    borderRadius: 20,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteBtn: {
    marginLeft: 8,
    backgroundColor: '#7b585a',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteText: {color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 15},
  optionsBtn: {
    marginLeft: 6,
    padding: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {alignItems: 'center', marginTop: 12},
  emptyText: {color: '#bbb', fontSize: 15},
  permissionContainer: {alignItems: 'center', padding: 16},
  permissionText: {color: '#bbb', fontSize: 15, textAlign: 'center'},
  allowBtn: {marginTop: 12},
  loadingContainer: {alignItems: 'center', padding: 16},
  loadingText: {color: '#fff', marginTop: 8},
  optionsSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#232323',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    elevation: 10,
    zIndex: 100,
  },
  optionsHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 18},
  optionsHeaderInfo: {marginLeft: 12},
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  optionIcon: {marginRight: 16},
  optionText: {color: '#fff', fontSize: 16, fontWeight: '500'},
  optionCancel: {marginTop: 16, alignItems: 'center'},
  optionCancelText: {color: '#bbb', fontSize: 16, fontWeight: 'bold'},
  avatarFallback: { backgroundColor: '#444' },
});
