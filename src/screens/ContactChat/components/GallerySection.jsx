import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserMedia } from '../../../apis/getUserMedia';
import PrimaryLoader from '../../../components/Loaders/PrimaryLoader';
import CustomImage from '../../../components/Image/CustomImage';
import ImagePlaceholder from '../../../components/Placeholder/ImagePlaceholder';
import { format } from 'date-fns';
import { formatDateLabel } from '../../../utils/date/formatDateLabel';
import ImageViewer from '../../../components/ImageViewer/ImageViewer';
import SelectionBottomBar from '../../../components/SelectionBottomBar/SelectionBottomBar';
import GallerySelectionBar from '../../../components/GallerySelectionBar/GallerySelectionBar';
import { useSelector, useDispatch } from 'react-redux';
import {
  setGallerySelectionMode,
  setSelectedItems,
  clearSelectedItems,
  toggleSelectItem,
  selectAll,
  deselectAll,
} from '../../../redux/slice/gallerySlice';
import CustomDialog from '../../../components/CustomDialog/CustomDialog';

const { width, height } = Dimensions.get('window');
const numColumns = 3;
const containerPadding = 8;
const itemSpacing = 4;
const totalSpacing = containerPadding * 2 + itemSpacing * (numColumns - 1);
const itemSize = (width - totalSpacing) / numColumns;

