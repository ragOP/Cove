import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import CustomBottomNavigation from '../../components/BottomNavigation/BottomNavigation';
import GallerySelectionBar from '../../components/GallerySelectionBar/GallerySelectionBar';

const MainScreen = () => {
  const bottomNavIndex = useSelector(state => state.chat.bottomNavIndex);
  const isGallerySelectionMode = useSelector(state => state.gallery.isSelectionMode);

  return (
    <View style={styles.container}>
      {/* Always render the CustomBottomNavigation which contains the screen content */}
      <CustomBottomNavigation />

      {/* Overlay the selection bar when in gallery selection mode */}
      {isGallerySelectionMode && bottomNavIndex === 1 && (
        <View style={styles.selectionBarOverlay}>
          <GallerySelectionBar useRedux={true} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  selectionBarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
});

export default MainScreen; 