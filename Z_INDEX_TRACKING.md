# Z-Index Tracking

This file tracks all z-index values used throughout the Cove app to ensure proper layering and avoid conflicts.

## Utility File

All z-index values are now centralized in `src/utils/zIndex.js`. Use the utility functions instead of hardcoding values:

- `Z_INDEX.TOAST` - For toast/snackbar components
- `Z_INDEX.MODAL` - For modal dialogs
- `Z_INDEX.NAVIGATION` - For navigation components
- `getZIndexStyle('COMPONENT_NAME')` - Get z-index and elevation for specific components

## Priority Levels

### Highest Priority (9999999+)
- **Snackbar/Toast Notifications**: `zIndex: 9999999` - Must always be on top
  - File: `src/components/Snackbar/CustomSnackbar.jsx`

### High Priority (9999+)
- **CustomModal**: `zIndex: 9999` - Modal dialogs
  - File: `src/components/CustomModal/CustomModal.jsx`
- **ImageViewer Modal Elements**: `zIndex: 9999` - Modal content
  - File: `src/components/ImageViewer/ImageViewer.jsx`

### Medium-High Priority (1000-9998)
- **ImageViewer Navigation**: `zIndex: 1001` - Arrow buttons
  - File: `src/components/ImageViewer/ImageViewer.jsx`
- **ImageViewer Top Bar**: `zIndex: 1000` - Top navigation
  - File: `src/components/ImageViewer/ImageViewer.jsx`
- **ImageViewer Bottom Bar**: `zIndex: 1000` - Bottom controls
  - File: `src/components/ImageViewer/ImageViewer.jsx`
- **Selection Bottom Bar**: `zIndex: 1000` - Selection controls
  - File: `src/components/SelectionBottomBar/SelectionBottomBar.jsx`
- **Gallery Selection Bar**: `zIndex: 1000` - Gallery controls
  - File: `src/components/GallerySelectionBar/GallerySelectionBar.jsx`
- **MainScreen Header**: `zIndex: 1000` - Main screen header
  - File: `src/screens/MainScreen/MainScreen.jsx`

### Medium Priority (100-999)
- **AddContact Modal**: `zIndex: 100` - Contact addition modal
  - File: `src/screens/AddContact/AddContact.jsx`
- **Bottom Navigation**: `zIndex: 100` - Bottom navigation bar
  - File: `src/components/BottomNavigation/BottomNavigation.jsx`

### Low Priority (1-99)
- **ImageViewer Center Navigation**: `zIndex: 10` - Center nav buttons
  - File: `src/components/ImageViewer/ImageViewer.jsx`
- **ImageViewer Image Counter**: `zIndex: 10` - Image counter display
  - File: `src/components/ImageViewer/ImageViewer.jsx`
- **Chats Container**: `zIndex: 10` - Chat container
  - File: `src/screens/ContactChat/components/ChatsContainer.jsx`
- **Media Preview**: `zIndex: 10` - Media preview component
  - File: `src/components/MediaPreview/MediaPreview.jsx`
- **SendChat**: `zIndex: 2` - Send chat component
  - File: `src/screens/ContactChat/components/SendChat.jsx`
- **ImageViewer Image Scroll**: `zIndex: 2` - Image scroll view
  - File: `src/components/ImageViewer/ImageViewer.jsx`
- **Profile View**: `zIndex: 2` - Profile view component
  - File: `src/screens/Profile/ProfileViewScreen.jsx`
- **Message Item**: `zIndex: 1` - Individual message items
  - File: `src/components/Messages/MessageItem.jsx`
- **ImageViewer Overlay**: `zIndex: 1` - Touchable overlay
  - File: `src/components/ImageViewer/ImageViewer.jsx`

## Guidelines for Adding New Z-Index Values

1. **Snackbar/Toast**: Always use `9999999` or higher
2. **Modals**: Use `9999` or higher
3. **Navigation/Headers**: Use `1000-9998`
4. **Content Areas**: Use `100-999`
5. **UI Elements**: Use `1-99`

## Common Conflicts to Avoid

- **Modal + Snackbar**: Modal z-index should be lower than snackbar
- **ImageViewer + Snackbar**: ImageViewer elements should be lower than snackbar
- **Navigation + Content**: Navigation should be higher than content

## Notes

- The snackbar must always have the highest z-index to appear above all other elements
- ImageViewer components have multiple z-index values for different elements
- When adding new components, check this file to avoid conflicts
- Consider using React Native's `elevation` prop for Android compatibility

## Last Updated

- Date: Current
- Changes: Added comprehensive z-index tracking
- Snackbar z-index increased to 9999999 to ensure it appears above ImageViewer 