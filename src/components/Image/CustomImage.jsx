import React, { useState } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import MediaPreview from '../MediaPreview/MediaPreview';

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
      {showPreview && previewVisible && (
        <MediaPreview
          visible={previewVisible}
          media={{ type: 'image', uri: source?.uri }}
          onClose={() => setPreviewVisible(false)}
        />
      )}
    </>
  );
};


export default CustomImage;
