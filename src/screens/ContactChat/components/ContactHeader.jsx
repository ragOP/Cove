import React from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import UserAvatar from '../../../components/CustomAvatar/UserAvatar';

const ContactHeader = ({
  name,
  username,
  profilePicture,
  activeTab,
  onTabChange,
}) => {
  const navigation = useNavigation();

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
              <Text style={styles.nameText}>{name}</Text>
              {username && <Text style={styles.usernameText}>@{username}</Text>}
            </View>
          </View>
        </View>
        <View style={styles.iconsContainer}>
          <Icon name="call-outline" size={26} color="#fff" />
          <FeatherIcon name="more-horizontal" size={30} color="#fff" />
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
  nameText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  usernameText: {
    color: '#fff',
    fontSize: 14,
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
