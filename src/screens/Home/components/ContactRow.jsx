import React, {useRef, useState} from 'react';
import {Animated, Pressable, View} from 'react-native';
import {Text, Badge} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import UserAvatar from '../../../components/CustomAvatar/UserAvatar';
import {getChatDisplayInfo} from '../../../utils/chat/getChatDisplayInfo';
import {getMessagePreview} from '../../../helpers/messages/getMessagePreview';
import {formatChatTime} from '../../../utils/message/formatChatTime';
import HomeStyles from '../styles/HomeStyles';

const ContactRow = ({item, onPress, onLongPress, selected, userId}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const [isHeld, setIsHeld] = useState(false);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: false,
        speed: 50,
        bounciness: 10,
      }),
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: false,
        speed: 50,
        bounciness: 10,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
    setIsHeld(false);
  };

  const handleLongPress = () => {
    setIsHeld(true);
    if (onLongPress) {
      onLongPress(item);
    }
  };

  const backgroundColor = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [selected || isHeld ? '#232323' : 'transparent', '#292929'],
  });

  const display = getChatDisplayInfo(item, userId);
  const unreadCount = item.unreadCount || 0;
  const lastMessage = item.lastMessage || null;
  const isGroup = Boolean(item?.participants?.length > 2);
  const previewMessage = lastMessage
    ? getMessagePreview(lastMessage, userId, isGroup)
    : '';
  const lastMessageTime = lastMessage?.timestamp
    ? lastMessage?.timestamp
    : item?.updatedAt;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      style={HomeStyles.pressable}
      android_ripple={{color: '#233d2e'}}>
      <Animated.View
        style={[HomeStyles.contactRow, {transform: [{scale}], backgroundColor}]}
      >
        <UserAvatar
          profilePicture={display.profilePicture}
          name={display.name}
          _id={display._id}
          size={54}
        />
        <View style={HomeStyles.contactInfo}>
          <Text style={HomeStyles.contactName}>{display.name}</Text>
          {Array.isArray(previewMessage) ? (
            <View style={HomeStyles.previewMessage}>
              {previewMessage[0]}
              <Text
                style={HomeStyles.previewText}
                numberOfLines={1}
                ellipsizeMode="tail"
                allowFontScaling={false}>
                {typeof previewMessage[1] === 'string'
                  ? previewMessage[1]
                  : String(previewMessage[1])}
              </Text>
            </View>
          ) : (
            <Text
              style={HomeStyles.previewText}
              numberOfLines={1}
              ellipsizeMode="tail"
              allowFontScaling={false}>
              {typeof previewMessage === 'string'
                ? previewMessage
                : String(previewMessage)}
            </Text>
          )}
        </View>
        <View style={HomeStyles.contactMeta}>
          <Text style={HomeStyles.contactTime}>
            {formatChatTime(lastMessageTime)}
          </Text>
          {unreadCount > 0 && (
            <Badge style={HomeStyles.badge}>
              {unreadCount === 1 ? 1 : `+${unreadCount - 1}`}
            </Badge>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default ContactRow;
