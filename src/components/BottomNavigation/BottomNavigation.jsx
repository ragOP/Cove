import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomNavigation } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LucideIcon from 'react-native-vector-icons/Feather';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { setBottomNavIndex } from '../../redux/slice/chatSlice';
import ChatTabScreen from './ChatTabScreen';
import ProfileTabScreen from './ProfileTabScreen';
import StatusScreen from '../../screens/StatusScreen/StatusScreen';
import GalleryScreen from '../../screens/GalleryScreen/GalleryScreen';

const DotBadge = ({ focused }) => (
  <View
    style={[
      styles.dotBadge,
      { backgroundColor: focused ? '#D28A8C' : '#fff' }
    ]}
  />
);

const CustomBottomNavigation = () => {
  const dispatch = useDispatch();
  const index = useSelector(state => state.chat.bottomNavIndex);
  const isGallerySelectionMode = useSelector(state => state.chat.isGallerySelectionMode);
  const navigation = useNavigation();

  // Get notification counts from Redux
  const contacts = useSelector(state => state.chat.contacts);
  const chatNotificationCount = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const statusNotificationCount = 0; // Set to 0 for now, can be updated later

  const PRIMARY_COLOR = '#D28A8C';
  const NAV_BG_COLOR = '#181818';

  const routes = [
    {
      key: 'chat',
      title: 'Chat',
      focusedIcon: 'chatbubble-ellipses',
      unfocusedIcon: 'chatbubble-ellipses-outline',
    },
    {
      key: 'gallery',
      title: 'Gallery',
      focusedIcon: 'card-multiple',
      unfocusedIcon: 'card-multiple-outline',
    },
    {
      key: 'status',
      title: 'Status',
      focusedIcon: 'loader',
      unfocusedIcon: 'loader',
    },
    {
      key: 'me',
      title: 'Me',
      focusedIcon: 'person',
      unfocusedIcon: 'person-outline',
    },
  ];

  const renderScene = BottomNavigation.SceneMap({
    chat: ChatTabScreen,
    gallery: GalleryScreen,
    status: StatusScreen,
    me: ProfileTabScreen,
  });

  const renderIcon = ({ route, focused, color }) => {
    const iconName = focused ? route.focusedIcon : route.unfocusedIcon;

    // Use different icon libraries based on the route
    let icon;
    if (route.key === 'gallery') {
      icon = <MaterialIcon name={iconName} size={24} color={color} />;
    } else if (route.key === 'status') {
      icon = <LucideIcon name={iconName} size={24} color={color} />;
    } else {
      icon = <Icon name={iconName} size={24} color={color} />;
    }

    // Overlay the custom dot for chat and status tabs if needed
    const showDot =
      (route.key === 'chat' && chatNotificationCount > 0) ||
      (route.key === 'status' && statusNotificationCount > 0);

    return (
      <View style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        {icon}
        {showDot && <DotBadge focused={focused} />}
      </View>
    );
  };

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={(newIndex) => dispatch(setBottomNavIndex(newIndex))}
      renderScene={renderScene}
      renderIcon={renderIcon}
      barStyle={styles.bottomNavBar}
      activeColor={PRIMARY_COLOR}
      inactiveColor="#888"
      theme={{
        colors: {
          secondaryContainer: 'transparent',
          onSecondaryContainer: PRIMARY_COLOR,
          primary: PRIMARY_COLOR,
          notification: PRIMARY_COLOR, // badge color
        },
      }}
    />
  );
};

const styles = StyleSheet.create({
  bottomNavBar: {
    backgroundColor: '#181818',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    height: 80,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  placeholderSubText: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  dotBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#181818',
    zIndex: 100,
  },
});

export default CustomBottomNavigation; 