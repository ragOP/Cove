import React, { memo } from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from './MessageItem';
import ChatText from './ChatText';
import CustomImage from '../Image/CustomImage';
import { markAsSensitive } from '../../apis/markAsSensitive';
import { markAsUnsensitive } from '../../apis/markAsUnsensitive';
import { deleteMessages } from '../../apis/deleteMessages';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../../redux/slice/snackbarSlice';

const chatTextStyles = {
  videoIcon: {marginBottom: 4},
};

const RenderMessageContent = memo(({item, isSent, onMarkSensitive, onMarkUnsensitive, onDelete}) => {
  const textStyle = isSent ? styles.sentText : styles.receivedText;
  const dispatch = useDispatch();

  // Get current user ID from Redux
  const currentUserId = useSelector(state => state.auth.user?.id);

  const handleMarkSensitive = async (image) => {
    try {
      const response = await markAsSensitive({ ids: [item._id] });
      if (response?.response?.success) {
        // Update the message in the parent component
        if (onMarkSensitive) {
          onMarkSensitive(item._id, true);
        }
        dispatch(
          showSnackbar({
            type: 'success',
            title: 'Marked as Sensitive',
            subtitle: 'Message has been marked as sensitive',
            placement: 'top',
          }),
        );
      } else {
        const errorMessage = response?.response?.data?.message || 'Failed to mark message as sensitive';
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Error',
            subtitle: errorMessage,
            placement: 'top',
          }),
        );
      }
    } catch (error) {
      console.error('Error marking message as sensitive:', error);
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Server Error',
          subtitle: 'Failed to mark message as sensitive',
          placement: 'top',
        }),
      );
    }
  };

  const handleMarkUnsensitive = async (image) => {
    try {
      const response = await markAsUnsensitive({ ids: [item._id] });
      if (response?.response?.success) {
        // Update the message in the parent component
        if (onMarkUnsensitive) {
          onMarkUnsensitive(item._id, false);
        }
        dispatch(
          showSnackbar({
            type: 'success',
            title: 'Marked as Insensitive',
            subtitle: 'Message has been marked as insensitive',
            placement: 'top',
          }),
        );
      } else {
        const errorMessage = response?.response?.data?.message || 'Failed to mark message as insensitive';
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Error',
            subtitle: errorMessage,
            placement: 'top',
          }),
        );
      }
    } catch (error) {
      console.error('Error marking message as insensitive:', error);
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Server Error',
          subtitle: 'Failed to mark message as insensitive',
          placement: 'top',
        }),
      );
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteMessages({ ids: [item._id] });
      if (response?.response?.success) {
        // Update the message in the parent component
        if (onDelete) {
          onDelete(item._id);
        }
        dispatch(
          showSnackbar({
            type: 'success',
            title: 'Message Deleted',
            subtitle: 'Message has been deleted successfully',
            placement: 'top',
          }),
        );
      } else {
        const errorMessage = response?.response?.data?.message || 'Failed to delete message';
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Error',
            subtitle: errorMessage,
            placement: 'top',
          }),
        );
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Server Error',
          subtitle: 'Failed to delete message',
          placement: 'top',
        }),
      );
    }
  };

  switch (item.type) {
    case 'text':
      return <ChatText text={item.content} style={textStyle} />;
    case 'image':
      return (
        <View>
          <View style={{position: 'relative'}}>
            <CustomImage
              source={{uri: item.mediaUrl}}
              style={styles.imageMessage}
              showPreview={true}
              resizeMode="cover"
              isSensitive={item.isSensitive}
              messageContent={item.content}
              messageId={item._id}
              sender={item.sender}
              currentUserId={currentUserId}
              timestamp={item.timestamp}
              onMarkSensitive={handleMarkSensitive}
              onMarkUnsensitive={handleMarkUnsensitive}
              onDelete={handleDelete}
            />
            {item.isSensitive && (
              <View style={styles.protectedBadge}>
                <MaterialIcon name="shield-outline" size={10} color="#fff" />
              </View>
            )}
          </View>
          {item.content && item.content.trim() !== '' && (
            <ChatText text={item.content} style={textStyle} />
          )}
        </View>
      );
    case 'text-image':
      return (
        <View>
          <View style={{position: 'relative'}}>
            <CustomImage
              source={{uri: item.mediaUrl}}
              style={styles.imageMessage}
              showPreview={true}
              resizeMode="cover"
              isSensitive={item.isSensitive}
              messageContent={item.content}
              messageId={item._id}
              sender={item.sender}
              currentUserId={currentUserId}
              timestamp={item.timestamp}
              onMarkSensitive={handleMarkSensitive}
              onMarkUnsensitive={handleMarkUnsensitive}
              onDelete={handleDelete}
            />
            {item.isSensitive && (
              <View style={styles.protectedBadge}>
                <MaterialIcon name="shield-outline" size={10} color="#fff" />
              </View>
            )}
          </View>
          {item.content && item.content.trim() !== '' && (
            <ChatText text={item.content} style={textStyle} />
          )}
        </View>
      );
    case 'video':
      return (
        <View style={styles.videoContainer}>
          <Icon
            name="videocam"
            size={32}
            color="#fff"
            style={chatTextStyles.videoIcon}
          />
          <Text style={textStyle}>Video message</Text>
        </View>
      );
    default:
      return <Text style={textStyle}>Unsupported message type</Text>;
  }
});

export default RenderMessageContent;
