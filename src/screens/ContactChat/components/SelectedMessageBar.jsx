import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * WhatsApp-style action bar for selected message(s).
 * Props:
 * - selectedMessage: the message object currently selected
 * - onClose: function to clear selection
 * - onCopy: function to copy message
 * - onDelete: function to delete message (optional)
 * - onReply: function to reply to message (optional)
 */
const SelectedMessageBar = ({ selectedMessage, onClose, onCopy, onDelete, onReply }) => {
  if (!selectedMessage) return null;
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
        <Icon name="close" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.messagePreview}>
        <Text style={styles.sender}>{selectedMessage.sender?.name || 'You'}</Text>
        <Text style={styles.previewText} numberOfLines={1}>
          {selectedMessage.content || '[media]'}
        </Text>
      </View>
      <TouchableOpacity onPress={() => onCopy(selectedMessage)} style={styles.iconBtn}>
        <Icon name="copy" size={22} color="#fff" />
      </TouchableOpacity>
      {onReply && (
        <TouchableOpacity onPress={() => onReply(selectedMessage)} style={styles.iconBtn}>
          <Icon name="return-up-back" size={22} color="#fff" />
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity onPress={() => onDelete(selectedMessage)} style={styles.iconBtn}>
          <Icon name="trash" size={22} color="#f55" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  iconBtn: {
    padding: 6,
    marginHorizontal: 2,
  },
  messagePreview: {
    flex: 1,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  sender: {
    color: '#bbb',
    fontSize: 12,
    marginBottom: 2,
  },
  previewText: {
    color: '#fff',
    fontSize: 15,
  },
});

export default SelectedMessageBar;
