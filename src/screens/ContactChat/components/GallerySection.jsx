import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getUserMedia } from '../../../apis/getUserMedia';
import PrimaryLoader from '../../../components/Loaders/PrimaryLoader';
import CustomImage from '../../../components/Image/CustomImage';
import ImagePlaceholder from '../../../components/Placeholder/ImagePlaceholder';
import { format } from 'date-fns';
import { formatDateLabel } from '../../../utils/date/formatDateLabel';

const numColumns = 3;
const { width } = Dimensions.get('window');
const itemSize = (width - 32 - (numColumns - 1) * 6) / numColumns;

const GalleryItem = ({ item, onPress, styles }) => {
  const [error, setError] = React.useState(false);
  if (item.type === 'image') {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => onPress?.(item)}
        activeOpacity={0.85}>
        {error ? (
          <ImagePlaceholder style={styles.image} />
        ) : (
          <CustomImage
            source={{ uri: item.mediaUrl }}
            style={styles.image}
            onError={() => setError(true)}
          />
        )}
      </TouchableOpacity>
    );
  }
  // video
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onPress?.(item)}
      activeOpacity={0.85}>
      <View style={styles.videoThumb}>
        {error ? (
          <ImagePlaceholder style={styles.image} />
        ) : (
          <CustomImage
            source={{ uri: item.thumb }}
            style={styles.image}
            onError={() => setError(true)}

          />
        )}
        <View style={styles.playIconWrap}>
          <Icon name="play-circle" size={32} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const GallerySection = ({ onMediaPress, id }) => {
  const [params, setParams] = useState({
    page: 1,
    per_page: 20,
  });

  const {
    data: mediaList = [],
    isLoading: isLoadingMedia,
    refetch: refetchMedia,
    isRefetching: isRefetchingSuggested,
  } = useQuery({
    queryKey: ['suggested-users'],
    queryFn: () => getUserMedia({ id, params }),
    select: data => data?.response?.data || [],
  });

  // Group media by date
  const groupMediaByDate = (mediaList) => {
    const groups = [];
    let lastDate = null;
    let currentGroup = null;
    mediaList.forEach(item => {
      const date = item.createdAt ? formatDateLabel(item.createdAt) : '';
      if (date !== lastDate) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { date, items: [] };
        lastDate = date;
      }
      currentGroup.items.push(item);
    });
    if (currentGroup) groups.push(currentGroup);
    return groups;
  };

  const groupedMedia = groupMediaByDate(mediaList);

  if (isLoadingMedia) {
    return (
      <View style={styles.loadingContainer}>
        <PrimaryLoader />
      </View>
    );
  }

  if (!mediaList || mediaList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon
          name="images-outline"
          size={64}
          color="#D28A8C"
          style={styles.emptyIcon}
        />
        <View style={styles.spacer12} />
        <View style={styles.emptyTextWrap}>
          <Text style={styles.emptyTitle}>No Media Yet</Text>
          <Text style={styles.emptySubtitle}>
            Shared images and videos will appear here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {groupedMedia.map((group, idx) => (
        <View key={group.date || idx} style={styles.dateSection}>
          <View style={styles.dateLabelContainer}>
            <Text style={styles.dateLabelText}>{group.date}</Text>
          </View>
          <View style={styles.imagesRow}>
            {group.items.map(item => (
              <GalleryItem key={item.id} item={item} onPress={onMediaPress} styles={styles} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export default GallerySection;

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingBottom: 24,
  },
  item: {
    width: itemSize,
    height: itemSize,
    margin: 3,
    overflow: 'hidden',
    backgroundColor: '#232323',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingIcon: {
    marginBottom: 12,
    opacity: 0.8,
  },
  loadingBar: {
    width: 80,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#232323',
    marginVertical: 4,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.9,
  },
  emptyTextWrap: {
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#bbb',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.85,
  },
  spacer12: {
    height: 12,
  },
  refetchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 18,
    backgroundColor: 'rgba(210,138,140,0.08)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  refetchIcon: {
    marginRight: 8,
  },
  refetchText: {
    color: '#D28A8C',
    fontWeight: 'bold',
    fontSize: 15,
  },
  dateLabelContainer: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    marginLeft: 8,
  },
  dateLabelText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  dateSection: {
    marginBottom: 16,
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2, // Reduced gap for more images per row
    marginLeft: 4,
  },
});
