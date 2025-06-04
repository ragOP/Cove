import React, {useState} from 'react';
import {StyleSheet, TextInput, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {sendMessage} from '../../../apis/sendMessage';
import {useSelector} from 'react-redux';

const SendChat = ({
  conversationId,
  conversations,
  setConversations,
  receiverId,
}) => {
  const userId = useSelector(state => state.auth.user?.id);

  const [message, setMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  console.log('>>>', conversations);

  const handleSend = async () => {
    if (!message.trim() || isSendingMessage) {
      return;
    }

    try {
      setIsSendingMessage(true);

      const messagePayload = {
        // senderId: userId,
        receiverId: receiverId,
        content: message,
        type: 'text',
      };

      const apiResponse = await sendMessage({
        payload: messagePayload,
      });

      if (apiResponse?.response?.success) {
        const data = apiResponse.response.data;
        console.log('Message sent successfully:', data);
        setConversations && setConversations(prev => [...(prev || []), data]);
        setMessage('');
      } else {
        console.error(
          'Failed to send message:',
          apiResponse?.response?.message,
        );
      }
    } catch (error) {
      console.error('Error setting isSendingMessage:', error);
      return;
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type a message"
        placeholderTextColor="#bbb"
        value={message}
        onChangeText={setMessage}
        selectionColor="#fff"
        returnKeyType="send"
        autoFocus={true}
      />
      <TouchableOpacity style={styles.iconButton}>
        <Icon name="mic" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={handleSend}>
        <Icon name="send" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton}>
        <Icon name="add-circle-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default SendChat;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#383838',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  iconButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
