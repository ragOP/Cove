import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Home from '../../screens/Home/Home';
import { Paths } from '../../navigaton/paths';

const ChatTabScreen = () => {
  const navigation = useNavigation();

  // Handle navigation to other screens from the chat tab
  const handleNavigateToChat = (contact) => {
    navigation.navigate(Paths.CONTACT_CHAT, { contact });
  };

  const handleNavigateToAddContact = () => {
    navigation.navigate(Paths.ADD_CONTACT);
  };

  const handleNavigateToFriendRequests = () => {
    navigation.navigate(Paths.FRIEND_REQUESTS);
  };

  return (
    <View style={styles.container}>
      <Home 
        onNavigateToChat={handleNavigateToChat}
        onNavigateToAddContact={handleNavigateToAddContact}
        onNavigateToFriendRequests={handleNavigateToFriendRequests}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
});

export default ChatTabScreen; 