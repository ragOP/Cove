
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  RefreshControl,
  ScrollView,
  Alert,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserMedia } from '../../../apis/getUserMedia';
import { markAsSensitive } from '../../../apis/markAsSensitive';
import { markAsUnsensitive } from '../../../apis/markAsUnsensitive';
import { showSnackbar } from '../../../redux/slice/snackbarSlice';
import PrimaryLoader from '../../../components/Loaders/PrimaryLoader';
import CustomImage from '../../../components/Image/CustomImage';
import ImagePlaceholder from '../../../components/Placeholder/ImagePlaceholder';
import { format } from 'date-fns';
import { formatDateLabel } from '../../../utils/date/formatDateLabel';
import ImageViewer from '../../../components/ImageViewer/ImageViewer';
import SelectionBottomBar from '../../../components/SelectionBottomBar/SelectionBottomBar';
import GallerySelectionBar from '../../../components/GallerySelectionBar/GallerySelectionBar';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from '../../../components/CustomDialog/CustomDialog';
import useChatSocket from '../../../hooks/useChatSocket';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

const GalleryItem = ({ item, onPress, onLongPress, isSelected, styles, isSelectionMode }) => {
  const [error, setError] = React.useState(false);
  if (!item || !item._id) {
    return <View style={[styles.item, { opacity: 0 }]} />;
  }
  if (item.type === 'image') {
    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => onPress?.(item)}
        onLongPress={() => onLongPress?.(item)}
        delayLongPress={500}
        activeOpacity={0.85}>
        {error ? (
          <ImagePlaceholder style={styles.image} />
        ) : (
          <CustomImage
            source={{ uri: item?.mediaUrl }}
            style={styles.image}
            onError={() => setError(true)}
            isSensitive={item?.isSensitive}
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
      delayLongPress={500}
      activeOpacity={0.85}>
      <View style={styles.videoThumb}>
        {error ? (
          <ImagePlaceholder style={styles.image} />
        ) : (
          <CustomImage
            source={{ uri: item?.thumb }}
            style={styles.image}
            onError={() => setError(true)}
            isSensitive={item?.isSensitive}
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deletedMessageIds, setDeletedMessageIds] = useState([]);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Reset states when contact changes
  useEffect(() => {
    setShowDeleteDialog(false);
    setPendingAction(null);
    setIsProcessing(false);
    setIsImageViewerVisible(false);
    setSelectedImageIndex(0);
    setIsSelectionMode(false);
    setSelectedItems([]);
    setDeletedMessageIds([]);
  }, [id]);

  // Cleanup states when component unmounts
  useEffect(() => {
    return () => {
      setShowDeleteDialog(false);
      setPendingAction(null);
      setIsProcessing(false);
    };
  }, []);

  // Use TanStack Query for gallery data
  const {
    data: galleryData = [],
    isLoading: galleryLoading,
    error: galleryError,
    refetch: refetchGallery,
  } = useQuery({
    queryKey: ['gallery', id],
    queryFn: () => getUserMedia({ id }),
    enabled: !!id,
    select: (response) => response?.response?.data || [],
  });

  // Use useChatSocket for message_deleted event
  useChatSocket({
    onMessageDeleted: data => {
      console.info('[GALLERY SECTION - MESSAGE DELETED]', data);
      if (data?.data && Array.isArray(data.data)) {
        const newDeletedIds = data.data.map(item => item._id);
        setDeletedMessageIds(prev => [...prev, ...newDeletedIds]);

        // Invalidate and refetch gallery data
        queryClient.invalidateQueries({ queryKey: ['gallery', id] });
      }
    },
  });

  // Filter out deleted messages from galleryData
  const filteredMediaList = galleryData.filter(item => !deletedMessageIds.includes(item._id));

  // Update media items with proper cache invalidation
  const updateMediaItemsInCache = useCallback((updatedIds, isSensitive) => {
    // Update the cache directly for immediate UI feedback
    queryClient.setQueryData(['gallery', id], (oldData) => {
      if (!oldData) return oldData;

      return oldData.map(item => {
        if (updatedIds.includes(item._id)) {
          return { ...item, isSensitive };
        }
        return item;
      });
    });

    // Invalidate and refetch to ensure server sync
    queryClient.invalidateQueries({ queryKey: ['gallery', id] });
  }, [queryClient, id]);

  // Remove items from cache
  const removeItemsFromCache = useCallback((itemIds) => {
    queryClient.setQueryData(['gallery', id], (oldData) => {
      if (!oldData) return oldData;

      return oldData.filter(item => !itemIds.includes(item._id));
    });

    // Invalidate and refetch to ensure server sync
    queryClient.invalidateQueries({ queryKey: ['gallery', id] });
  }, [queryClient, id]);

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

  const groupedMedia = groupMediaByDate(filteredMediaList);

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

    // If in selection mode, always toggle selection regardless of item type
    if (isSelectionMode) {
      const exists = selectedItems.some(selected => selected._id === item._id);
      if (exists) {
        setSelectedItems(prev => prev.filter(selected => selected._id !== item._id));
        if (selectedItems.length === 1) {
          setIsSelectionMode(false);
        }
      } else {
        setSelectedItems(prev => [...prev, item]);
      }
      return;
    }

    // If not in selection mode, handle normal press
    if (item.type === 'image' && item.mediaUrl) {
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

    // Add haptic feedback
    Vibration.vibrate(100);

    console.log('Long press detected for item:', item._id, 'Current selection mode:', isSelectionMode);

    // Always enter selection mode on long press, regardless of current state
    if (!isSelectionMode) {
      console.log('Entering selection mode and selecting item:', item._id);
      setIsSelectionMode(true);
      setSelectedItems([item]);
    } else {
      // If already in selection mode, just toggle the item
      console.log('Already in selection mode, toggling item:', item._id);
      const exists = selectedItems.some(selected => selected._id === item._id);
      if (exists) {
        setSelectedItems(prev => prev.filter(selected => selected._id !== item._id));
        if (selectedItems.length === 1) {
          setIsSelectionMode(false);
        }
      } else {
        setSelectedItems(prev => [...prev, item]);
      }
    }
  };

  const handleSelectAll = () => {
    setSelectedItems(filteredMediaList);
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
    setIsSelectionMode(false);
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async (items) => {
    if (!items || items.length === 0) {
      dispatch(showSnackbar({
        type: 'error',
        title: 'Error',
        subtitle: 'No items selected',
        placement: 'top',
      }));
      return;
    }

    // For now, we'll show a confirmation dialog
    // TODO: Implement actual delete API call when available
    setPendingAction({ type: 'delete', items: items });
    setShowDeleteDialog(true);
  };

  const handleMarkSensitive = async (items) => {
    if (!items || items.length === 0) {
      dispatch(showSnackbar({
        type: 'error',
        title: 'Error',
        subtitle: 'No items selected',
        placement: 'top',
      }));
      return;
    }

    try {
      const ids = items.map(item => item._id);
      console.log('Marking items as sensitive:', ids);

      const response = await markAsSensitive({ ids });

      if (response?.response?.success) {
        console.log('Successfully marked as sensitive:', response.response.data);
        dispatch(showSnackbar({
          type: 'success',
          title: 'Marked as Sensitive',
          subtitle: `${response.response.data.length} item(s) marked as sensitive`,
          placement: 'top',
        }));

        // Update cache with sensitive status
        const updatedIds = response.response.data;
        updateMediaItemsInCache(updatedIds, true);

        // Clear selection if from selection bar
        if (items.length > 1) {
          setSelectedItems([]);
          setIsSelectionMode(false);
        }
      } else {
        console.error('Error marking as sensitive:', response?.response?.message || 'Unknown error');
        dispatch(showSnackbar({
          type: 'error',
          title: 'Error',
          subtitle: response?.response?.message || 'Failed to mark as sensitive',
          placement: 'top',
        }));
      }
    } catch (error) {
      console.error('Error marking as sensitive:', error);
      dispatch(showSnackbar({
        type: 'error',
        title: 'Server Error',
        subtitle: 'Failed to mark as sensitive',
        placement: 'top',
      }));
    }
  };

  const handleMarkUnsensitive = async (items) => {
    if (!items || items.length === 0) {
      dispatch(showSnackbar({
        type: 'error',
        title: 'Error',
        subtitle: 'No items selected',
        placement: 'top',
      }));
      return;
    }

    try {
      const ids = items.map(item => item._id);
      console.log('Marking items as insensitive:', ids);

      const response = await markAsUnsensitive({ ids });

      if (response?.response?.success) {
        console.log('Successfully marked as insensitive:', response.response.data);
        dispatch(showSnackbar({
          type: 'success',
          title: 'Marked as Insensitive',
          subtitle: `${response.response.data.length} item(s) marked as insensitive`,
          placement: 'top',
        }));

        // Update cache with insensitive status
        const updatedIds = response.response.data;
        updateMediaItemsInCache(updatedIds, false);

        // Clear selection if from selection bar
        if (items.length > 1) {
          setSelectedItems([]);
          setIsSelectionMode(false);
        }
      } else {
        console.error('Error marking as insensitive:', response?.response?.message || 'Unknown error');
        dispatch(showSnackbar({
          type: 'error',
          title: 'Error',
          subtitle: response?.response?.message || 'Failed to mark as insensitive',
          placement: 'top',
        }));
      }
    } catch (error) {
      console.error('Error marking as insensitive:', error);
      dispatch(showSnackbar({
        type: 'error',
        title: 'Server Error',
        subtitle: 'Failed to mark as insensitive',
        placement: 'top',
      }));
    }
  };

  const confirmDelete = async () => {
    if (pendingAction?.items) {
      try {
        setIsProcessing(true);
        const itemIds = pendingAction.items.map(item => item._id);
        console.log('Deleting items:', itemIds);


        removeItemsFromCache(itemIds);

        // Clear selection
        setSelectedItems([]);
        setIsSelectionMode(false);

        // Show success toast
        dispatch(showSnackbar({
          type: 'success',
          title: 'Deleted',
          subtitle: `${pendingAction.items.length} item(s) deleted`,
          placement: 'top',
        }));
      } catch (error) {
        console.error('Error deleting items:', error);
        dispatch(showSnackbar({
          type: 'error',
          title: 'Server Error',
          subtitle: 'Failed to delete items',
          placement: 'top',
        }));
      } finally {
        setIsProcessing(false);
        setShowDeleteDialog(false);
        setPendingAction(null);
      }
    }
  };



  const handleCancelSelection = () => {
    setSelectedItems([]);
    setIsSelectionMode(false);
  };

  const isItemSelected = (item) => {
    if (!item || !item._id) return false;
    return selectedItems.some(selected => selected._id === item._id);
  };

  const allImages = prepareImagesForViewer(filteredMediaList);

  // Debug logging for selection state
  useEffect(() => {
    console.log('GallerySection - Selection state changed:', {
      isSelectionMode,
      selectedItemsCount: selectedItems.length,
      contactId: id
    });
  }, [isSelectionMode, selectedItems.length, id]);

  if (galleryLoading) {
    return (
      <View style={styles.loadingContainer}>
        <PrimaryLoader />
      </View>
    );
  }

  if (!filteredMediaList || filteredMediaList.length === 0) {
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
      {isSelectionMode && (
        <View style={styles.selectionOverlay}>
          <Text style={styles.selectionModeText}>
            Selection Mode - {selectedItems.length} item(s) selected
          </Text>
        </View>
      )}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: isSelectionMode ? 120 : 80
        }}>
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
                        isSelectionMode={isSelectionMode}
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
          key={`imageviewer-${id}`}
          visible={isImageViewerVisible}
          images={allImages}
          initialIndex={selectedImageIndex}
          onClose={() => {
            setIsImageViewerVisible(false);
            setSelectedImageIndex(0);
          }}
          onDelete={handleDelete}
          onMarkSensitive={handleMarkSensitive}
          onMarkUnsensitive={handleMarkUnsensitive}
          showSnackbarNotifications={false}
        />
      </ScrollView>
      {isSelectionMode && (
        <View style={styles.selectionBarContainer}>
          <GallerySelectionBar
            selectedItems={selectedItems}
            onMarkSensitive={handleMarkSensitive}
            onMarkUnsensitive={handleMarkUnsensitive}
            onDelete={handleDelete}
            onCancel={handleCancelSelection}
            useRedux={false}
          />
        </View>
      )}
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
  selectionBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(210, 138, 140, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 999,
    elevation: 9,
  },
  selectionModeText: {
    color: '#D28A8C',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

});
