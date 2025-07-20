
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
import { deleteMessages } from '../../../apis/deleteMessages';
import { showSnackbar } from '../../../redux/slice/snackbarSlice';
import PrimaryLoader from '../../../components/Loaders/PrimaryLoader';
import CustomImage from '../../../components/Image/CustomImage';
import ImagePlaceholder from '../../../components/Placeholder/ImagePlaceholder';
import UserAvatar from '../../../components/CustomAvatar/UserAvatar';
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

const GalleryItem = ({ item, onPress, onLongPress, isSelected, styles, isSelectionMode, currentUserId }) => {
  const [error, setError] = React.useState(false);

  if (!item || !item._id) {
    return <View style={[styles.item, { opacity: 0 }]} />;
  }

  const showAvatar = item.sender && item.sender._id && item.sender._id !== currentUserId;
  const isOwnedByUser = item?.sender?._id === currentUserId;
  const isDisabled = isSelectionMode && !isOwnedByUser;

  if (item.type === 'image') {
    return (
      <TouchableOpacity
        style={[
          styles.item,
          isSelected && styles.selectedItem,
          isDisabled && styles.disabledItem
        ]}
        onPress={() => onPress?.(item)}
        onLongPress={() => onLongPress?.(item)}
        delayLongPress={500}
        activeOpacity={isDisabled ? 1 : 0.85}
        disabled={isDisabled}>
        {error ? (
          <ImagePlaceholder style={styles.image} />
        ) : (
          <CustomImage
            source={{ uri: item?.mediaUrl }}
            style={[styles.image, isDisabled && styles.disabledImage]}
            onError={() => setError(true)}
            isSensitive={item?.isSensitive}
            sender={item?.sender}
            currentUserId={currentUserId}
            timestamp={item?.createdAt}
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
        {isDisabled && (
          <View style={styles.disabledOverlay}>
            <MaterialIcon name="lock-outline" size={16} color="#666" />
          </View>
        )}
        {showAvatar && (
          <View style={styles.avatarContainer}>
            <UserAvatar
              profilePicture={item.sender?.profilePicture}
              name={item.sender?.name || 'Unknown'}
              id={item.sender?._id || 'unknown'}
              size={20}
              showPreview={false}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  }
  // video
  return (
    <TouchableOpacity
      style={[
        styles.item,
        isSelected && styles.selectedItem,
        isDisabled && styles.disabledItem
      ]}
      onPress={() => onPress?.(item)}
      onLongPress={() => onLongPress?.(item)}
      delayLongPress={500}
      activeOpacity={isDisabled ? 1 : 0.85}
      disabled={isDisabled}>
      <View style={styles.videoThumb}>
        {error ? (
          <ImagePlaceholder style={styles.image} />
        ) : (
          <CustomImage
            source={{ uri: item?.thumb }}
            style={[styles.image, isDisabled && styles.disabledImage]}
            onError={() => setError(true)}
            isSensitive={item?.isSensitive}
            sender={item?.sender}
            currentUserId={currentUserId}
            timestamp={item?.createdAt}
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
        {isDisabled && (
          <View style={styles.disabledOverlay}>
            <MaterialIcon name="lock-outline" size={16} color="#666" />
          </View>
        )}
        {showAvatar && (
          <View style={styles.avatarContainer}>
            <UserAvatar
              profilePicture={item.sender?.profilePicture}
              name={item.sender?.name || 'Unknown'}
              id={item.sender?._id || 'unknown'}
              size={20}
              showPreview={false}
            />
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

  // Get current user ID from Redux
  const currentUserId = useSelector(state => state.auth.user?.id);

  // Helper function to get user-friendly message for non-owned items
  const getNonOwnedItemMessage = (item) => {
    const senderName = item?.sender?.name || 'Unknown user';
    return `You can only select your own images. This image was shared by ${senderName}.`;
  };

  // Helper function to check if item is owned by current user
  const isItemOwnedByUser = (item) => {
    return item?.sender?._id === currentUserId;
  };

  useChatSocket({
    onMessageReceived: message => {
      console.log('message >>>>>>>.', message);
      if (message?.type === 'image') {
        queryClient.invalidateQueries({ queryKey: ['gallery', id] });
      }
    },
  });

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
    select: (response) => {
      // Handle the new response structure
      if (response?.response?.data && Array.isArray(response.response.data)) {
        return response.response.data;
      }
      return [];
    },
  });

  // Use useChatSocket for message_deleted event
  useChatSocket({
    onMessageDeleted: data => {
      if (data?.data && Array.isArray(data.data)) {
        const newDeletedIds = data.data; 
        setDeletedMessageIds(prev => [...prev, ...newDeletedIds]);
        queryClient.invalidateQueries({ queryKey: ['gallery', id] });
      }
    },
  });

  // Filter out deleted messages from galleryData
  const filteredMediaList = galleryData.filter(item => !deletedMessageIds.includes(item._id));

  // Update media items with proper cache invalidation
  const updateMediaItemsInCache = useCallback((updatedIds, isSensitive) => {
    queryClient.setQueryData(['gallery', id], (oldData) => {

      // Handle different data structures
      if (!oldData) {
        return oldData;
      }

      // Handle array data (this is what we expect now)
      if (Array.isArray(oldData)) {
        const updatedData = oldData.map(item => {
          if (updatedIds.includes(item._id)) {
            return { ...item, isSensitive };
          }
          return item;
        });
        return updatedData;
      }

      // Handle response object structure (fallback)
      if (oldData.response && oldData.response.data && Array.isArray(oldData.response.data)) {
        const updatedData = {
          ...oldData,
          response: {
            ...oldData.response,
            data: oldData.response.data.map(item => {
              if (updatedIds.includes(item._id)) {
                return { ...item, isSensitive };
              }
              return item;
            })
          }
        };
        return updatedData;
      }

      return oldData;
    });

    // Invalidate and refetch to ensure server sync
    queryClient.invalidateQueries({ queryKey: ['gallery', id] });
  }, [queryClient, id]);

  // Remove items from cache
  const removeItemsFromCache = useCallback((itemIds) => {
    queryClient.setQueryData(['gallery', id], (oldData) => {

      // Handle different data structures
      if (!oldData) {
        return oldData;
      }

      // Handle array data (this is what we expect now)
      if (Array.isArray(oldData)) {
        const filteredData = oldData.filter(item => !itemIds.includes(item._id));
        return filteredData;
      }

      // Handle response object structure (fallback)
      if (oldData.response && oldData.response.data && Array.isArray(oldData.response.data)) {
        const filteredData = {
          ...oldData,
          response: {
            ...oldData.response,
            data: oldData.response.data.filter(item => !itemIds.includes(item._id))
          }
        };
        return filteredData;
      }

      return oldData;
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
      .map(item => {
        return {
          _id: item._id,
          uri: item.mediaUrl,
          isSensitive: item.isSensitive || false,
          sender: item.sender,
          messageContent: item.content,
          timestamp: item.createdAt, // Include timestamp
        };
      });
  };

  const handleMediaPress = (item, groupIndex, itemIndex) => {
    if (!item || !item._id) {
      return;
    }

    // If in selection mode, check ownership before allowing selection
    if (isSelectionMode) {
      // Check if user owns this item before allowing selection
      if (!isItemOwnedByUser(item)) {
        dispatch(showSnackbar({
          type: 'warning',
          title: 'Cannot Select',
          subtitle: getNonOwnedItemMessage(item),
          placement: 'top',
        }));
        return;
      }

      // Toggle selection only for owned items
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
      return;
    }

    // Check if user owns this item before allowing selection mode
    if (!isItemOwnedByUser(item)) {
      dispatch(showSnackbar({
        type: 'warning',
        title: 'Cannot Select',
        subtitle: getNonOwnedItemMessage(item),
        placement: 'top',
      }));
      return;
    }

    // Add haptic feedback
    Vibration.vibrate(100);

    // Enter selection mode only for owned items
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedItems([item]);
    } else {
      // If already in selection mode, just toggle the item
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
    // Select only items owned by current user
    const userOwnedItems = filteredMediaList.filter(item => isItemOwnedByUser(item));

    if (userOwnedItems.length === 0) {
      dispatch(showSnackbar({
        type: 'info',
        title: 'No Images to Select',
        subtitle: 'You don\'t have any images in this section to select.',
        placement: 'top',
      }));
      return;
    }

    setSelectedItems(userOwnedItems);

    // Show feedback about how many items were selected
    const totalItems = filteredMediaList.length;
    const selectedCount = userOwnedItems.length;

    if (selectedCount < totalItems) {
      dispatch(showSnackbar({
        type: 'info',
        title: 'Partial Selection',
        subtitle: `Selected ${selectedCount} of your ${totalItems} total images`,
        placement: 'top',
      }));
    }
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
    setIsSelectionMode(false);
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async (items) => {
    // Handle both single item (from ImageViewer) and multiple items (from selection)
    const itemsArray = Array.isArray(items) ? items : [items];

    if (!itemsArray || itemsArray.length === 0) {
      dispatch(showSnackbar({
        type: 'error',
        title: 'Error',
        subtitle: 'No items selected',
        placement: 'top',
      }));
      return;
    }

    // If it's a single item from ImageViewer, delete immediately
    if (itemsArray.length === 1 && !isSelectionMode) {
      const itemIds = itemsArray.map(item => item._id);

      try {
        // Make the actual API call
        const response = await deleteMessages({ ids: itemIds });

        if (response?.response?.success) {
          // Immediately close the image viewer since the image was deleted
          setIsImageViewerVisible(false);
          setSelectedImageIndex(0);

          // Update cache to remove the item
          try {
            removeItemsFromCache(itemIds);
          } catch (cacheError) {
            console.warn('Cache update failed, falling back to refetch:', cacheError);
            // Fallback: refetch the data
            queryClient.invalidateQueries({ queryKey: ['gallery', id] });
          }

          // Also add to deletedMessageIds for immediate UI feedback
          setDeletedMessageIds(prev => [...prev, ...itemIds]);

          dispatch(showSnackbar({
            type: 'success',
            title: 'Deleted',
            subtitle: 'Image deleted successfully',
            placement: 'top',
          }));
        } else {
          console.error('Failed to delete image:', response);
          const errorMessage = response?.response?.data?.message || 'Failed to delete image';
          dispatch(showSnackbar({
            type: 'error',
            title: 'Error',
            subtitle: errorMessage,
            placement: 'top',
          }));
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        dispatch(showSnackbar({
          type: 'error',
          title: 'Server Error',
          subtitle: 'Failed to delete image',
          placement: 'top',
        }));
      }
      return;
    }

    // For multiple items, check if all are sensitive
    const allSensitive = itemsArray.every(item => item.isSensitive);

    // If all items are sensitive, delete directly without showing dialog
    if (allSensitive) {
      const itemIds = itemsArray.map(item => item._id);

      try {
        // Make the actual API call
        const response = await deleteMessages({ ids: itemIds });

        if (response?.response?.success) {
          // Update cache to remove the items
          try {
            removeItemsFromCache(itemIds);
          } catch (cacheError) {
            console.warn('Cache update failed, falling back to refetch:', cacheError);
            // Fallback: refetch the data
            queryClient.invalidateQueries({ queryKey: ['gallery', id] });
          }

          // Also add to deletedMessageIds for immediate UI feedback
          setDeletedMessageIds(prev => [...prev, ...itemIds]);

          // Clear selection and exit selection mode
          setSelectedItems([]);
          setIsSelectionMode(false);

          dispatch(showSnackbar({
            type: 'success',
            title: 'Deleted',
            subtitle: `${itemIds.length} images deleted successfully`,
            placement: 'top',
          }));
        } else {
          console.error('Failed to delete images:', response);
          const errorMessage = response?.response?.data?.message || 'Failed to delete images';
          dispatch(showSnackbar({
            type: 'error',
            title: 'Error',
            subtitle: errorMessage,
            placement: 'top',
          }));
        }
      } catch (error) {
        console.error('Error deleting images:', error);
        dispatch(showSnackbar({
          type: 'error',
          title: 'Server Error',
          subtitle: 'Failed to delete images',
          placement: 'top',
        }));
      }
      return;
    }

    // For multiple items that are not all sensitive, show confirmation dialog
    setPendingAction({ type: 'delete', items: itemsArray });
    setShowDeleteDialog(true);
  };

  const handleMarkSensitive = async (items) => {
    // Handle both single item (from ImageViewer) and multiple items (from selection)
    const itemsArray = Array.isArray(items) ? items : [items];

    if (!itemsArray || itemsArray.length === 0) {
      dispatch(showSnackbar({
        type: 'error',
        title: 'Error',
        subtitle: 'No items selected',
        placement: 'top',
      }));
      return;
    }

    try {
      const ids = itemsArray.map(item => item._id);

      const response = await markAsSensitive({ ids });

      if (response?.response?.success) {
        dispatch(showSnackbar({
          type: 'success',
          title: 'Marked as Sensitive',
          subtitle: `${response.response.data.length} item(s) marked as sensitive`,
          placement: 'top',
        }));

        // Update cache with sensitive status
        const updatedIds = response.response.data;
        try {
          updateMediaItemsInCache(updatedIds, true);
        } catch (cacheError) {
          console.warn('Cache update failed, falling back to refetch:', cacheError);
          // Fallback: refetch the data
          queryClient.invalidateQueries({ queryKey: ['gallery', id] });
        }

        // Clear selection if from selection bar (multiple items)
        if (itemsArray.length > 1) {
          setSelectedItems([]);
          setIsSelectionMode(false);
        }
        // Don't close ImageViewer for single item - let it stay open to show the updated state
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
    // Handle both single item (from ImageViewer) and multiple items (from selection)
    const itemsArray = Array.isArray(items) ? items : [items];

    if (!itemsArray || itemsArray.length === 0) {
      dispatch(showSnackbar({
        type: 'error',
        title: 'Error',
        subtitle: 'No items selected',
        placement: 'top',
      }));
      return;
    }

    try {
      const ids = itemsArray.map(item => item._id);

      const response = await markAsUnsensitive({ ids });

      if (response?.response?.success) {
        dispatch(showSnackbar({
          type: 'success',
          title: 'Marked as Insensitive',
          subtitle: `${response.response.data.length} item(s) marked as insensitive`,
          placement: 'top',
        }));

        // Update cache with insensitive status
        const updatedIds = response.response.data;
        try {
          updateMediaItemsInCache(updatedIds, false);
        } catch (cacheError) {
          console.warn('Cache update failed, falling back to refetch:', cacheError);
          // Fallback: refetch the data
          queryClient.invalidateQueries({ queryKey: ['gallery', id] });
        }

        // Clear selection if from selection bar (multiple items)
        if (itemsArray.length > 1) {
          setSelectedItems([]);
          setIsSelectionMode(false);
        }
        // Don't close ImageViewer for single item - let it stay open to show the updated state
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

        // Make the actual API call
        const response = await deleteMessages({ ids: itemIds });

        if (response?.response?.success) {
          // Update cache to remove the items
          try {
            removeItemsFromCache(itemIds);
          } catch (cacheError) {
            console.warn('Cache update failed, falling back to refetch:', cacheError);
            // Fallback: refetch the data
            queryClient.invalidateQueries({ queryKey: ['gallery', id] });
          }

          // Also add to deletedMessageIds for immediate UI feedback
          setDeletedMessageIds(prev => [...prev, ...itemIds]);

          // Clear selection
          setSelectedItems([]);
          setIsSelectionMode(false);

          // Show success toast
          dispatch(showSnackbar({
            type: 'success',
            title: 'Deleted',
            subtitle: `${pendingAction.items.length} item(s) deleted successfully`,
            placement: 'top',
          }));
        } else {
          console.error('Failed to delete items:', response);
          const errorMessage = response?.response?.data?.message || 'Failed to delete items';
          dispatch(showSnackbar({
            type: 'error',
            title: 'Error',
            subtitle: errorMessage,
            placement: 'top',
          }));
        }
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

  console.log(filteredMediaList)

  const allImages = prepareImagesForViewer(filteredMediaList);

  // Debug logging for selection state
  useEffect(() => {
    console.log('GallerySection - Selection state changed:', {
      isSelectionMode,
      selectedItemsCount: selectedItems.length,
      contactId: id
    });
  }, [isSelectionMode, selectedItems.length, id]);

  if (galleryLoading || !id) {
    return (
      <View style={styles.loadingContainer}>
        <PrimaryLoader />
      </View>
    );
  }

  if (!galleryLoading && galleryData.length === 0) {
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
                        currentUserId={currentUserId}
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
          currentUserId={currentUserId}
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
  avatarContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledItem: {
    opacity: 0.5,
    backgroundColor: '#333',
    borderColor: '#444',
    borderWidth: 1,
  },
  disabledImage: {
    opacity: 0.5,
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },

});
