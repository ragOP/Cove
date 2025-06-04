import {KeyboardAvoidingView, Platform, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import ChatsContainer from './components/ChatsContainer';
import ContactHeader from './components/ContactHeader';
import SendChat from './components/SendChat';
import {useRoute} from '@react-navigation/native';
import {getChatDisplayInfo} from '../../utils/chat/getChatDisplayInfo';
import {useSelector} from 'react-redux';

const ContactChat = () => {
  const route = useRoute();
  const reduxAuth = useSelector(state => state.auth);
  const userId = reduxAuth.user?.id;

  const contact = route.params?.contact;
  const conversationId = contact?._id;
  const contactDetails = getChatDisplayInfo(contact, userId);

  const [conversations, setConversations] = useState([]);

  if (!contactDetails) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <View style={styles.container}>
        <ContactHeader
          name={contactDetails.name}
          username={contactDetails.username}
          profilePicture={contactDetails.profilePicture}
        />
        <ChatsContainer
          conversationId={contactDetails._id}
          conversations={conversations}
          setConversations={setConversations}
        />
        <SendChat
          conversationId={conversationId}
          conversations={conversations}
          setConversations={setConversations}
          receiverId={contactDetails._id}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ContactChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  keyboardContainer: {
    flex: 1,
  },
});
