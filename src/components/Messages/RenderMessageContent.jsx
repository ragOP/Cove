import React from 'react';
import {Text, Image, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {styles} from './MessageItem';
import ChatText from './ChatText';
import CustomImage from '../Image/CustomImage';

// Inline styles for ChatText
const chatTextStyles = {
  videoIcon: {marginBottom: 4},
};

// Custom Text wrapper for chat: handles links, emails, phones, mentions, hashtags, emojis, etc.
function RenderMessageContent({item, isSent}) {
  const textStyle = isSent ? styles.sentText : styles.receivedText;

  // console.log('Rendering message content:', item);

  switch (item.type) {
    case 'text':
      return <ChatText text={item.content} style={textStyle} />;
    case 'image':
      return (
        <View>
          <CustomImage
            source={{uri: item.mediaUrl}}
            style={styles.imageMessage}
            showPreview={true}
            resizeMode="cover"
          />
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
}

export default RenderMessageContent;
