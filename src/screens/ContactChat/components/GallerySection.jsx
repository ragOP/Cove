import React from 'react';
import { View, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const numColumns = 3;
const { width } = Dimensions.get('window');
const itemSize = (width - 32 - (numColumns - 1) * 6) / numColumns;

export default function GallerySection({ media, onMediaPress }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => onMediaPress?.(item)} activeOpacity={0.85}>
      {item.type === 'image' ? (
        <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.videoThumb}>
          <Image source={{ uri: item.thumb }} style={styles.image} resizeMode="cover" />
          <View style={styles.playIconWrap}>
            <Icon name="play-circle" size={32} color="#fff" />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={media}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingBottom: 24,
  },
  item: {
    width: itemSize,
    height: itemSize,
    margin: 3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#232323',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoThumb: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818',
  },
  playIconWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 2,
  },
});
