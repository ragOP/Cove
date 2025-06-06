import React from 'react';
import {Text, Image, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {styles} from '../../components/Messages/MessageItem';

export function renderMessageContent(item, isSent) {
  const textStyle = isSent ? styles.sentText : styles.receivedText;

  // console.log('Rendering message content:', item);

  switch (item.type) {
    case 'text':
      return <Text style={textStyle}>{item.content}</Text>;
    case 'image':
      return (
        <View>
          <Image
            source={{uri: item.mediaUrl}}
            style={styles.imageMessage}
            resizeMode="cover"
          />
          {item.content && item.content.trim() !== '' && (
            <Text style={textStyle}>{item.content}</Text>
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
            style={{marginBottom: 4}}
          />
          <Text style={textStyle}>Video message</Text>
        </View>
      );
    default:
      return <Text style={textStyle}>Unsupported message type</Text>;
  }
}
