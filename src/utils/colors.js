/**
 * Color Utility Constants
 *
 * This file centralizes all color values used throughout the Cove app.
 * Use these constants instead of hardcoding color values to ensure consistency
 * and easy theming management.
 */

// Primary brand colors
export const COLORS = {
  // Primary brand color
  PRIMARY: '#D28A8C',
  PRIMARY_LIGHT: '#E5B3B5',
  PRIMARY_DARK: '#B86B6D',

  // Background colors
  BACKGROUND: '#181818',
  BACKGROUND_SECONDARY: '#232323',
  BACKGROUND_TERTIARY: '#333',

  // Text colors
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#bbb',
  TEXT_MUTED: '#999',

  // Status colors
  SUCCESS: '#4BB543',
  ERROR: '#D32F2F',
  WARNING: '#FF9800',
  INFO: '#1976D2',

  // UI element colors
  BORDER: '#333',
  BORDER_LIGHT: '#444',
  SHADOW: 'rgba(0,0,0,0.3)',
  OVERLAY: 'rgba(0,0,0,0.95)',
  OVERLAY_LIGHT: 'rgba(0,0,0,0.5)',

  // Button colors
  BUTTON_PRIMARY: '#D28A8C',
  BUTTON_SECONDARY: 'rgba(210,138,140,0.1)',
  BUTTON_DANGER: '#ff4444',
  BUTTON_DANGER_BG: 'rgba(255,68,68,0.1)',

  // Badge colors
  BADGE_PRIMARY: '#D28A8C',
  BADGE_SUCCESS: '#4BB543',
  BADGE_ERROR: '#D32F2F',

  // Selection colors
  SELECTION: '#D28A8C',
  SELECTION_BORDER: '#D28A8C',

  // Navigation colors
  NAV_ACTIVE: '#D28A8C',
  NAV_INACTIVE: '#bbb',

  // Modal colors
  MODAL_BACKGROUND: '#181818',
  MODAL_BORDER: '#333',

  // Image viewer colors
  VIEWER_BACKGROUND: 'rgba(0,0,0,0.95)',
  VIEWER_OVERLAY: 'rgba(0,0,0,0.5)',
  VIEWER_BUTTON_BG: 'rgba(0,0,0,0.7)',

  // Chat colors
  CHAT_SENT_BG: '#D28A8C',
  CHAT_RECEIVED_BG: '#232323',
  CHAT_SENT_TEXT: '#fff',
  CHAT_RECEIVED_TEXT: '#fff',

  // Gallery colors
  GALLERY_ITEM_BG: '#232323',
  GALLERY_ITEM_BORDER: '#333',
  GALLERY_SELECTED_BORDER: '#D28A8C',

  // Profile colors
  PROFILE_HEADER_BG: '#232323',
  PROFILE_SECTION_BG: '#181818',
};

// Component-specific color schemes
export const COMPONENT_COLORS = {
  // Snackbar colors
  SNACKBAR: {
    SUCCESS: COLORS.SUCCESS,
    ERROR: COLORS.ERROR,
    INFO: COLORS.INFO,
    WARNING: COLORS.WARNING,
  },

  // Button colors
  BUTTON: {
    PRIMARY: COLORS.BUTTON_PRIMARY,
    SECONDARY: COLORS.BUTTON_SECONDARY,
    DANGER: COLORS.BUTTON_DANGER,
    DANGER_BG: COLORS.BUTTON_DANGER_BG,
  },

  // Badge colors
  BADGE: {
    PRIMARY: COLORS.BADGE_PRIMARY,
    SUCCESS: COLORS.BADGE_SUCCESS,
    ERROR: COLORS.BADGE_ERROR,
  },

  // Chat colors
  CHAT: {
    SENT: {
      BACKGROUND: COLORS.CHAT_SENT_BG,
      TEXT: COLORS.CHAT_SENT_TEXT,
    },
    RECEIVED: {
      BACKGROUND: COLORS.CHAT_RECEIVED_BG,
      TEXT: COLORS.CHAT_RECEIVED_TEXT,
    },
  },

  // Gallery colors
  GALLERY: {
    ITEM: {
      BACKGROUND: COLORS.GALLERY_ITEM_BG,
      BORDER: COLORS.GALLERY_ITEM_BORDER,
      SELECTED_BORDER: COLORS.GALLERY_SELECTED_BORDER,
    },
  },
};

// Helper function to get color for a component
export const getColor = (componentName, colorType = 'PRIMARY') => {
  return (
    COMPONENT_COLORS[componentName]?.[colorType] ||
    COLORS[colorType] ||
    COLORS.PRIMARY
  );
};

// Helper function to get color with opacity
export const getColorWithOpacity = (color, opacity = 1) => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Usage examples:
// import { COLORS, getColor, getColorWithOpacity } from '../utils/colors';
//
// // Direct usage
// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: COLORS.BACKGROUND,
//     borderColor: COLORS.BORDER,
//   },
// });
//
// // Component-specific usage
// const styles = StyleSheet.create({
//   button: {
//     backgroundColor: getColor('BUTTON', 'PRIMARY'),
//   },
// });
//
// // With opacity
// const styles = StyleSheet.create({
//   overlay: {
//     backgroundColor: getColorWithOpacity(COLORS.OVERLAY, 0.5),
//   },
// });
