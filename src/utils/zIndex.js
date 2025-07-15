/**
 * Z-Index Utility Constants
 *
 * This file centralizes all z-index values used throughout the Cove app.
 * Use these constants instead of hardcoding z-index values to ensure consistency
 * and easy tracking of layering priorities.
 */

// Highest Priority - Must always be on top
export const Z_INDEX = {
  // Toast/Snackbar - Must always be highest
  TOAST: 9999999,

  // Modal dialogs and overlays
  MODAL: 9999,

  // Navigation and headers
  NAVIGATION: 1000,
  NAVIGATION_ABSOLUTE: 1001,

  // Content areas and containers
  CONTENT: 100,

  // UI elements and components
  UI_ELEMENT: 10,
  UI_ELEMENT_LOW: 2,
  UI_ELEMENT_MIN: 1,
};

// Specific component z-index values
export const COMPONENT_Z_INDEX = {
  // Snackbar/Toast
  SNACKBAR: Z_INDEX.TOAST,

  // Modals
  CUSTOM_MODAL: Z_INDEX.MODAL,
  IMAGE_VIEWER_MODAL: Z_INDEX.MODAL,

  // Navigation
  BOTTOM_NAVIGATION: Z_INDEX.CONTENT,
  MAIN_SCREEN_HEADER: Z_INDEX.NAVIGATION,
  CONTACT_HEADER: Z_INDEX.CONTENT,

  // Selection bars
  SELECTION_BOTTOM_BAR: Z_INDEX.NAVIGATION,
  GALLERY_SELECTION_BAR: Z_INDEX.NAVIGATION,

  // ImageViewer components
  IMAGE_VIEWER_TOP_BAR: Z_INDEX.NAVIGATION,
  IMAGE_VIEWER_BOTTOM_BAR: Z_INDEX.NAVIGATION,
  IMAGE_VIEWER_ARROW_BUTTON: Z_INDEX.NAVIGATION_ABSOLUTE,
  IMAGE_VIEWER_CENTER_NAV: Z_INDEX.UI_ELEMENT,
  IMAGE_VIEWER_IMAGE_COUNTER: Z_INDEX.UI_ELEMENT,
  IMAGE_VIEWER_IMAGE_SCROLL: Z_INDEX.UI_ELEMENT_LOW,
  IMAGE_VIEWER_OVERLAY: Z_INDEX.UI_ELEMENT_MIN,

  // Chat components
  CHATS_CONTAINER: Z_INDEX.UI_ELEMENT,
  SEND_CHAT: Z_INDEX.UI_ELEMENT_LOW,
  MESSAGE_ITEM: Z_INDEX.UI_ELEMENT_MIN,

  // Media components
  MEDIA_PREVIEW: Z_INDEX.UI_ELEMENT,

  // Profile components
  PROFILE_VIEW: Z_INDEX.UI_ELEMENT_LOW,

  // Add contact
  ADD_CONTACT_MODAL: Z_INDEX.CONTENT,
};

// Helper function to get z-index for a component
export const getZIndex = componentName => {
  return COMPONENT_Z_INDEX[componentName] || Z_INDEX.UI_ELEMENT;
};

// Helper function to get elevation for Android
export const getElevation = componentName => {
  const zIndex = getZIndex(componentName);
  // Convert z-index to elevation (Android uses elevation instead of z-index)
  if (zIndex >= Z_INDEX.TOAST) return 9999999;
  if (zIndex >= Z_INDEX.MODAL) return 10;
  if (zIndex >= Z_INDEX.NAVIGATION) return 8;
  if (zIndex >= Z_INDEX.CONTENT) return 4;
  if (zIndex >= Z_INDEX.UI_ELEMENT) return 2;
  return 1;
};

// Style helper for components
export const getZIndexStyle = componentName => ({
  zIndex: getZIndex(componentName),
  elevation: getElevation(componentName),
});

// Usage examples:
// import { Z_INDEX, getZIndex, getZIndexStyle } from '../utils/zIndex';
//
// // In StyleSheet
// const styles = StyleSheet.create({
//   container: {
//     ...getZIndexStyle('SNACKBAR'),
//   },
// });
//
// // Or direct usage
// const styles = StyleSheet.create({
//   container: {
//     zIndex: Z_INDEX.TOAST,
//     elevation: 9999999,
//   },
// });
