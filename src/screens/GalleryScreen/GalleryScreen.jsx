import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Dimensions, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { markAsSensitive } from '../../apis/markAsSensitive';
import { markAsUnsensitive } from '../../apis/markAsUnsensitive';
import { deleteMessages } from '../../apis/deleteMessages';
import PrimaryLoader from '../../components/Loaders/PrimaryLoader';
import CustomImage from '../../components/Image/CustomImage';
import ImagePlaceholder from '../../components/Placeholder/ImagePlaceholder';
import { formatDateLabel } from '../../utils/date/formatDateLabel';
import { useSelector, useDispatch } from 'react-redux';
import {
  setGallerySelectionMode,
  setSelectedItems,
  clearSelectedItems,
  toggleSelectItem,
  selectAll,
  deselectAll,
  setGalleryPage
} from '../../redux/slice/gallerySlice';
import {
  setGalleryData,
  setGalleryLoading,
  setGalleryError,
  updateMultipleGalleryItems,
  removeGalleryItems,
  appendGalleryData
} from '../../redux/slice/gallerySlice';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import CustomDialog from '../../components/CustomDialog/CustomDialog';
import { dummyImages } from '../../utils/media/dummyImages';
import { getUserGallery } from '../../apis/getUserGallery';
import useGallerySocket from '../../hooks/useGallerySocket';
import { showSnackbar } from '../../redux/slice/snackbarSlice';
import { useQueryClient } from '@tanstack/react-query';
import UserAvatar from '../../components/CustomAvatar/UserAvatar';

const { width, height } = Dimensions.get('window');

// Fixed 3 columns with proper spacing
const numColumns = 3;
const containerPadding = 8;
const itemSpacing = 4;
const totalSpacing = containerPadding * 2 + itemSpacing * (numColumns - 1);
const itemSize = (width - totalSpacing) / numColumns;

