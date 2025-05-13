import React from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {Avatar, Text} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';

const ContactHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const contact = route.params?.contact;

  if (!contact) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.detailsIconsContainer}>
        <View style={styles.nameDetailsContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.profileContainer}>
            <Avatar.Image
              source={{uri: contact.avatar}}
              size={40}
              style={styles.avatarStyle}
            />
            <View style={styles.profileNameUsername}>
              <Text style={styles.nameText}>{contact.name}</Text>
              <Text style={styles.usernameText}>@{contact.username}</Text>
            </View>
          </View>
        </View>
        <View style={styles.iconsContainer}>
          <Icon name="call-outline" size={26} color="#fff" />
          <FeatherIcon name="more-horizontal" size={30} color="#fff" />
        </View>
      </View>

      <View style={styles.tabContainer}>
        <View style={[styles.chatTabBox, styles.tabBorder]}>
          <Icon
            name="chatbubble-ellipses"
            size={26}
            color="rgba(255, 255, 255, 0.5)"
          />
          <Text style={styles.tabText}>Chat</Text>
        </View>
        <View style={styles.chatTabBox}>
          <MaterialIcon
            name="card-multiple-outline"
            size={26}
            color="rgba(255, 255, 255, 0.5)"
          />
          <Text style={styles.tabText}>Gallery</Text>
        </View>
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

  // Tab container styles
  tabContainer: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTabBox: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 12,
  },
  tabBorder: {
    borderRightWidth: 2,
    borderRightColor: 'rgba(102, 102, 102, 1)',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
