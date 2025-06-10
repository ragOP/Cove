import {useQuery} from '@tanstack/react-query';
import React, {useState} from 'react';
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
import {getUserMedia} from '../../../apis/getUserMedia';
import PrimaryLoader from '../../../components/Loaders/PrimaryLoader';
import CustomImage from '../../../components/Image/CustomImage';
import ImagePlaceholder from '../../../components/Placeholder/ImagePlaceholder';

const numColumns = 3;
const {width} = Dimensions.get('window');
const itemSize = (width - 32 - (numColumns - 1) * 6) / numColumns;

// Move GalleryItem outside GallerySection to avoid unstable nested component
const GalleryItem = ({item, onPress, styles}) => {
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
            source={{uri: item.mediaUrl}}
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
            source={{uri: item.thumb}}
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

const GallerySection = ({onMediaPress, id}) => {
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
    queryFn: () => getUserMedia({id, params}),
    select: data => data?.response?.data || [],
  });

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

  console.log('Media List:', mediaList);

  return (
    <FlatList
      data={mediaList}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <GalleryItem item={item} onPress={onMediaPress} styles={styles} />
      )}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      onEndReached={() => {
        if (mediaList.length % params.per_page === 0) {
          setParams(prev => ({...prev, page: prev.page + 1}));
          refetchMedia();
        }
      }}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefetchingSuggested}
          onRefresh={() => {
            setParams({page: 1, per_page: 20});
            setTimeout(() => refetchMedia(), 0);
          }}
          colors={['#D28A8C']}
          tintColor="#D28A8C"
        />
      }
    />
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
    transform: [{translateX: -16}, {translateY: -16}],
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
});
