import React from 'react';
import {StyleSheet, View, TouchableOpacity, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {Text, Menu} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import UserAvatar from '../../../components/CustomAvatar/UserAvatar';
import {Paths} from '../../../navigation/paths';

const AccountOutlineIconWhite = props => (
  <MaterialIcon name="account-outline" {...props} color="#fff" />
);
const BlockHelperIconWhite = props => (
  <MaterialIcon name="block-helper" {...props} color="#fff" />
);
const AlertCircleOutlineIconWhite = props => (
  <MaterialIcon name="alert-circle-outline" {...props} color="#fff" />
);
const MuteIconWhite = props => (
  <MaterialIcon name="bell-off-outline" {...props} color="#fff" />
);

const ContactHeader = ({
  name,
  profilePicture,
  isOnline,
  lastSeen,
  activeTab,
  onTabChange,
  isFetchingUserStatus,
  user
}) => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  // Placeholder for call functionality
  const handleCall = () => {
    // TODO: Implement call logic (audio/video)
    closeMenu();
  };

  // Placeholder for block/report functionality
  const handleBlock = () => {
    // TODO: Implement block logic
    closeMenu();
  };
  const handleReport = () => {
    // TODO: Implement report logic
    closeMenu();
  };
  const handleViewProfile = () => {
    setMenuVisible(false);
    navigation.navigate(Paths.ProfileView, {user: user});
  };

  function formatLastSeen(date) {
    if (!date) {
      return '';
    }
    const d = new Date(date);
    const now = new Date();
    if (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      // Today
      return `last seen today at ${d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return `last seen on ${d.toLocaleDateString()} at ${d.toLocaleTimeString(
        [],
        {hour: '2-digit', minute: '2-digit'},
      )}`;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.detailsIconsContainer}>
        <View style={styles.nameDetailsContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.profileContainer}>
            <UserAvatar profilePicture={profilePicture} size={40} name={name} />
            <View style={styles.profileNameUsername}>
              <TouchableOpacity onPress={handleViewProfile} activeOpacity={0.7}>
                <Text style={styles.nameText}>{name}</Text>
              </TouchableOpacity>
              {isFetchingUserStatus ? (
                // <View style={styles.statusLoader} />
                null
              ) : isOnline ? (
                <Text style={[styles.usernameText, styles.onlineText]}>
                  online
                </Text>
              ) : lastSeen ? (
                <Text style={styles.usernameText}>
                  {formatLastSeen(lastSeen)}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
        <View style={styles.iconsContainer}>
          {/* <TouchableOpacity onPress={handleCall} style={styles.iconBtn}>
            <Icon name="call-outline" size={26} color="#D28A8C" />
          </TouchableOpacity> */}
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <Pressable
                onPress={openMenu}
                style={({pressed}) => [
                  styles.iconBtn,
                  pressed && {backgroundColor: 'rgba(210,138,140,0.13)'},
                ]}
                android_ripple={{color: '#D28A8C'}}>
                <FeatherIcon name="more-horizontal" size={30} color="#fff" />
              </Pressable>
            }
            style={styles.menuContent}
            contentStyle={styles.menuContent}>
            <Menu.Item
              onPress={handleViewProfile}
              title="View Profile"
              leadingIcon={AccountOutlineIconWhite}
              titleStyle={styles.menuItemTitle}
              style={styles.menuItem}
              iconColor="#fff"
            />
            <Menu.Item
              onPress={() => {
                closeMenu();
              }}
              title="Mute Notifications"
              leadingIcon={MuteIconWhite}
              titleStyle={styles.menuItemTitle}
              style={styles.menuItem}
              iconColor="#fff"
            />
            <Menu.Item
              onPress={() => {
                closeMenu();
                handleBlock();
              }}
              title="Block"
              leadingIcon={BlockHelperIconWhite}
              titleStyle={styles.menuItemTitle}
              style={styles.menuItem}
              iconColor="#fff"
            />
            <Menu.Item
              onPress={() => {
                closeMenu();
                handleReport();
              }}
              title="Report"
              leadingIcon={AlertCircleOutlineIconWhite}
              titleStyle={styles.menuItemTitle}
              style={styles.menuItemLast}
              iconColor="#fff"
            />
          </Menu>
        </View>
      </View>

      <View style={styles.tabToggleRow}>
        <TouchableOpacity
          style={[
            styles.tabToggleBtn,
            activeTab === 'chat' && styles.tabActive,
          ]}
          onPress={() => onTabChange('chat')}
          activeOpacity={0.85}>
          <Icon
            name="chatbubble-ellipses"
            size={22}
            color={activeTab === 'chat' ? '#D28A8C' : 'rgba(255,255,255,0.5)'}
            style={styles.tabIconMargin}
          />
          <Text
            style={[
              styles.tabToggleText,
              activeTab === 'chat' && styles.tabActiveText,
            ]}>
            Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabToggleBtn,
            activeTab === 'gallery' && styles.tabActive,
          ]}
          onPress={() => onTabChange('gallery')}
          activeOpacity={0.85}>
          <MaterialIcon
            name="card-multiple-outline"
            size={22}
            color={
              activeTab === 'gallery' ? '#D28A8C' : 'rgba(255,255,255,0.5)'
            }
            style={styles.tabIconMargin}
          />
          <Text
            style={[
              styles.tabToggleText,
              activeTab === 'gallery' && styles.tabActiveText,
            ]}>
            Gallery
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContactHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  detailsIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(102, 102, 102, 1)',
  },
  nameDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 4,
  },
  profileNameUsername: {
    gap: 4,
  },
  avatarStyle: {
    backgroundColor: '#fff',
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  menuContent: {
    backgroundColor: '#D28A8C',
    borderRadius: 16,
    minWidth: 210,
    paddingVertical: 0,
    paddingHorizontal: 0,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#232323',
  },
  menuItem: {
    borderRadius: 12,
    marginVertical: 2,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemTitle: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
    letterSpacing: 0.1,
  },
  statusLoader: {
    width: 60,
    height: 12,
    backgroundColor: '#222',
    borderRadius: 6,
  },
  nameText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  usernameText: {
    color: '#bbb',
    fontSize: 12,
  },
  onlineText: {
    color: '#4cd137',
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#232323',
    marginBottom: 0,
  },
  tabToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  tabToggleText: {
    color: '#bbb',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#D28A8C',
    backgroundColor: '#202124',
  },
  tabActiveText: {
    color: '#D28A8C',
  },
  tabIconMargin: {
    marginRight: 6,
  },
});
