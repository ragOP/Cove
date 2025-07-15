import Icon from 'react-native-vector-icons/Ionicons'; // or your icon lib

export function getMessagePreview(message, currentUserId, isGroup = false) {
  if (!message) return '';

  // If the message is deleted
  if (message.isDeleted) {
    if (message.sender?._id === currentUserId) {
      return 'You deleted this message';
    }
    return 'This message was deleted';
  }

  // If the message is a request
  if (message.isMessageRequest) {
    return 'Message request';
  }

  const isSentByMe = message.sender?._id === currentUserId;

  // For group: show sender name if not me, else tick icon
  // For non-group: show tick icon if me, else just message
  let prefix = '';
  if (isSentByMe) {
    // You sent the message: show tick icon based on status
    const status = message.status || 'delivered';

    console.log('status', status);
    let iconColor = '#bbb'; // Default to gray (delivered)
    
    if (status === 'read') {
      iconColor = '#4BB543'; // Green for read
    } else if (status === 'delivered' || status === 'sent' || status === 'unread') {
      iconColor = '#bbb'; // Gray for delivered/sent/unread (treated as delivered)
    }
    
    prefix = (
      <Icon
        name="checkmark-done"
        size={16}
        color={iconColor}
        style={{marginRight: 4, marginBottom: -2}}
      />
    );
  } else if (isGroup && message.sender?.name) {
    // Group message from someone else: show their name
    prefix = message.sender.name + ': ';
  }

  // Message content by type
  let content = '';
  switch (message.type) {
    case 'text':
      content = message.content || '';
      break;
    case 'image':
      content = '📷 Photo';
      break;
    case 'video':
      content = '🎥 Video';
      break;
    case 'audio':
      content = '🎤 Audio';
      break;
    case 'file':
      content = '📎 File';
      break;
    case 'sticker':
      content = 'Sticker';
      break;
    case 'gif':
      content = 'GIF';
      break;
    default:
      content = 'Unsupported message type';
  }

  if (typeof prefix !== 'string' && prefix) {
    return [prefix, content];
  }
  return prefix + content;
}
