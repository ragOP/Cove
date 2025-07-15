import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Dimensions, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { markAsSensitive } from '../../apis/markAsSensitive';
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
  deselectAll
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

const { width, height } = Dimensions.get('window');

// Fixed 3 columns with proper spacing
const numColumns = 3;
const containerPadding = 8;
const itemSpacing = 4;
const totalSpacing = containerPadding * 2 + itemSpacing * (numColumns - 1);
const itemSize = (width - totalSpacing) / numColumns;

const GalleryItem = ({ item, onPress, onLongPress, isSelected, styles }) => {
  const [error, setError] = React.useState(false);


  if (item.type === 'image') {
    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => onPress?.(item)}
        onLongPress={() => onLongPress?.(item)}
        activeOpacity={0.85}>
        {error || !item.mediaUrl ? (
          <View style={styles.fallbackContainer}>
            <MaterialIcon name="image-broken" size={24} color="#666" />
            <Text style={styles.fallbackText}>No Image</Text>
          </View>
        ) : (
          <CustomImage
            source={{ uri: item.mediaUrl }}
            style={styles.image}
            onError={() => setError(true)}
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
        {error || !item.thumb ? (
          <View style={styles.fallbackContainer}>
            <MaterialIcon name="video-off" size={24} color="#666" />
            <Text style={styles.fallbackText}>No Video</Text>
          </View>
        ) : (
          <CustomImage
            source={{ uri: item.thumb }}
            style={styles.image}
            onError={() => setError(true)}
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
      </View>
    </TouchableOpacity>
  );
};



const GalleryScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState('all');
  const [params, setParams] = useState({
    page: 1,
    per_page: 50,
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [markSensitiveDialog, setMarkSensitiveDialog] = useState(false);
  const [imageViewerMarkSensitiveDialog, setImageViewerMarkSensitiveDialog] = useState(false);
  const [currentImageForSensitive, setCurrentImageForSensitive] = useState(null);

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
      .map(item => ({
        _id: item._id,
        uri: item.mediaUrl,
        isSensitive: item.isSensitive,
      }));
  };
  // Get gallery data from Redux
  const galleryData = useSelector(state => state.gallery.galleryData);
  const isLoadingMedia = useSelector(state => state.gallery.isLoading);
  const mediaError = useSelector(state => state.gallery.error);
  const hasMore = useSelector(state => state.gallery.hasMore);
  const total = useSelector(state => state.gallery.total);
  const page = useSelector(state => state.gallery.page);
  const per_page = useSelector(state => state.gallery.per_page);

  const loadGalleryData = useCallback(async (pageNum) => {
    if (!user?.id) return;

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
        const total = response?.response?.data?.total || response?.response?.data?.totalCount || 0;
        const currentPage = response?.response?.data?.page || pageNum;
        const currentPerPage = response?.response?.data?.per_page || per_page;

        if (pageNum === 1) {
          dispatch(setGalleryData({
            data: galleryArr,
            total: total,
            page: currentPage,
            per_page: currentPerPage
          }));
        } else {
          dispatch(appendGalleryData({
            data: galleryArr,
            total: total,
            page: currentPage,
            per_page: currentPerPage
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
    }
  }, [user?.id, per_page, dispatch]);

  // Load gallery data when page changes
  useEffect(() => {
    if (currentPage === 1) {
      loadGalleryData(1);
    } else {
      loadGalleryData(currentPage);
    }
  }, [user?.id, currentPage, loadGalleryData]);

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

  const handleMediaPress = (item, groupIndex, itemIndex) => {
    console.log('handleMediaPress: item:', item); 
    try {
      if (!item || !item._id) {
        return;
      }

      if (isSelectionMode) {
        // Toggle selection
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
      // Select all items from the filtered media (respects current tab)
      const allFilteredItems = filteredMedia;
      dispatch(selectAll(allFilteredItems));
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
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement delete API call
    dispatch(deselectAll());
    dispatch(setGallerySelectionMode(false));
    setDeleteDialog(false);
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

      if (response.success === false || response.error) {
        setMarkSensitiveDialog(false);
        return;
      }

      // Update Redux state to reflect the changes immediately
      dispatch(updateMultipleGalleryItems({
        itemIds: ids,
        updates: { isSensitive: true }
      }));

      // Success - clear selection and exit selection mode
      dispatch(deselectAll());
      dispatch(setGallerySelectionMode(false));
      setMarkSensitiveDialog(false);

      // Show success dialog - you can add a separate success dialog state
    } catch (error) {
      console.error('Error marking items as sensitive:', error);
      setMarkSensitiveDialog(false);
      // Show error dialog - you can add a separate error dialog state
    }
  };

  const handleMarkSensitiveCancel = () => {
    setMarkSensitiveDialog(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
  };

  const handleImageViewerMarkSensitive = (image) => {
    setCurrentImageForSensitive(image);
    setImageViewerMarkSensitiveDialog(true);
  };

  const handleImageViewerMarkSensitiveConfirm = async () => {
    try {
      const ids = [currentImageForSensitive._id];
      const response = await markAsSensitive({ ids });

      if (response.success === false || response.error) {
        setImageViewerMarkSensitiveDialog(false);
        setCurrentImageForSensitive(null);
        return;
      }

      // Update Redux state to reflect the changes immediately
      dispatch(updateMultipleGalleryItems({
        itemIds: ids,
        updates: { isSensitive: true }
      }));

      // Show success dialog - you can add a separate success dialog state
      setImageViewerMarkSensitiveDialog(false);
      setCurrentImageForSensitive(null);
    } catch (error) {
      console.error('Error marking image as sensitive:', error);
      setImageViewerMarkSensitiveDialog(false);
      setCurrentImageForSensitive(null);
      // Show error dialog - you can add a separate error dialog state
    }
  };

  const handleImageViewerMarkSensitiveCancel = () => {
    setImageViewerMarkSensitiveDialog(false);
    setCurrentImageForSensitive(null);
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
        <Text style={styles.headerTitle}>
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
              refreshing={isLoadingMedia}
              onRefresh={() => {
                // Reset to page 1 and reload
                setCurrentPage(1);
              }}
              tintColor="#D28A8C"
              colors={["#D28A8C"]}
            />
          }
          onEndReached={() => {
            // Load more data if available
            if (hasMore && !isLoadingMedia) {
              setCurrentPage(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            isLoadingMedia ? (
              <View style={styles.loadingContainer}>
                <PrimaryLoader size={48} color="#D28A8C" />
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
        onDelete={handleDelete}
        onMarkSensitive={handleImageViewerMarkSensitive}
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

      {/* Image Viewer Mark Sensitive Dialog */}
      <CustomDialog
        visible={imageViewerMarkSensitiveDialog}
        onDismiss={() => setImageViewerMarkSensitiveDialog(false)}
        title="Mark as Sensitive"
        message="Are you sure you want to mark this image as sensitive?"
        icon="shield-outline"
        iconColor="#D28A8C"
        confirmText="Mark Sensitive"
        cancelText="Cancel"
        onConfirm={handleImageViewerMarkSensitiveConfirm}
        onCancel={handleImageViewerMarkSensitiveCancel}
        confirmButtonColor="#D28A8C"
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    paddingBottom: 100, // Add extra padding to accommodate selection bar
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
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
    color: '#fff',
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

});

export default GalleryScreen; 