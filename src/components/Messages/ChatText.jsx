import React from 'react';
import { Text, Linking } from 'react-native';

const chatTextStyles = {
  link: { color: '#4A90E2', textDecorationLine: 'underline' },
  mention: { color: '#D28A8C', fontWeight: 'bold' },
  hashtag: { color: '#8AD2B7', fontWeight: 'bold' },
};

/**
 * ChatText - Smart text renderer for chat apps
 * Handles: links, emails, phones, mentions, hashtags, emojis, unicode, etc.
 * @param {string} text
 * @param {object} style
 */
export default function ChatText({ text, style }) {
  // Regex patterns
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  const phonePattern = /((?:\+\d{1,3}[- ]?)?\d{10,13})/g;
  const mentionPattern = /(@[\w]+)/g;
  const hashtagPattern = /(#[\w]+)/g;

  // Split text into parts (order: url, email, phone, mention, hashtag)
  const parseText = (input) => {
    let result = [];
    let lastIndex = 0;
    const patterns = [
      { regex: urlPattern, type: 'url' },
      { regex: emailPattern, type: 'email' },
      { regex: phonePattern, type: 'phone' },
      { regex: mentionPattern, type: 'mention' },
      { regex: hashtagPattern, type: 'hashtag' },
    ];
    // Merge all matches
    let matches = [];
    patterns.forEach(({ regex, type }) => {
      let match;
      while ((match = regex.exec(input))) {
        matches.push({
          type,
          match: match[0],
          index: match.index,
        });
      }
    });
    // Sort by index
    matches = matches.sort((a, b) => a.index - b.index);
    // Build result
    matches.forEach(({ type, match, index }) => {
      if (index > lastIndex) {
        result.push({ text: input.slice(lastIndex, index), type: 'text' });
      }
      result.push({ text: match, type });
      lastIndex = index + match.length;
    });
    if (lastIndex < input.length) {
      result.push({ text: input.slice(lastIndex), type: 'text' });
    }
    return result;
  };

  const handlePress = (part) => {
    switch (part.type) {
      case 'url':
        Linking.openURL(part.text.startsWith('http') ? part.text : `https://${part.text}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${part.text}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${part.text}`);
        break;
      case 'mention':
        // Optionally: open user profile
        break;
      case 'hashtag':
        // Optionally: open hashtag search
        break;
      default:
        break;
    }
  };

  const parts = parseText(text);

  return (
    <Text style={style} selectable>
      {parts.map((part, idx) => {
        if (part.type === 'url' || part.type === 'email' || part.type === 'phone') {
          return (
            <Text
              key={idx}
              style={[style, chatTextStyles.link]}
              onPress={() => handlePress(part)}
            >
              {part.text}
            </Text>
          );
        }
        if (part.type === 'mention') {
          return (
            <Text key={idx} style={[style, chatTextStyles.mention]}
              onPress={() => handlePress(part)}>
              {part.text}
            </Text>
          );
        }
        if (part.type === 'hashtag') {
          return (
            <Text key={idx} style={[style, chatTextStyles.hashtag]}
              onPress={() => handlePress(part)}>
              {part.text}
            </Text>
          );
        }
        return <Text key={idx} style={style}>{part.text}</Text>;
      })}
    </Text>
  );
}
