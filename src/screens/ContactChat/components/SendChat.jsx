import React, {useState} from 'react';
import {StyleSheet, TextInput, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SendChat = () => {
  const [message, setMessage] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type a message"
        placeholderTextColor="#bbb"
        value={message}
        onChangeText={setMessage}
        selectionColor="#fff"
      />
      <TouchableOpacity style={styles.iconButton}>
        <Icon name="mic" size={24} color="#fff" />
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
