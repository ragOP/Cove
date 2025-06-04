import React from 'react';
import {Avatar} from 'react-native-paper';
import {getInitials} from '../../utils/name/getInitials';
import {StyleSheet} from 'react-native';

const UserAvatar = ({profilePicture, name, id, size = 44}) => {
  return profilePicture ? (
    <Avatar.Image size={size} source={{uri: profilePicture}} />
  ) : (
    <Avatar.Text
      size={size}
      label={getInitials(name) || id}
      style={styles.avatarText}
    />
  );
};

const styles = StyleSheet.create({
  avatarText: {
    backgroundColor: '#444',
  },
});

export default UserAvatar;
