import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Selection state
  isSelectionMode: false,
  selectedItems: [],
  
  // Gallery data - single source of truth
  galleryData: [],
  isLoading: false,
  error: null,
  
  // Pagination
  page: 1,
  per_page: 50,
  total: 0,
  hasMore: true, // Calculated based on total
};

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    // Selection actions
    setGallerySelectionMode(state, action) {
      state.isSelectionMode = action.payload;
      if (!action.payload) {
        state.selectedItems = [];
      }
    },
    setSelectedItems(state, action) {
      state.selectedItems = action.payload;
    },
    clearSelectedItems(state) {
      state.selectedItems = [];
      state.isSelectionMode = false;
    },
    toggleSelectItem(state, action) {
      const item = action.payload;
      const exists = state.selectedItems.some(selected => selected._id === item._id);
      if (exists) {
        state.selectedItems = state.selectedItems.filter(selected => selected._id !== item._id);
        if (state.selectedItems.length === 0) {
          state.isSelectionMode = false;
        }
      } else {
        state.selectedItems.push(item);
        state.isSelectionMode = true;
      }
    },
    selectAll(state, action) {
      state.selectedItems = action.payload;
      state.isSelectionMode = true;
    },
    deselectAll(state) {
      state.selectedItems = [];
      state.isSelectionMode = false;
    },

    // Gallery data actions
    setGalleryData(state, action) {
      const { data, total, page, per_page } = action.payload;
      state.galleryData = data;
      state.total = total || 0;
      state.page = page || 1;
      state.per_page = per_page || 50;
      state.hasMore = (page * per_page) < total;
      state.isLoading = false;
      state.error = null;
    },
    appendGalleryData(state, action) {
      const { data, total, page, per_page } = action.payload;
      const newItems = data.filter(
        newItem => !state.galleryData.some(existing => existing._id === newItem._id)
      );
      state.galleryData = [...state.galleryData, ...newItems];
      state.total = total || state.total;
      state.page = page || state.page;
      state.per_page = per_page || state.per_page;
      state.hasMore = (page * per_page) < total;
    },
    updateGalleryItem(state, action) {
      const { itemId, updates } = action.payload;
      const index = state.galleryData.findIndex(item => item._id === itemId);
      if (index !== -1) {
        state.galleryData[index] = { ...state.galleryData[index], ...updates };
      }
    },
    updateMultipleGalleryItems(state, action) {
      const { itemIds, updates } = action.payload;
      state.galleryData = state.galleryData.map(item => 
        itemIds.includes(item._id) ? { ...item, ...updates } : item
      );
    },
    removeGalleryItems(state, action) {
      const itemIds = action.payload;
      state.galleryData = state.galleryData.filter(item => !itemIds.includes(item._id));
      // Update total count
      state.total = Math.max(0, state.total - itemIds.length);
    },
    setGalleryLoading(state, action) {
      state.isLoading = action.payload;
    },
    setGalleryError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearGalleryData(state) {
      state.galleryData = [];
      state.page = 1;
      state.per_page = 50;
      state.total = 0;
      state.hasMore = true;
      state.isLoading = false;
      state.error = null;
    },
    setGalleryPage(state, action) {
      state.page = action.payload;
      // Recalculate hasMore
      state.hasMore = (state.page * state.per_page) < state.total;
    },
    setGalleryPerPage(state, action) {
      state.per_page = action.payload;
      // Recalculate hasMore
      state.hasMore = (state.page * state.per_page) < state.total;
    },
    setGalleryTotal(state, action) {
      state.total = action.payload;
      // Recalculate hasMore
      state.hasMore = (state.page * state.per_page) < state.total;
    },
  },
});

export const {
  // Selection actions
  setGallerySelectionMode,
  setSelectedItems,
  clearSelectedItems,
  toggleSelectItem,
  selectAll,
  deselectAll,
  
  // Gallery data actions
  setGalleryData,
  appendGalleryData,
  updateGalleryItem,
  updateMultipleGalleryItems,
  removeGalleryItems,
  setGalleryLoading,
  setGalleryError,
  clearGalleryData,
  setGalleryPage,
  setGalleryPerPage,
  setGalleryTotal,
} = gallerySlice.actions;

export default gallerySlice.reducer; 