/**
 * Spacing Utility Constants
 *
 * This file centralizes all spacing values used throughout the Cove app.
 * Use these constants instead of hardcoding spacing values to ensure consistency
 * and easy responsive design management.
 */

// Base spacing unit (in pixels)
const BASE_UNIT = 4;

// Spacing scale
export const SPACING = {
  // Micro spacing
  XS: BASE_UNIT, // 4px
  SM: BASE_UNIT * 2, // 8px
  MD: BASE_UNIT * 3, // 12px
  LG: BASE_UNIT * 4, // 16px
  XL: BASE_UNIT * 6, // 24px
  XXL: BASE_UNIT * 8, // 32px
  XXXL: BASE_UNIT * 12, // 48px

  // Specific spacing values
  TINY: 2,
  SMALL: 6,
  MEDIUM: 10,
  LARGE: 14,
  EXTRA_LARGE: 20,
  HUGE: 28,
  MASSIVE: 40,
};

// Component-specific spacing
export const COMPONENT_SPACING = {
  // Container padding
  CONTAINER: {
    PADDING_HORIZONTAL: SPACING.LG,
    PADDING_VERTICAL: SPACING.MD,
    MARGIN_BOTTOM: SPACING.LG,
  },

  // Card spacing
  CARD: {
    PADDING: SPACING.LG,
    MARGIN_BOTTOM: SPACING.MD,
    BORDER_RADIUS: SPACING.SM,
  },

  // Button spacing
  BUTTON: {
    PADDING_HORIZONTAL: SPACING.LG,
    PADDING_VERTICAL: SPACING.MD,
    MARGIN_BOTTOM: SPACING.SM,
    BORDER_RADIUS: SPACING.SM,
  },

  // Input spacing
  INPUT: {
    PADDING_HORIZONTAL: SPACING.MD,
    PADDING_VERTICAL: SPACING.SM,
    MARGIN_BOTTOM: SPACING.MD,
    BORDER_RADIUS: SPACING.SM,
  },

  // Navigation spacing
  NAVIGATION: {
    PADDING_HORIZONTAL: SPACING.LG,
    PADDING_VERTICAL: SPACING.MD,
    ICON_MARGIN: SPACING.SM,
  },

  // Header spacing
  HEADER: {
    PADDING_HORIZONTAL: SPACING.LG,
    PADDING_VERTICAL: SPACING.MD,
    HEIGHT: 56,
  },

  // Chat spacing
  CHAT: {
    MESSAGE_MARGIN: SPACING.SM,
    BUBBLE_PADDING: SPACING.MD,
    BUBBLE_RADIUS: SPACING.SM,
    TIMESTAMP_MARGIN: SPACING.XS,
  },

  // Gallery spacing
  GALLERY: {
    ITEM_MARGIN: SPACING.XS,
    GRID_PADDING: SPACING.LG,
    SECTION_MARGIN: SPACING.LG,
  },

  // Modal spacing
  MODAL: {
    PADDING: SPACING.LG,
    MARGIN: SPACING.LG,
    BORDER_RADIUS: SPACING.MD,
  },

  // Snackbar spacing
  SNACKBAR: {
    PADDING_HORIZONTAL: SPACING.LG,
    PADDING_VERTICAL: SPACING.MD,
    MARGIN_HORIZONTAL: SPACING.LG,
    BORDER_RADIUS: SPACING.SM,
  },

  // Image viewer spacing
  IMAGE_VIEWER: {
    BUTTON_SIZE: 40,
    BUTTON_MARGIN: SPACING.MD,
    COUNTER_PADDING: SPACING.MD,
    BOTTOM_BAR_PADDING: SPACING.LG,
  },

  // Selection bar spacing
  SELECTION_BAR: {
    PADDING_HORIZONTAL: SPACING.LG,
    PADDING_VERTICAL: SPACING.MD,
    BUTTON_MARGIN: SPACING.SM,
  },
};

// Helper function to get spacing for a component
export const getSpacing = (componentName, spacingType = 'PADDING') => {
  return COMPONENT_SPACING[componentName]?.[spacingType] || SPACING.MD;
};

// Helper function to get responsive spacing
export const getResponsiveSpacing = (size = 'MD', multiplier = 1) => {
  const baseSpacing = SPACING[size] || SPACING.MD;
  return baseSpacing * multiplier;
};

// Helper function to create spacing style object
export const getSpacingStyle = (componentName, styleType = 'PADDING') => {
  const spacing = getSpacing(componentName, styleType);
  return {
    [styleType.toLowerCase()]: spacing,
  };
};

// Helper function to create margin/padding style
export const createSpacingStyle = (type, size) => {
  return {
    [type.toLowerCase()]: SPACING[size] || SPACING.MD,
  };
};

// Common spacing combinations
export const SPACING_STYLES = {
  // Container styles
  CONTAINER: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },

  // Card styles
  CARD: {
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    borderRadius: SPACING.SM,
  },

  // Button styles
  BUTTON: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: SPACING.SM,
  },

  // Input styles
  INPUT: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: SPACING.SM,
  },

  // Navigation styles
  NAVIGATION: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },

  // Header styles
  HEADER: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },

  // Chat styles
  CHAT_BUBBLE: {
    padding: SPACING.MD,
    borderRadius: SPACING.SM,
    marginBottom: SPACING.SM,
  },

  // Gallery styles
  GALLERY_ITEM: {
    margin: SPACING.XS,
  },

  // Modal styles
  MODAL: {
    padding: SPACING.LG,
    borderRadius: SPACING.MD,
  },

  // Snackbar styles
  SNACKBAR: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: SPACING.SM,
  },
};

// Usage examples:
// import { SPACING, getSpacing, SPACING_STYLES } from '../utils/spacing';
//
// // Direct usage
// const styles = StyleSheet.create({
//   container: {
//     padding: SPACING.LG,
//     marginBottom: SPACING.MD,
//   },
// });
//
// // Component-specific usage
// const styles = StyleSheet.create({
//   button: {
//     ...SPACING_STYLES.BUTTON,
//   },
// });
//
// // Helper function usage
// const styles = StyleSheet.create({
//   container: {
//     padding: getSpacing('CONTAINER', 'PADDING'),
//   },
// });
