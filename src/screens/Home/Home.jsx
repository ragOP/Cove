import {useNavigation} from '@react-navigation/native';
import React, {useState, useRef} from 'react';
import {StyleSheet, View, FlatList, Animated, Pressable} from 'react-native';
import {
  Text,
  Avatar,
  Searchbar,
  IconButton,
  Badge,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

const contacts = [
  {
    id: '1',
    name: 'Alice Johnson',
    message: 'Hey, how are you?',
    time: '9:30 PM',
    count: 2,
    username: 'alicej',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: '2',
    name: 'Bob Smith',
    message: 'See you soon!',
    time: '8:15 AM',
    count: 0,
    username: 'bobsmith',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
];

const ContactRow = ({item, onPress, onLongPress, selected}) => {
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

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      style={styles.pressable}
      android_ripple={{color: '#233d2e'}}>
      <Animated.View
        style={[styles.contactRow, {transform: [{scale}], backgroundColor}]}>
        <Avatar.Image size={54} source={{uri: item.avatar}} />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactMessage}>{item.message}</Text>
        </View>
        <View style={styles.contactMeta}>
          <Text style={styles.contactTime}>{item.time}</Text>
          {item.count > 0 && (
            <Badge style={styles.badge}>+{item.count - 1}</Badge>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const OutlinedIcon = _props => (
  <Icon name="add-circle-outline" size={28} color="#fff" />
);

const Home = () => {
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const totalUnread = contacts.reduce((sum, c) => sum + c.count, 0);

  const handleContactPress = item => {
    setSelectedId(item.id);
    navigation.navigate('ContactChat', {contact: item});
  };

  const handleContactLongPress = item => {
    setSelectedId(item.id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>All Chats</Text>
        <IconButton
          icon={OutlinedIcon}
          size={28}
          onPress={() => {}}
          style={styles.plusIcon}
        />
      </View>

      <Searchbar
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
        iconColor="#D28A8C"
        placeholderTextColor="#D28A8C"
      />

      {/* All Unread Chip */}
      {totalUnread > 0 && (
        <View style={styles.chipRow}>
          <Chip
            style={styles.unreadChip}
            textStyle={styles.unreadChipText}
            selectedColor="#fff">
            All
          </Chip>
          <Chip
            style={styles.unreadChip}
            textStyle={styles.unreadChipText}
            selectedColor="#fff">
            Unread ({totalUnread})
          </Chip>
        </View>
      )}

      <FlatList
        data={contacts}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ContactRow
            item={item}
            onPress={() => handleContactPress(item)}
            onLongPress={() => handleContactLongPress(item)}
            selected={selectedId === item.id}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  plusIcon: {
    margin: 0,
  },
  chipRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  unreadChip: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingHorizontal: 2,
    paddingVertical: 0,
  },
  unreadChipText: {
    color: '#fff',
    fontSize: 14,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 24,
    backgroundColor: '#000',
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
  pressable: {
    width: '100%',
    alignSelf: 'stretch',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: 'transparent',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    gap: 6,
  },
  contactName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  contactMessage: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 14,
    marginTop: 2,
  },
  contactMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  contactTime: {
    fontSize: 12,
    color: '#888',
  },
  badge: {
    backgroundColor: '#fff',
    color: '#000',
    fontWeight: 'bold',
  },
});
