import React from 'react';
import {View} from 'react-native';
import {Text, Avatar, Button} from 'react-native-paper';
import HomeStyles from '../styles/HomeStyles';

const EmptyContactsState = ({onAddPress}) => (
  <View style={HomeStyles.emptyStateContainer}>
    <Avatar.Icon
      icon="message-text-outline"
      size={100}
      style={HomeStyles.emptyAvatar}
      color="#D28A8C"
    />
    <Text style={HomeStyles.emptyTitle}>No Chats Yet</Text>
    <Text style={HomeStyles.emptySubtitle}>
      Start a new conversation by adding a contact. Your chats will appear here.
    </Text>
    <Button
      mode="contained"
      icon="account-plus"
      style={HomeStyles.emptyButton}
      labelStyle={HomeStyles.emptyButtonLabel}
      onPress={onAddPress}>
      Add Contact
    </Button>
  </View>
);

export default EmptyContactsState;
