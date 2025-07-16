import React, { useState } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import ImageViewer from '../ImageViewer/ImageViewer';

/**
 * CustomImage - A wrapper for <Image> with fallback and advanced props if needed.
 * Usage: For all standard images in the app (not placeholders)
 * @param {boolean} showPreview - If true, clicking the image opens a preview modal (default: false)
 * @param {boolean} isSensitive - If true, shows shield icon in preview (default: false)
 * @param {string} messageContent - Message content/caption to display in preview (default: '')
 * @param {function} onMarkSensitive - Function to mark image as sensitive (optional)
 * @param {function} onMarkUnsensitive - Function to mark image as insensitive (optional)
 * @param {function} onDelete - Function to delete image/message (optional)
 * @param {string} messageId - The actual message ID for API calls (optional)
 * @param {object} sender - Sender information for the image (optional)
 * @param {string} currentUserId - Current user ID to determine ownership (optional)
 */
const CustomImage = ({
  source,
  style,
  onError,
  showPreview = false,
  isSensitive = false,
  messageContent = '',
  onMarkSensitive,
  onMarkUnsensitive,
  onDelete,
  messageId,
  sender,
  currentUserId,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  if (error) {
    return null; // Or render a fallback UI if desired
  }

  const handlePress = () => {
    if (showPreview) {
      setPreviewVisible(true);
    }
  };

  const handleMarkSensitive = async (image) => {
    if (onMarkSensitive) {
      await onMarkSensitive(image);
    }
  };

  const handleMarkUnsensitive = async (image) => {
    if (onMarkUnsensitive) {
      await onMarkUnsensitive(image);
    }
  };

  const handleDelete = async (image) => {
    if (onDelete) {
      await onDelete(image);
      // Close the preview after successful deletion
      setPreviewVisible(false);
    }
  };

  // Prepare image for ImageViewer
  const imageForViewer = source?.uri ? {
    _id: messageId || 'single-image', // Use actual message ID if provided
    uri: source.uri,
    isSensitive: isSensitive,
    messageContent: messageContent,
    sender: sender, // Include sender information
  } : null;

  return (
    <>
      <TouchableOpacity
        activeOpacity={showPreview ? 0.8 : 1}
        onPress={handlePress}
        disabled={!showPreview}>
        <Image
          source={source}
          style={style}
          onError={e => {
            setError(true);
            onError && onError(e);
          }}
          {...props}
        />
      </TouchableOpacity>
      {showPreview && previewVisible && imageForViewer && (
        <ImageViewer
          visible={previewVisible}
          images={[imageForViewer]}
          initialIndex={0}
          onClose={() => setPreviewVisible(false)}
          onMarkSensitive={handleMarkSensitive}
          onMarkUnsensitive={handleMarkUnsensitive}
          onDelete={handleDelete}
          showBottomBar={true}
          showCenterNavigation={false}
          autoHideNavigation={false}
          showSnackbarNotifications={false}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
};

export default CustomImage;