// Helper to chunk array into rows of 3
const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const GalleryItem = ({ item, onPress, onLongPress, isSelected, styles }) => {
  console.log('item', item);
  const [error, setError] = React.useState(false);
  if (!item || !item._id) {
    // Placeholder for grid alignment
    return <View style={[styles.item, { opacity: 0 }]} />;
  }
  if (item.type === 'image') {
    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => onPress?.(item)}
        onLongPress={() => onLongPress?.(item)}
        activeOpacity={0.85}>
        {error ? (
          <ImagePlaceholder style={styles.image} />
        ) : (
          <CustomImage
            source={{ uri: item?.mediaUrl }}
            style={styles.image}
            onError={() => setError(true)}
          />
        )}
        {item?.isSensitive && (
          <View style={styles.protectedBadge}>
            <MaterialIcon name="shield-outline" size={10} color="#fff" />
          </View>
        )}
        {isSelected && (
          <View style={styles.selectionBadge}>
            <MaterialIcon name="check-circle" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  }
  // video
  return (
    <TouchableOpacity
      style={[styles.item, isSelected && styles.selectedItem]}
      onPress={() => onPress?.(item)}
      onLongPress={() => onLongPress?.(item)}
      activeOpacity={0.85}>
      <View style={styles.videoThumb}>
        {error ? (
          <ImagePlaceholder style={styles.image} />
        ) : (
          <CustomImage
            source={{ uri: item?.thumb }}
            style={styles.image}
            onError={() => setError(true)}
          />
        )}
        <View style={styles.playIconWrap}>
          <Icon name="play-circle" size={32} color="#fff" />
        </View>
        {item?.isSensitive && (
          <View style={styles.protectedBadge}>
            <MaterialIcon name="shield-outline" size={10} color="#fff" />
          </View>
        )}
        {isSelected && (
          <View style={styles.selectionBadge}>
            <MaterialIcon name="check-circle" size={20} color="#fff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};


const GallerySection = ({ id }) => {
  const [params, setParams] = useState({
    page: 1,
    per_page: 20,
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const dispatch = useDispatch();
  const isSelectionMode = useSelector(state => state.gallery.isSelectionMode);
  const selectedItems = useSelector(state => state.gallery.selectedItems);
  const dummyMedia = [
    {
      _id: 'dummy1',
      type: 'image',
      mediaUrl: 'https://placekitten.com/400/400',
      isSensitive: false,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'dummy2',
      type: 'image',
      mediaUrl: 'https://placekitten.com/401/401',
      isSensitive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'dummy3',
      type: 'video',
      thumb: 'https://placekitten.com/402/402',
      isSensitive: false,
      createdAt: new Date().toISOString(),
    },
  ];
  const {
    data: mediaList = [],
    isLoading: isLoadingMedia,
    refetch: refetchMedia,
    isRefetching: isRefetchingSuggested,
  } = useQuery({
    queryKey: ['user-media', id],
    queryFn: () => getUserMedia({ id, params }),
    select: data => {
      const arr = data?.response?.data || [];
      if (Array.isArray(arr) && arr.length === 0) return dummyMedia;
      return arr;
    },
    enabled: !!id,
  });
  // Group media by date
  const groupMediaByDate = (mediaList) => {
    const groups = [];
    let lastDate = null;
    let currentGroup = null;
    mediaList.forEach(item => {
      if (!item) return; // Skip null/undefined items
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
  // Prepare images for viewer
  const prepareImagesForViewer = (mediaList) => {
    return mediaList
      .filter(item => item && item.type === 'image' && item.mediaUrl && item._id)
      .map(item => ({
        _id: item._id,
        uri: item.mediaUrl,
        isSensitive: item.isSensitive || false,
      }));
  };
  const handleMediaPress = (item, groupIndex, itemIndex) => {
    if (!item || !item._id) {
      console.log('Invalid item pressed:', item);
      return;
    }
    if (isSelectionMode) {
      dispatch(toggleSelectItem(item));
    } else if (item.type === 'image' && item.mediaUrl) {
      try {
        let globalIndex = 0;
        for (let i = 0; i < groupedMedia.length; i++) {
          if (i < groupIndex) {
            globalIndex += groupedMedia[i].items.filter(img => img && img.type === 'image' && img.mediaUrl && img._id).length;
          } else if (i === groupIndex) {
            globalIndex += groupedMedia[i].items.filter((img, idx) => img && img.type === 'image' && img.mediaUrl && img._id && idx < itemIndex).length;
            break;
          }
        }
        setSelectedImageIndex(globalIndex);
        setIsImageViewerVisible(true);
      } catch (error) {
        console.log('Error opening image viewer:', error);
      }
    } else if (item.type === 'video') {
      console.log('Video pressed:', item);
    }
  };
  const handleLongPress = (item) => {
    if (!item || !item._id) {
      console.log('Invalid item long pressed:', item);
      return;
    }
    if (!isSelectionMode) {
      dispatch(setGallerySelectionMode(true));
      dispatch(setSelectedItems([item]));
    }
  };
  const handleSelectAll = () => {
    dispatch(selectAll(mediaList));
  };
  const handleDeselectAll = () => {
    dispatch(deselectAll());
  };
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSensitiveDialog, setShowSensitiveDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'delete' or 'sensitive'

  const handleDelete = (items) => {
    setPendingAction({ type: 'delete', items: items || selectedItems });
    setShowDeleteDialog(true);
  };
  const handleMarkSensitive = (items) => {
    setPendingAction({ type: 'sensitive', items: items || selectedItems });
    setShowSensitiveDialog(true);
  };
  const confirmDelete = () => {
    if (pendingAction?.items) {
      console.log('Deleting items:', pendingAction.items.map(item => item._id));
      dispatch(deselectAll());
    }
    setShowDeleteDialog(false);
    setPendingAction(null);
  };
  const confirmSensitive = () => {
    if (pendingAction?.items) {
      console.log('Marking items as sensitive:', pendingAction.items.map(item => item._id));
      dispatch(deselectAll());
    }
    setShowSensitiveDialog(false);
    setPendingAction(null);
  };
  const handleCancelSelection = () => {
    dispatch(deselectAll());
  };
  const isItemSelected = (item) => {
    if (!item || !item._id) return false;
    return selectedItems.some(selected => selected._id === item._id);
  };
  const allImages = prepareImagesForViewer(mediaList);
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
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        {groupedMedia.map((group, groupIndex) => {
          const rows = chunkArray(group.items, numColumns);
          return (
            <View key={`group-${group.date}-${groupIndex}`} style={styles.dateSection}>
              <View style={styles.dateLabelContainer}>
                <Text style={styles.dateLabelText}>{group.date}</Text>
              </View>
              {rows.map((row, rowIndex) => {
                const filledRow = [...row];
                while (filledRow.length < numColumns) filledRow.push(null);
                return (
                  <View key={`row-${rowIndex}`} style={styles.imagesGrid}>
                    {filledRow.map((item, itemIndex) => (
                      <GalleryItem
                        key={item ? `item-${item?._id || itemIndex}-${itemIndex}` : `placeholder-${itemIndex}`}
                        item={item}
                        onPress={(item) => handleMediaPress(item, groupIndex, rowIndex * numColumns + itemIndex)}
                        onLongPress={handleLongPress}
                        isSelected={isItemSelected(item)}
                        styles={styles}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          );
        })}
        {/* Image Viewer */}
        <ImageViewer
          visible={isImageViewerVisible}
          images={allImages}
          initialIndex={selectedImageIndex}
          onClose={() => setIsImageViewerVisible(false)}
          onDelete={handleDelete}
          onMarkSensitive={handleMarkSensitive}
        />
      </ScrollView>
      {isSelectionMode && <GallerySelectionBar />}
      <CustomDialog
        visible={showDeleteDialog}
        onDismiss={() => setShowDeleteDialog(false)}
        title="Delete Items"
        message={`Are you sure you want to delete ${pendingAction?.items?.length || 0} item(s)?`}
        icon="delete-outline"
        iconColor="#ff4444"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmButtonColor="#ff4444"
        destructive={true}
      />
      <CustomDialog
        visible={showSensitiveDialog}
        onDismiss={() => setShowSensitiveDialog(false)}
        title="Mark as Sensitive"
        message={`Are you sure you want to mark ${pendingAction?.items?.length || 0} item(s) as sensitive?`}
        icon="shield-outline"
        iconColor="#D28A8C"
        confirmText="Mark Sensitive"
        cancelText="Cancel"
        onConfirm={confirmSensitive}
        onCancel={() => setShowSensitiveDialog(false)}
        confirmButtonColor="#D28A8C"
        showCancel={true}
      />
    </View>
  );
};

export default GallerySection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  item: {
    width: itemSize,
    height: itemSize,
    marginBottom: itemSpacing,
    overflow: 'hidden',
    backgroundColor: '#232323',
    borderRadius: 0,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedItem: {
    borderColor: '#D28A8C',
    borderWidth: 2,
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
    position: 'relative',
  },
  playIconWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 32,
    height: 32,
    marginTop: -16,
    marginLeft: -16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  protectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#D28A8C',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#D28A8C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
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
  dateSection: {
    marginBottom: 16,
  },
  dateLabelContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingHorizontal: containerPadding,
    justifyContent: 'space-between',
  },
  // Selection Bottom Bar styles
  selectionBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectionCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectAllText: {
    color: '#D28A8C',
    fontSize: 14,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(210,138,140,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#D28A8C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: 'rgba(255,68,68,0.1)',
  },
  deleteButtonText: {
    color: '#ff4444',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

});
