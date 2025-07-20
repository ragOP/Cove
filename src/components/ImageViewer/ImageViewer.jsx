import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  StatusBar,
  Image,
  ScrollView,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectionBottomBar from '../SelectionBottomBar/SelectionBottomBar';
import CustomModal from '../CustomModal/CustomModal';
import { markAsSensitive } from '../../apis/markAsSensitive';
import { markAsUnsensitive } from '../../apis/markAsUnsensitive';
import { deleteMessages } from '../../apis/deleteMessages';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../redux/slice/snackbarSlice';
import { formatTime } from '../../utils/time/formatTime';

const { width, height } = Dimensions.get('window');

const ImageViewer = ({
  visible,
  images,
  initialIndex,
  onClose,
  onDelete,
  onMarkSensitive,
  onMarkUnsensitive,
  showBottomBar = true,
  showCenterNavigation = true,
  autoHideNavigation = true,
  showSnackbarNotifications = true,
  currentUserId,
  conversationId
}) => {
  const dispatch = useDispatch();

  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [showInfo, setShowInfo] = useState(false);
  const [showNavigation, setShowNavigation] = useState(true);
  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSensitiveDialog, setShowSensitiveDialog] = useState(false);
  const [showUnsensitiveDialog, setShowUnsensitiveDialog] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex || 0);
      setShowInfo(false); // Reset info modal when opening
      // Reset dialog states when opening
      setShowDeleteDialog(false);
      setShowSensitiveDialog(false);
      setShowUnsensitiveDialog(false);
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (showInfo) {
          setShowInfo(false);
          return true;
        }
        onClose();
        return true;
      });
      return () => backHandler.remove();
    } else {
      setShowDeleteDialog(false);
      setShowSensitiveDialog(false);
      setShowUnsensitiveDialog(false);
    }
  }, [visible, initialIndex, onClose, showInfo]);

  // Auto-hide navigation after 3 seconds
  useEffect(() => {
    if (visible && showNavigation && autoHideNavigation) {
      const timer = setTimeout(() => {
        setShowNavigation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, showNavigation, currentIndex, autoHideNavigation]);

  if (!visible || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  // Safety check for currentImage
  if (!currentImage || !currentImage._id) {
    return null;
  }

  // Get sender information for current image
  const getSenderInfo = (image) => {
    console.log('image', image)
    if (!image || !currentUserId || !image.sender) return null;

    const senderId = image.sender._id;
    const senderName = senderId === currentUserId ? 'You' : image.sender.name;
    const isSentByMe = senderId === currentUserId;

    return {
      name: senderName,
      isSentByMe
    };
  };

  const senderInfo = getSenderInfo(currentImage);

  const handleClose = () => {
    setShowInfo(false);

    setShowDeleteDialog(false);
    setShowSensitiveDialog(false);
    setShowUnsensitiveDialog(false);
    onClose();
  };

  const handleModalClose = () => {
    handleClose();
  };

  const handleShare = async () => {
    if (!currentImage?.uri) {
      return;
    }

    try {
      await Share.open({ url: currentImage.uri });
    } catch (e) {
      // Share error handled silently
    }
  };

  const handlePrev = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
    setShowNavigation(true); // Show navigation when user interacts
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(images.length - 1, currentIndex + 1));
    setShowNavigation(true); // Show navigation when user interacts
  };

  const handleImagePress = () => {
    if (isSelectionMode) {
      // Only allow selection of images sent by current user
      const selectedImage = images[currentIndex];
      if (selectedImage) {
        const imageSenderInfo = getSenderInfo(selectedImage);
        if (!imageSenderInfo || !imageSenderInfo.isSentByMe) return;

        setSelectedImages(prev => {
          const isSelected = prev.some(img => img._id === selectedImage._id);
          if (isSelected) {
            return prev.filter(img => img._id !== selectedImage._id);
          } else {
            return [...prev, selectedImage];
          }
        });
      }
    } else if (autoHideNavigation) {
      setShowNavigation(!showNavigation);
    }
  };

  const handleLongPress = () => {
    // Only allow selection mode for images sent by current user
    if (!senderInfo || !senderInfo.isSentByMe) return;

    if (!isSelectionMode) {
      setIsSelectionMode(true);
      const selectedImage = images[currentIndex];
      if (selectedImage) {
        setSelectedImages([selectedImage]);
      }
    }
  };

  const handleSelectAll = () => {
    // Only select images sent by current user
    const userImages = images.filter(image => {
      const imageSenderInfo = getSenderInfo(image);
      return imageSenderInfo && imageSenderInfo.isSentByMe;
    });
    setSelectedImages(userImages);
  };

  const handleDeselectAll = () => {
    setSelectedImages([]);
  };

  const handleCancelSelection = () => {
    setSelectedImages([]);
    setIsSelectionMode(false);
  };

  const handleMarkSensitiveMultiple = async () => {
    try {
      const ids = selectedImages.map(img => img._id).filter(id => id);
      if (ids.length === 0) {
        console.error('No valid image IDs found for marking as sensitive');
        return;
      }

      const response = await markAsSensitive({ ids });

      if (response?.response?.success) {
        // Call the callback to update UI if provided
        if (onMarkSensitive) {
          onMarkSensitive(selectedImages);
        }
        // Clear selection and exit selection mode
        setSelectedImages([]);
        setIsSelectionMode(false);
        dispatch(
          showSnackbar({
            type: 'success',
            title: 'Marked as Sensitive',
            subtitle: `${ids.length} images have been marked as sensitive`,
            placement: 'top',
          }),
        );

      } else {
        console.error('Failed to mark multiple images as sensitive:', response);
        const errorMessage = response?.response?.data?.message || 'Failed to mark images as sensitive';
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Error',
            subtitle: errorMessage,
            placement: 'top',
          }),
        );
      }
    } catch (error) {
      console.error('Error marking multiple images as sensitive:', error);
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Server Error',
          subtitle: 'Failed to mark images as sensitive',
          placement: 'top',
        }),
      );
    }
  };

  const handleMarkUnsensitiveMultiple = async () => {
    try {
      const ids = selectedImages.map(img => img._id).filter(id => id);
      if (ids.length === 0) {
        console.error('No valid image IDs found for marking as insensitive');
        return;
      }

      const response = await markAsUnsensitive({ ids });

      if (response?.response?.success) {
        // Call the callback to update UI if provided
        if (onMarkUnsensitive) {
          onMarkUnsensitive(selectedImages);
        }
        // Clear selection and exit selection mode
        setSelectedImages([]);
        setIsSelectionMode(false);
        if (showSnackbarNotifications) {
          dispatch(
            showSnackbar({
              type: 'success',
              title: 'Marked as Insensitive',
              subtitle: `${ids.length} images have been marked as insensitive`,
              placement: 'top',
            }),
          );
        }
      } else {
        console.error('Failed to mark multiple images as insensitive:', response);
        const errorMessage = response?.response?.data?.message || 'Failed to mark images as insensitive';
        if (showSnackbarNotifications) {
          dispatch(
            showSnackbar({
              type: 'error',
              title: 'Error',
              subtitle: errorMessage,
              placement: 'top',
            }),
          );
        }
      }
    } catch (error) {
      console.error('Error marking multiple images as insensitive:', error);
      if (showSnackbarNotifications) {
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Server Error',
            subtitle: 'Failed to mark images as insensitive',
            placement: 'top',
          }),
        );
      }
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      const ids = selectedImages.map(img => img._id).filter(id => id);
      if (ids.length === 0) {
        console.error('No valid image IDs found for deletion');
        return;
      }

      const response = await deleteMessages({ ids, conversationId });

      if (response?.response?.success) {
        // Call the callback to update UI if provided
        if (onDelete) {
          onDelete(selectedImages);
        }
        // Clear selection and exit selection mode
        setSelectedImages([]);
        setIsSelectionMode(false);
        dispatch(
          showSnackbar({
            type: 'success',
            title: 'Messages Deleted',
            subtitle: `${ids.length} messages have been deleted successfully`,
            placement: 'top',
          }),
        );

      } else {
        console.error('Failed to delete multiple messages:', response);
        const errorMessage = response?.response?.data?.message || 'Failed to delete messages';
        if (showSnackbarNotifications) {
          dispatch(
            showSnackbar({
              type: 'error',
              title: 'Error',
              subtitle: errorMessage,
              placement: 'top',
            }),
          );
        }
      }
    } catch (error) {
      console.error('Error deleting multiple messages:', error);
      if (showSnackbarNotifications) {
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Server Error',
            subtitle: 'Failed to delete messages',
            placement: 'top',
          }),
        );
      }
    }
  };

  const isImageSelected = (image) => {
    if (!image || !image._id) return false;
    return selectedImages.some(selected => selected._id === image._id);
  };

  // Dialog handlers
  const handleDeletePress = () => {
    const targetImage = images[currentIndex];

    // If image is sensitive, delete directly without showing dialog
    if (targetImage?.isSensitive) {
      confirmDelete();
      return;
    }

    // Otherwise, show the confirmation dialog
    setShowDeleteDialog(true);
  };
  const handleSensitivePress = () => {
    setShowSensitiveDialog(true);
  };
  const handleUnsensitivePress = () => {
    setShowUnsensitiveDialog(true);
  };
  const confirmDelete = async () => {
    try {
      const targetImage = images[currentIndex];
      if (!targetImage?._id) {
        console.error('No image ID found for deleting');
        setShowDeleteDialog(false);
        return;
      }

      // If callback is provided, let it handle the API call and notifications
      if (onDelete) {
        onDelete(targetImage);
        setShowDeleteDialog(false);
        return;
      }

      // Otherwise, make the API call here and show notifications
      const response = await deleteMessages({ ids: [targetImage._id] });

      if (response?.response?.success) {
        if (showSnackbarNotifications) {
          dispatch(
            showSnackbar({
              type: 'success',
              title: 'Message Deleted',
              subtitle: 'Message has been deleted successfully',
              placement: 'top',
            }),
          );
        }
      } else {
        console.error('Failed to delete message:', response);
        const errorMessage = response?.response?.data?.message || 'Failed to delete message';
        if (showSnackbarNotifications) {
          dispatch(
            showSnackbar({
              type: 'error',
              title: 'Error',
              subtitle: errorMessage,
              placement: 'top',
            }),
          );
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      if (showSnackbarNotifications) {
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Server Error',
            subtitle: 'Failed to delete message',
            placement: 'top',
          }),
        );
      }
    } finally {
      setShowDeleteDialog(false);
    }
  };
  const confirmSensitive = async () => {
    try {
      const targetImage = images[currentIndex];
      if (!targetImage?._id) {
        console.error('No image ID found for marking as sensitive');
        setShowSensitiveDialog(false);
        return;
      }

      // If callback is provided, let it handle the API call
      if (onMarkSensitive) {
        onMarkSensitive(targetImage);
        setShowSensitiveDialog(false);
        return;
      }

      // Otherwise, make the API call here
      const response = await markAsSensitive({ ids: [targetImage._id] });

      if (response?.response?.success) {
        if (showSnackbarNotifications) {
          dispatch(
            showSnackbar({
              type: 'success',
              title: 'Marked as Sensitive',
              subtitle: 'Image has been marked as sensitive',
              placement: 'top',
            }),
          );
        }
      } else {
        console.error('Failed to mark as sensitive:', response);
        const errorMessage = response?.response?.data?.message || 'Failed to mark image as sensitive';
        if (showSnackbarNotifications) {
          dispatch(
            showSnackbar({
              type: 'error',
              title: 'Error',
              subtitle: errorMessage,
              placement: 'top',
            }),
          );
        }
      }
    } catch (error) {
      console.error('Error marking as sensitive:', error);
      if (showSnackbarNotifications) {
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Server Error',
            subtitle: 'Failed to mark image as sensitive',
            placement: 'top',
          }),
        );
      }
    } finally {
      setShowSensitiveDialog(false);
    }
  };
  const confirmUnsensitive = async () => {
    try {
      const targetImage = images[currentIndex];
      if (!targetImage?._id) {
        console.error('No image ID found for marking as insensitive');
        setShowUnsensitiveDialog(false);
        return;
      }

      // If callback is provided, let it handle the API call
      if (onMarkUnsensitive) {
        onMarkUnsensitive(targetImage);
        setShowUnsensitiveDialog(false);
        return;
      }

      // Otherwise, make the API call here
      const response = await markAsUnsensitive({ ids: [targetImage._id] });

      if (response?.response?.success) {
        dispatch(
          showSnackbar({
            type: 'success',
            title: 'Marked as Insensitive',
            subtitle: 'Image has been marked as insensitive',
            placement: 'top',
          }),
        );
      } else {
        console.error('Failed to mark as insensitive:', response);
        const errorMessage = response?.response?.data?.message || 'Failed to mark image as insensitive';
        if (showSnackbarNotifications) {
          dispatch(
            showSnackbar({
              type: 'error',
              title: 'Error',
              subtitle: errorMessage,
              placement: 'top',
            }),
          );
        }
      }
    } catch (error) {
      console.error('Error marking as insensitive:', error);
      if (showSnackbarNotifications) {
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Server Error',
            subtitle: 'Failed to mark image as insensitive',
            placement: 'top',
          }),
        );
      }
    } finally {
      setShowUnsensitiveDialog(false);
    }
  };

  console.log(1111111)

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleModalClose}
      statusBarTranslucent={true}>
      <StatusBar hidden />
      <View style={styles.modalOverlay}>

        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={handleClose}
          activeOpacity={1}
        />

        {/* Header with back button, sender info, and time */}
        {showNavigation && (
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={handleClose}
              activeOpacity={0.8}
            // hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerInfoContainer}>
              <View style={styles.senderInfoRow}>
                {senderInfo && (
                  <Text style={styles.senderNameText}>
                    {senderInfo.name || "Unknown"}
                  </Text>
                )}
                {currentImage?.timestamp && (
                  <Text style={styles.timeText}>
                    {formatTime(currentImage.timestamp)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.imageCounterContainer}>
              <Text style={styles.imageCounterText}>
                {currentIndex + 1} of {images.length}
              </Text>
            </View>
          </View>
        )}

        {/* Main Image Container with Navigation */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(newIndex);
            setShowNavigation(true);
          }}
          contentOffset={{ x: currentIndex * width, y: 0 }}
          style={styles.imageScrollView}>
          {images.map((image, index) => (
            <TouchableOpacity
              key={`image-${image?._id || index}-${index}`}
              style={styles.imageContainer}
              onPress={handleImagePress}
              // onLongPress={handleLongPress}
              activeOpacity={1}>
              <Image
                source={{ uri: image?.uri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              {image?.isSensitive && (
                <View style={styles.viewerProtectedBadge}>
                  <MaterialIcon name="shield-outline" size={20} color="#fff" />
                </View>
              )}
              {isSelectionMode && isImageSelected(image) && (
                <View style={styles.viewerSelectionBadge}>
                  <MaterialIcon name="check-circle" size={24} color="#fff" />
                </View>
              )}

              {/* Message Content/Caption Display */}
              {image?.messageContent && image.messageContent.trim() !== '' && (
                <View style={styles.messageContentContainer}>
                  <Text style={styles.messageContentText}>
                    {image.messageContent}
                  </Text>
                </View>
              )}

              {/* Center Navigation Buttons */}
              {showNavigation && showCenterNavigation && (
                <>
                  {/* Left Navigation Button */}
                  {index > 0 && (
                    <TouchableOpacity
                      style={styles.centerNavButton}
                      onPress={handlePrev}
                      activeOpacity={0.8}>
                      <View style={styles.centerNavButtonInner}>
                        <Icon name="chevron-back" size={32} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Right Navigation Button */}
                  {index < images.length - 1 && (
                    <TouchableOpacity
                      style={[styles.centerNavButton, styles.centerNavButtonRight]}
                      onPress={handleNext}
                      activeOpacity={0.8}>
                      <View style={styles.centerNavButtonInner}>
                        <Icon name="chevron-forward" size={32} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Bar */}
        {showBottomBar && !isSelectionMode && (
          <View style={[styles.viewerBottomBar, showNavigation ? {} : { opacity: 0 }]}>
            {/* Only show sensitive/insensitive and delete actions for images sent by current user */}
            {senderInfo && senderInfo.isSentByMe && (
              <>
                {currentImage?.isSensitive ? (
                  <TouchableOpacity
                    style={styles.viewerBarButton}
                    onPress={handleUnsensitivePress}>
                    <MaterialIcon name="shield-off-outline" size={26} color="#D28A8C" />
                    <Text style={styles.viewerBarLabel}>Mark as Insensitive</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.viewerBarButton}
                    onPress={handleSensitivePress}>
                    <MaterialIcon name="shield-outline" size={26} color="#D28A8C" />
                    <Text style={styles.viewerBarLabel}>Mark as Sensitive</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.viewerBarButton, styles.viewerBarButton]}
                  onPress={handleDeletePress}>
                  <MaterialIcon name="delete-outline" size={26} color="#D28A8C" />
                  <Text style={styles.viewerBarLabel}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.viewerBarButton} onPress={handleShare}>
              <MaterialIcon name="share-variant" size={26} color="#D28A8C" />
              <Text style={styles.viewerBarLabel}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewerBarButton} onPress={() => setShowInfo(true)}>
              <MaterialIcon name="information-outline" size={26} color="#D28A8C" />
              <Text style={styles.viewerBarLabel}>Info</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selection Bottom Bar */}
        {isSelectionMode && (
          <SelectionBottomBar
            selectedItems={selectedImages}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onDelete={handleDeleteMultiple}
            onMarkSensitive={handleMarkSensitiveMultiple}
            onMarkUnsensitive={handleMarkUnsensitiveMultiple}
            onCancel={handleCancelSelection}
          />
        )}

        {/* Info Modal - Now properly layered */}
        <Modal
          visible={showInfo}
          transparent
          animationType="fade"
          onRequestClose={() => setShowInfo(false)}
          statusBarTranslucent={true}>
          <View style={styles.infoModalOverlay}>
            <View style={styles.infoModalContent}>
              <View style={styles.infoModalHeader}>
                <Text style={styles.infoTitle}>Image Info</Text>
                <TouchableOpacity
                  style={styles.infoModalCloseBtn}
                  onPress={() => setShowInfo(false)}>
                  <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.infoText}>URL: {currentImage?.uri || 'N/A'}</Text>
              <Text style={styles.infoText}>Index: {currentIndex + 1} of {images.length}</Text>
              {currentImage?.isSensitive && (
                <Text style={styles.infoText}>Status: Protected</Text>
              )}
              {senderInfo && (
                <Text style={styles.infoText}>Sent by: {senderInfo.name}</Text>
              )}
            </View>
          </View>
        </Modal>
        {/* Delete Confirmation Dialog */}
        <CustomModal
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
          title="Delete Item"
          message="Are you sure you want to delete this item?"
          icon="delete-outline"
          iconColor="#ff4444"
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          confirmButtonColor="#ff4444"
          destructive={true}
        />
        {/* Mark as Sensitive Confirmation Dialog */}
        <CustomModal
          visible={showSensitiveDialog}
          onDismiss={() => setShowSensitiveDialog(false)}
          title="Mark as Sensitive"
          message="Are you sure you want to mark this item as sensitive?"
          icon="shield-outline"
          iconColor="#D28A8C"
          confirmText="Mark as Sensitive"
          cancelText="Cancel"
          onConfirm={confirmSensitive}
          onCancel={() => setShowSensitiveDialog(false)}
          confirmButtonColor="#D28A8C"
          showCancel={true}
        />
        {/* Mark as Insensitive Confirmation Dialog */}
        <CustomModal
          visible={showUnsensitiveDialog}
          onDismiss={() => setShowUnsensitiveDialog(false)}
          title="Mark as Insensitive"
          message="Are you sure you want to mark this item as insensitive?"
          icon="shield-off-outline"
          iconColor="#D28A8C"
          confirmText="Mark as Insensitive"
          cancelText="Cancel"
          onConfirm={confirmUnsensitive}
          onCancel={() => setShowUnsensitiveDialog(false)}
          confirmButtonColor="#D28A8C"
          showCancel={true}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 80, // Exclude bottom bar area
    zIndex: 0,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 100,
  },
  arrowButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfoContainer: {
    flex: 1,
    marginLeft: 12,
    alignItems: 'flex-start',
  },
  senderInfoRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  senderNameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    color: '#bbb',
    fontSize: 12,
    marginTop: 2,
  },
  imageCounterContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  imageScrollView: {
    flex: 1,
    zIndex: 10,
    marginTop: 80,
    marginBottom: 80,
  },
  imageContainer: {
    width: width,
    height: height - 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  viewerProtectedBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#D28A8C',
    borderRadius: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  viewerBarButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  viewerBarLabel: {
    color: '#D28A8C',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: 'rgba(255,68,68,0.1)',
  },
  deleteButtonText: {
    color: '#ff4444',
  },
  // Info Modal styles
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModalContent: {
    backgroundColor: '#181818',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  infoModalCloseBtn: {
    padding: 5,
  },
  // Center navigation buttons
  centerNavButton: {
    position: 'absolute',
    top: '50%',
    left: 20,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    marginTop: -30,
  },
  centerNavButtonInner: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerNavButtonRight: {
    left: 'auto',
    right: 20,
  },
  // Selection styles
  viewerSelectionBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#D28A8C',
    borderRadius: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderBadge: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  senderBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
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
    zIndex: 1000,
    elevation: 10,
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
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  dialogBox: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 24,
    minWidth: 280,
    alignItems: 'center',
  },
  dialogTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dialogMessage: {
    color: '#bbb',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  dialogCancel: {
    color: '#D28A8C',
    fontWeight: 'bold',
    marginRight: 24,
    fontSize: 16,
  },
  dialogDelete: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dialogSensitive: {
    color: '#D28A8C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageContentContainer: {
    position: 'absolute',
    bottom: 100, // Adjust as needed
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 10,
    zIndex: 10,
  },
  messageContentText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ImageViewer; 