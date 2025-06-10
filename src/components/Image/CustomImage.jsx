import React, {useState} from 'react';
import {Image, Modal, View, StyleSheet, TouchableOpacity, Pressable} from 'react-native';

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
        <Modal
          visible={previewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewVisible(false)}>
          <Pressable
            style={styles.previewOverlay}
            onPress={() => setPreviewVisible(false)}>
            <Image
              source={source}
              style={styles.previewImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.previewCloseBtn}
              onPress={() => setPreviewVisible(false)}>
              <View style={styles.closeIconContainer}>
                <View style={[styles.closeIconLine, styles.closeIconLine45]} />
                <View style={[styles.closeIconLine, styles.closeIconLineNeg45]} />
              </View>
            </TouchableOpacity>
          </Pressable>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '96%',
    height: '80%',
    borderRadius: 16,
    backgroundColor: '#222',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 36,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10,
  },
  closeIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconLine: {
    width: 20,
    height: 2,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  closeIconLine45: {
    transform: [{ rotate: '45deg' }],
  },
  closeIconLineNeg45: {
    transform: [{ rotate: '-45deg' }],
  },
});

export default CustomImage;
