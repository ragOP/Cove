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

const { width, height } = Dimensions.get('window');

const ImageViewer = ({
  visible,
  images,
  initialIndex,
  onClose,
  onDelete,
  onMarkSensitive,
  showBottomBar = true,
  showCenterNavigation = true,
  autoHideNavigation = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [showInfo, setShowInfo] = useState(false);
  const [showNavigation, setShowNavigation] = useState(true);
  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSensitiveDialog, setShowSensitiveDialog] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex || 0);
      setShowInfo(false); // Reset info modal when opening
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        console.log('Hardware back button pressed');
        if (showInfo) {
          setShowInfo(false);
          return true;
        }
        onClose();
        return true;
      });
      return () => backHandler.remove();
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
    console.log('Invalid currentImage:', currentImage);
    return null;
  }

  const handleClose = () => {
    console.log('Close button pressed');
    setShowInfo(false); // Close info modal if open
    onClose();
  };

  const handleModalClose = () => {
    console.log('Modal onRequestClose triggered');
    handleClose();
  };

  const handleShare = async () => {
    if (!currentImage?.uri) {
      console.log('Cannot share: no image URI');
      return;
    }

    try {
      await Share.open({ url: currentImage.uri });
    } catch (e) {
      console.log('Share error:', e);
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
      // Toggle selection of current image
      const currentImage = images[currentIndex];
      if (currentImage) {
        setSelectedImages(prev => {
          const isSelected = prev.some(img => img._id === currentImage._id);
          if (isSelected) {
            return prev.filter(img => img._id !== currentImage._id);
          } else {
            return [...prev, currentImage];
          }
        });
      }
    } else if (autoHideNavigation) {
      setShowNavigation(!showNavigation);
    }
  };

  const handleLongPress = () => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      const currentImage = images[currentIndex];
      if (currentImage) {
        setSelectedImages([currentImage]);
      }
    }
  };

  const handleSelectAll = () => {
    setSelectedImages(images);
  };

  const handleDeselectAll = () => {
    setSelectedImages([]);
  };

  const handleCancelSelection = () => {
    setSelectedImages([]);
    setIsSelectionMode(false);
  };

  const isImageSelected = (image) => {
    if (!image || !image._id) return false;
    return selectedImages.some(selected => selected._id === image._id);
  };

  // Dialog handlers
  const handleDeletePress = () => {
    setShowDeleteDialog(true);
  };
  const handleSensitivePress = () => {
    setShowSensitiveDialog(true);
  };
  const confirmDelete = () => {
    if (onDelete) onDelete(images[currentIndex]);
    setShowDeleteDialog(false);
  };
  const confirmSensitive = () => {
    if (onMarkSensitive) onMarkSensitive(images[currentIndex]);
    setShowSensitiveDialog(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleModalClose}
      statusBarTranslucent={true}>
      <StatusBar hidden />
      <View style={styles.modalOverlay}>
        {/* Touchable overlay to close modal when tapping outside - excluding bottom bar area */}
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={handleClose}
          activeOpacity={1}
        />

        {/* Arrow-left icon on the far left */}
        {showNavigation && (
          <TouchableOpacity
            style={styles.arrowButtonAbsolute}
            onPress={handleClose}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Centered image counter */}
        {showNavigation && (
          <View style={styles.imageCounterAbsolute}>
            <Text style={styles.imageCounterText}>
              {currentIndex + 1} of {images.length}
            </Text>
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
              onLongPress={handleLongPress}
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
            <TouchableOpacity
              style={styles.viewerBarButton}
              onPress={handleSensitivePress}>
              <MaterialIcon name="shield-outline" size={26} color="#D28A8C" />
              <Text style={styles.viewerBarLabel}>Sensitive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewerBarButton} onPress={handleShare}>
              <MaterialIcon name="share-variant" size={26} color="#D28A8C" />
              <Text style={styles.viewerBarLabel}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewerBarButton} onPress={() => setShowInfo(true)}>
              <MaterialIcon name="information-outline" size={26} color="#D28A8C" />
              <Text style={styles.viewerBarLabel}>Info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewerBarButton, styles.viewerBarButton]}
              onPress={handleDeletePress}>
              <MaterialIcon name="delete-outline" size={26} color="#D28A8C" />
              <Text style={styles.viewerBarLabel}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selection Bottom Bar */}
        {isSelectionMode && (
          <SelectionBottomBar
            selectedItems={selectedImages}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onDelete={() => onDelete && selectedImages.length > 0 && onDelete(selectedImages)}
            onMarkSensitive={() => onMarkSensitive && selectedImages.length > 0 && onMarkSensitive(selectedImages)}
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
          confirmText="Mark Sensitive"
          cancelText="Cancel"
          onConfirm={confirmSensitive}
          onCancel={() => setShowSensitiveDialog(false)}
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
    zIndex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  arrowButton: {
    marginRight: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageScrollView: {
    flex: 1,
    zIndex: 2,
  },
  imageCounter: {
    // No absolute positioning, just center in row
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageContainer: {
    width: width,
    height: height,
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
    top: 100,
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
  arrowButtonAbsolute: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 1001,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounterAbsolute: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  // Selection styles
  viewerSelectionBadge: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: '#D28A8C',
    borderRadius: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default ImageViewer; 