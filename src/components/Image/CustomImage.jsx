import React, { useState } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import ImageViewer from '../ImageViewer/ImageViewer';

/**
 * CustomImage - A wrapper for <Image> with fallback and advanced props if needed.
 * Usage: For all standard images in the app (not placeholders)
 * @param {boolean} showPreview - If true, clicking the image opens a preview modal (default: false)
 */
const CustomImage = ({
  source,
  style,
  onError,
  showPreview = false,
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

  // Prepare image for ImageViewer
  const imageForViewer = source?.uri ? {
    _id: 'single-image',
    uri: source.uri,
    isSensitive: false,
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
          showBottomBar={true}
          showCenterNavigation={false}
          autoHideNavigation={false}
        />
      )}
    </>
  );
};

export default CustomImage;