const GalleryItem = ({ item, onPress, onLongPress, isSelected, styles, currentUserId, isSelectionMode }) => {
  const [error, setError] = React.useState(false);

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
        activeOpacity={isDisabled ? 1 : 0.85}
        disabled={isDisabled}>
        {error || !item.mediaUrl ? (
          <View style={styles.fallbackContainer}>
            <MaterialIcon name="image-broken" size={24} color="#666" />
            <Text style={styles.fallbackText}>No Image</Text>
          </View>
        ) : (
          <CustomImage
            source={{ uri: item.mediaUrl }}
            style={[styles.image, isDisabled && styles.disabledImage]}
            onError={() => setError(true)}
            isSensitive={item.isSensitive}
            sender={item.sender}
            currentUserId={currentUserId}
            timestamp={item.createdAt}
          />
        )}
        {item.isSensitive && (
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
      activeOpacity={isDisabled ? 1 : 0.85}
      disabled={isDisabled}>
      <View style={styles.videoThumb}>
        {error || !item.thumb ? (
          <View style={styles.fallbackContainer}>
            <MaterialIcon name="video-off" size={24} color="#666" />
            <Text style={styles.fallbackText}>No Video</Text>
          </View>
        ) : (
          <CustomImage
            source={{ uri: item.thumb }}
            style={[styles.image, isDisabled && styles.disabledImage]}
            onError={() => setError(true)}
            isSensitive={item.isSensitive}
            sender={item.sender}
            currentUserId={currentUserId}
            timestamp={item.createdAt}
          />
        )}
        <View style={styles.playIconWrap}>
          <Icon name="play-circle" size={24} color="#fff" />
        </View>
        {item.isSensitive && (
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

const GalleryScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const user = useSelector(state => state.auth.user);
  const currentUserId = user?.id;
  const [activeTab, setActiveTab] = useState('all');

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isRefreshed, setIsRefreshed] = useState(false);
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [markSensitiveDialog, setMarkSensitiveDialog] = useState(false);

  // Multi-select state from Redux
  const isSelectionMode = useSelector(state => state.gallery.isSelectionMode);
  const selectedItems = useSelector(state => state.gallery.selectedItems);

  // Group media by date function
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

  // Prepare images for viewer function
  const prepareImagesForViewer = (mediaList) => {
    return mediaList
      .filter(item => item.type === 'image' && item.mediaUrl)
      .map(item => {
        return {
          _id: item._id,
          uri: item.mediaUrl,
          isSensitive: item.isSensitive,
          sender: item.sender, // Include sender information
          messageContent: item.content, // Include message content
          timestamp: item.createdAt, // Include timestamp
        };
      });
  };
  // Get gallery data from Redux
  const galleryData = useSelector(state => state.gallery.galleryData);
  const isLoadingMedia = useSelector(state => state.gallery.isLoading);
  const mediaError = useSelector(state => state.gallery.error);
  const hasMore = useSelector(state => state.gallery.hasMore);
  const total = useSelector(state => state.gallery.total);
  const page = useSelector(state => state.gallery.page);
  const per_page = useSelector(state => state.gallery.per_page);

  const onHandleNewGalleryMessage = (data) => {
    if (data?.data && data?.data?._id) {
      const newMessage = data.data;

      if (newMessage.type === 'image' || newMessage.type === 'video') {

        dispatch(appendGalleryData({
          data: [newMessage],
          total: total + 1,
          page: page,
          per_page: per_page,
        }));
      }
    }
  }

  const onHandleGalleryMessageDeleted = (data) => {
    if (data?.data && Array.isArray(data.data)) {
      const deletedMessageIds = data.data;
      console.log('deletedMessageIds', deletedMessageIds);
      dispatch(removeGalleryItems(deletedMessageIds));
    }
  }

  useGallerySocket({
    onGalleryMessageDeleted: data => {
      onHandleGalleryMessageDeleted(data)
    },
    onNewGalleryMessage: data => {
      onHandleNewGalleryMessage(data);
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      setGalleryPage(1)
      setIsRefreshed(true);
    } catch (error) {
      console.error('Error refreshing gallery data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load gallery data when page changes
  useEffect(() => {
    const loadGalleryData = async (pageNum) => {

      dispatch(setGalleryLoading(true));

      try {
        const response = await getUserGallery({
          params: {
            page: pageNum,
            per_page: per_page
          }
        });

        if (response?.response?.data?.gallery) {
          const galleryArr = response.response.data.gallery;
          const currentTotal = response?.response?.data?.total || response?.response?.data?.totalCount || 0;

          if (pageNum === 1) {
            dispatch(setGalleryData({
              data: galleryArr,
              total: currentTotal,
            }));
          } else {
            dispatch(appendGalleryData({
              data: galleryArr,
              total: total,
            }));
          }

        } else {
          dispatch(setGalleryData({
            data: [],
            total: 0,
            page: 1,
            per_page: per_page
          }));
        }
      } catch (error) {
        console.error('Error loading gallery data:', error);
        dispatch(setGalleryError(error.message));
        dispatch(setGalleryData({
          data: [],
          total: 0,
          page: 1,
          per_page: per_page
        }));
      } finally {
        dispatch(setGalleryLoading(false));
        if (isRefreshed) {
          setIsRefreshed(false);
        }
      }
    }

    loadGalleryData(page);
  }, [page, isRefreshed]);

  const mediaList = useMemo(() => {
    return galleryData;
  }, [galleryData]);

  // Group media by date
  const groupedMedia = useMemo(() => {
    return groupMediaByDate(mediaList);
  }, [mediaList]);

  // Filter media based on active tab
  const filteredMedia = useMemo(() => {
    return activeTab === 'shield'
      ? mediaList.filter(item => item.isSensitive)
      : mediaList;
  }, [mediaList, activeTab]);

  // Group filtered media by date for the FlatList
  const groupedFilteredMedia = useMemo(() => {
    return groupMediaByDate(filteredMedia);
  }, [filteredMedia]);

  // Counts for each tab
  const allCount = mediaList.length;
  const shieldCount = mediaList.filter(item => item.isSensitive).length;

  // Helper function to check if item belongs to current user
  const isItemOwnedByUser = (item) => {
    return item?.sender?._id === currentUserId;
  };

  // Helper function to get user-friendly message for non-owned items
  const getNonOwnedItemMessage = (item) => {
    const senderName = item?.sender?.name || 'Unknown user';
    return `You can only select your own images. This image was shared by ${senderName}.`;
  };

  const handleMediaPress = (item, groupIndex, itemIndex) => {
    try {
      if (!item || !item._id) {
        return;
      }

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
        dispatch(toggleSelectItem(item));
      } else if (item.type === 'image' && item.mediaUrl) {
        try {
          // Find the global index of this image
          let globalIndex = 0;
          for (let i = 0; i < groupedMedia.length; i++) {
            if (i < groupIndex) {
              globalIndex += groupedMedia[i].items.filter(img => img.type === 'image' && img.mediaUrl).length;
            } else if (i === groupIndex) {
              globalIndex += groupedMedia[i].items.filter((img, idx) => img.type === 'image' && img.mediaUrl && idx < itemIndex).length;
              break;
            }
          }

          setSelectedImageIndex(globalIndex);
          setIsImageViewerVisible(true);
        } catch (error) {
          console.log('Error opening image viewer:', error);
        }
      } else if (item.type === 'video') {
        // Handle video - you can add video player logic here
      }
    } catch (error) {
      console.log('Error in handleMediaPress:', error);
    }
  };

  const handleLongPress = (item) => {
    try {
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

      if (!isSelectionMode) {
        dispatch(setGallerySelectionMode(true));
        dispatch(setSelectedItems([item]));
      }
    } catch (error) {
      console.log('Error in handleLongPress:', error);
    }
  };

  const handleSelectAll = () => {
    try {
      // Select only items owned by current user from the filtered media
      const userOwnedItems = filteredMedia.filter(item => isItemOwnedByUser(item));

      if (userOwnedItems.length === 0) {
        dispatch(showSnackbar({
          type: 'info',
          title: 'No Images to Select',
          subtitle: 'You don\'t have any images in this section to select.',
          placement: 'top',
        }));
        return;
      }

      dispatch(selectAll(userOwnedItems));

      // Show feedback about how many items were selected
      const totalItems = filteredMedia.length;
      const selectedCount = userOwnedItems.length;

      if (selectedCount < totalItems) {
        dispatch(showSnackbar({
          type: 'info',
          title: 'Partial Selection',
          subtitle: `Selected ${selectedCount} of your ${totalItems} total images`,
          placement: 'top',
        }));
      }
    } catch (error) {
      console.log('Error in handleSelectAll:', error);
      dispatch(deselectAll());
    }
  };

  const handleDeselectAll = () => {
    try {
      dispatch(deselectAll());
    } catch (error) {
      console.log('Error in handleDeselectAll:', error);
    }
  };

  const handleDelete = () => {
    // Check if all selected items are sensitive
    const allSensitive = selectedItems.every(item => item.isSensitive);

    // If all items are sensitive, delete directly without showing dialog
    if (allSensitive) {
      handleDeleteConfirm();
      return;
    }

    // Otherwise, show the confirmation dialog
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const ids = selectedItems.map(item => item._id);
      const response = await deleteMessages({ ids });

      if (response?.response?.success) {
        dispatch(removeGalleryItems(ids));
        dispatch(deselectAll());
        dispatch(setGallerySelectionMode(false));
        setDeleteDialog(false);
        dispatch(showSnackbar({ message: `Deleted ${ids.length} item(s)`, type: 'success' }));
      } else {
        const errorMessage = response?.response?.data?.message || 'Failed to delete items';
        dispatch(showSnackbar({ message: errorMessage, type: 'error' }));
        setDeleteDialog(false);
      }
    } catch (error) {
      console.error('Error deleting items:', error);
      dispatch(showSnackbar({ message: 'Failed to delete items', type: 'error' }));
      setDeleteDialog(false);
    }
  };

  const handleSingleImageDelete = async (deletedImage) => {
    try {
      if (!deletedImage?._id) {
        console.error('No image ID found for deleting');
        return;
      }

      const response = await deleteMessages({ ids: [deletedImage._id] });

      if (response?.response?.success) {
        console.log('Successfully deleted image:', deletedImage._id);

        // Remove the deleted image from gallery state
        dispatch(removeGalleryItems([deletedImage._id]));

        // Close the image viewer since the image was deleted
        setIsImageViewerVisible(false);

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
  };

  const handleMarkSensitive = () => {
    if (selectedItems.length === 0) {
      setMarkSensitiveDialog(true);
      return;
    }
    setMarkSensitiveDialog(true);
  };

  const handleMarkSensitiveConfirm = async () => {
    try {
      const ids = selectedItems.map(item => item._id);
      const response = await markAsSensitive({ ids });

      if (response?.response?.success) {
        // Update Redux state to reflect the changes immediately
        dispatch(updateMultipleGalleryItems({
          itemIds: ids,
          updates: { isSensitive: true }
        }));

        // Success - clear selection and exit selection mode
        dispatch(deselectAll());
        dispatch(setGallerySelectionMode(false));
        setMarkSensitiveDialog(false);
        dispatch(showSnackbar({ message: `Marked ${ids.length} item(s) as sensitive`, type: 'success' }));
      } else {
        const errorMessage = response?.response?.data?.message || 'Failed to mark items as sensitive';
        dispatch(showSnackbar({ message: errorMessage, type: 'error' }));
        setMarkSensitiveDialog(false);
      }
    } catch (error) {
      console.error('Error marking items as sensitive:', error);
      dispatch(showSnackbar({ message: 'Failed to mark items as sensitive', type: 'error' }));
      setMarkSensitiveDialog(false);
    }
  };

  const handleMarkSensitiveCancel = () => {
    setMarkSensitiveDialog(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
  };

  const handleImageViewerMarkSensitive = (image) => {
    dispatch(updateMultipleGalleryItems({
      itemIds: [image._id],
      updates: { isSensitive: true }
    }));
  };

  const handleImageViewerMarkUnsensitive = (image) => {
    // Update Redux state immediately for UI feedback
    dispatch(updateMultipleGalleryItems({
      itemIds: [image._id],
      updates: { isSensitive: false }
    }));
  };

  const handleCancelSelection = () => {
    try {
      dispatch(deselectAll());
      dispatch(setGallerySelectionMode(false));
    } catch (error) {
      console.log('Error in handleCancelSelection:', error);
    }
  };

  const isItemSelected = (item) => {
    try {
      if (!item || !item._id) {
        return false;
      }
      const isSelected = selectedItems.some(selected => selected._id === item._id);
      return isSelected;
    } catch (error) {
      console.log('Error in isItemSelected:', error);
      return false;
    }
  };

  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  // In renderMediaSection, instead of a single imagesGrid row, do:
  const renderMediaSection = ({ item: group, index: groupIndex }) => {
    const rows = chunkArray(group.items, numColumns);
    return (
      <View style={styles.dateSection}>
        <View style={styles.dateLabelContainer}>
          <Text style={styles.dateLabelText}>{group.date}</Text>
        </View>
        {rows.map((row, rowIndex) => {
          // Fill with placeholders if needed
          const filledRow = [...row];
          while (filledRow.length < numColumns) filledRow.push(null);
          return (
            <View key={`row-${rowIndex}`} style={styles.imagesGrid}>
              {filledRow.map((mediaItem, itemIndex) =>
                mediaItem ? (
                  <GalleryItem
                    key={`item-${mediaItem._id}-${itemIndex}`}
                    item={mediaItem}
                    onPress={(item) => handleMediaPress(item, groupIndex, rowIndex * numColumns + itemIndex)}
                    onLongPress={handleLongPress}
                    isSelected={isItemSelected(mediaItem)}
                    styles={styles}
                    currentUserId={currentUserId}
                    isSelectionMode={isSelectionMode}
                  />
                ) : (
                  <View key={`placeholder-${itemIndex}`} style={[styles.item, { opacity: 0 }]} />
                )
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcon
        name={activeTab === 'shield' ? 'shield-outline' : 'card-multiple-outline'}
        size={64}
        color="#D28A8C"
        style={styles.emptyIcon}
      />
      <View style={styles.spacer12} />
      <View style={styles.emptyTextWrap}>
        <Text style={styles.emptyTitle}>
          {activeTab === 'shield' ? 'No Protected Media' : 'No Media Yet'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {activeTab === 'shield'
            ? 'Protected images and videos will appear here.'
            : 'Your shared images and videos will appear here.'
          }
        </Text>
      </View>
    </View>
  );

  // Prepare all images for viewer
  const allImages = useMemo(() => prepareImagesForViewer(filteredMedia), [filteredMedia]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: isSelectionMode ? 18 : 22 }]}>
          {isSelectionMode
            ? `Selected ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}`
            : `Gallery${filteredMedia && filteredMedia.length ? ` (${filteredMedia.length})` : ''}`
          }
        </Text>
        {isSelectionMode ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={selectedItems.length > 0 ? handleDeselectAll : handleSelectAll}
              style={styles.headerActionButton}>
              <Text style={styles.headerActionText}>
                {selectedItems.length > 0 ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelSelection} style={styles.headerActionButton}>
              <Text style={styles.cancelSelectionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabToggleRow}>
        <TouchableOpacity
          style={[
            styles.tabToggleBtn,
            activeTab === 'all' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('all')}
          activeOpacity={0.85}>
          <MaterialIcon
            name="image-multiple"
            size={22}
            color={activeTab === 'all' ? '#D28A8C' : 'rgba(255,255,255,0.5)'}
            style={styles.tabIconMargin}
          />
          <Text
            style={[
              styles.tabToggleText,
              activeTab === 'all' && styles.tabActiveText,
            ]}>
            All{` (${allCount})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabToggleBtn,
            activeTab === 'shield' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('shield')}
          activeOpacity={0.85}>
          <MaterialIcon
            name="shield-outline"
            size={22}
            color={activeTab === 'shield' ? '#D28A8C' : 'rgba(255,255,255,0.5)'}
            style={styles.tabIconMargin}
          />
          <Text
            style={[
              styles.tabToggleText,
              activeTab === 'shield' && styles.tabActiveText,
            ]}>
            Shield{` (${shieldCount})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Media Content */}
      <View style={styles.mediaListContainer}>
        <FlatList
          data={groupedFilteredMedia}
          keyExtractor={(item, index) => `${item.date}-${index}`}
          renderItem={renderMediaSection}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#D28A8C"
              colors={["#D28A8C"]}
            />
          }
          onEndReached={() => {
            // Load more data if available
            if (hasMore && !isLoadingMedia) {
              setGalleryPage(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            isLoadingMedia ? (
              <View style={styles.loadingContainer}>
                <MaterialIcon name="image-multiple" size={64} color="#D28A8C" />
                <Text style={styles.loadingText}>Loading media...</Text>
              </View>
            ) : mediaError ? (
              <View style={styles.errorContainer}>
                <MaterialIcon name="alert-circle" size={48} color="#ff4444" />
                <Text style={styles.errorText}>Failed to load media</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => {
                  // Reload gallery data
                  dispatch(setGalleryLoading(true));
                }}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <MaterialIcon name="image-multiple" size={64} color="#666" />
                <Text style={styles.emptyTitle}>No Media Found</Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === 'shield'
                    ? 'No protected media found'
                    : 'Your media will appear here'}
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            isLoadingMedia && page > 1 ? (
              <View style={styles.loadingMoreContainer}>
                <PrimaryLoader size={32} color="#D28A8C" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      </View>

      {/* Image Viewer */}
      <ImageViewer
        visible={isImageViewerVisible}
        images={allImages}
        initialIndex={selectedImageIndex}
        onClose={() => {
          setIsImageViewerVisible(false);
        }}
        onDelete={handleSingleImageDelete}
        onMarkSensitive={handleImageViewerMarkSensitive}
        onMarkUnsensitive={handleImageViewerMarkUnsensitive}
        showSnackbarNotifications={false}
        currentUserId={currentUserId}
      />

      {/* Delete Dialog */}
      <CustomDialog
        visible={deleteDialog}
        onDismiss={() => setDeleteDialog(false)}
        title="Delete Items"
        message={`Are you sure you want to delete ${selectedItems.length} item(s)?`}
        icon="delete-outline"
        iconColor="#ff4444"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmButtonColor="#ff4444"
        destructive={true}
      />

      {/* Mark Sensitive Dialog */}
      <CustomDialog
        visible={markSensitiveDialog}
        onDismiss={() => setMarkSensitiveDialog(false)}
        title="Mark as Sensitive"
        message={selectedItems.length === 0
          ? "Please select items to mark as sensitive."
          : `Are you sure you want to mark ${selectedItems.length} item(s) as sensitive?`
        }
        icon="shield-outline"
        iconColor="#D28A8C"
        confirmText="Mark Sensitive"
        cancelText="Cancel"
        onConfirm={handleMarkSensitiveConfirm}
        onCancel={handleMarkSensitiveCancel}
        confirmButtonColor="#D28A8C"
        showCancel={selectedItems.length > 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  header: {
    backgroundColor: '#181818',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cancelSelectionText: {
    color: '#D28A8C',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(210,138,140,0.1)',
    marginLeft: 8,
  },
  headerActionText: {
    color: '#D28A8C',
    fontSize: 14,
    fontWeight: '600',
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#232323',
    marginBottom: 0,
  },
  tabToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabToggleText: {
    color: '#bbb',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#D28A8C',
  },
  tabActiveText: {
    color: '#D28A8C',
  },
  tabIconMargin: {
    marginRight: 6,
  },
  mediaList: {
    paddingBottom: 24,
  },
  mediaListContainer: {
    flex: 1,
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
    flexWrap: 'wrap',
    paddingHorizontal: containerPadding,
    justifyContent: 'space-between',
  },
  item: {
    width: itemSize,
    height: itemSize,
    marginBottom: itemSpacing,
    overflow: 'hidden',
    backgroundColor: '#232323',
    borderRadius: 0, // Removed border radius
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
    borderRadius: 0, // Removed border radius
  },
  videoThumb: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 0, // Removed border radius
    borderWidth: 1,
    borderColor: '#333',
  },
  playIconWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    marginTop: -12,
    marginLeft: -12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
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
    paddingHorizontal: 16,
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
  listContent: {
    flexGrow: 1,
  },
  loadingText: {
    color: '#bbb',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: '#D28A8C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    color: '#bbb',
    marginTop: 10,
    fontSize: 14,
  },
  emptyStateContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#232323',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#333',
  },
  fallbackText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  loadingImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#232323',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#333',
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

export default GalleryScreen; 