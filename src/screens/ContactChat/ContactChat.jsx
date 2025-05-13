import {StyleSheet, View} from 'react-native';
import React from 'react';
import ChatsContainer from './components/ChatsContainer';
import ContactHeader from './components/ContactHeader';
import SendChat from './components/SendChat';

const ContactChat = () => {
  return (
    <View style={styles.container}>
      <ContactHeader />
      <ChatsContainer />
      <SendChat />
    </View>
  );
};

export default ContactChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
});
