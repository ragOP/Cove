import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  conversations: [],

  defaultConversationState: {
    contactId: null,
    deletedMessageIds: [],
    isGallerySelectionMode: false,
    selectedItems: [],
    galleryData: [],
    galleryParams: {
      page: 1,
      per_page: 20,
    },
    galleryLoading: false,
    galleryError: null,
    galleryTotal: 0,
    galleryHasMore: true,
  },
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    // Initialize conversation state for a contact
    initializeConversation: (state, action) => {
      const contactId = action.payload;
      const existingConversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (!existingConversation) {
        state.conversations.push({
          ...state.defaultConversationState,
          contactId,
        });
      }
    },

    // Add deleted message IDs for a specific contact
    addDeletedMessageIds: (state, action) => {
      const {contactId, messageIds} = action.payload;

      // Find or create conversation
      let conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (!conversation) {
        conversation = {...state.defaultConversationState, contactId};
        state.conversations.push(conversation);
      }

      // Add new IDs to the existing array, avoiding duplicates
      messageIds.forEach(id => {
        if (!conversation.deletedMessageIds.includes(id)) {
          conversation.deletedMessageIds.push(id);
        }
      });
    },

    // Clear deleted message IDs for a specific contact
    clearDeletedMessageIds: (state, action) => {
      const contactId = action.payload;
      const conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (conversation) {
        conversation.deletedMessageIds = [];
      }
    },

    // Set gallery selection mode for a specific contact
    setConversationGallerySelectionMode: (state, action) => {
      const {contactId, isSelectionMode} = action.payload;

      // Find or create conversation
      let conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (!conversation) {
        conversation = {...state.defaultConversationState, contactId};
        state.conversations.push(conversation);
      }

      conversation.isGallerySelectionMode = isSelectionMode;
      if (!isSelectionMode) {
        conversation.selectedItems = [];
      }
    },

    // Set selected items for a specific contact
    setConversationSelectedItems: (state, action) => {
      const {contactId, items} = action.payload;

      // Find or create conversation
      let conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (!conversation) {
        conversation = {...state.defaultConversationState, contactId};
        state.conversations.push(conversation);
      }

      conversation.selectedItems = items;
    },

    // Toggle select item for a specific contact
    toggleConversationSelectItem: (state, action) => {
      const {contactId, item} = action.payload;

      // Find or create conversation
      let conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (!conversation) {
        conversation = {...state.defaultConversationState, contactId};
        state.conversations.push(conversation);
      }

      const exists = conversation.selectedItems.some(
        selected => selected._id === item._id,
      );

      if (exists) {
        conversation.selectedItems = conversation.selectedItems.filter(
          selected => selected._id !== item._id,
        );
        if (conversation.selectedItems.length === 0) {
          conversation.isGallerySelectionMode = false;
        }
      } else {
        conversation.selectedItems.push(item);
        conversation.isGallerySelectionMode = true;
      }
    },

    // Select all items for a specific contact
    selectAllConversationItems: (state, action) => {
      const {contactId, items} = action.payload;

      // Find or create conversation
      let conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (!conversation) {
        conversation = {...state.defaultConversationState, contactId};
        state.conversations.push(conversation);
      }

      conversation.selectedItems = items;
      conversation.isGallerySelectionMode = true;
    },

    // Deselect all items for a specific contact
    deselectAllConversationItems: (state, action) => {
      const contactId = action.payload;
      const conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (conversation) {
        conversation.selectedItems = [];
        conversation.isGallerySelectionMode = false;
      }
    },

    // Clear conversation state for a specific contact
    clearConversation: (state, action) => {
      const contactId = action.payload;
      state.conversations = state.conversations.filter(
        conv => conv.contactId !== contactId,
      );
    },

    // Gallery data actions
    setConversationGalleryData: (state, action) => {
      const {contactId, data, total, page, per_page} = action.payload;
      let conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (!conversation) {
        conversation = {...state.defaultConversationState, contactId};
        state.conversations.push(conversation);
      }

      conversation.galleryData = data;
      conversation.galleryTotal = total || 0;
      conversation.galleryParams.page = page || 1;
      conversation.galleryParams.per_page = per_page || 20;
      conversation.galleryHasMore = page * per_page < total;
      conversation.galleryLoading = false;
      conversation.galleryError = null;
    },

    appendConversationGalleryData: (state, action) => {
      const {contactId, data, total, page, per_page} = action.payload;
      let conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (!conversation) {
        conversation = {...state.defaultConversationState, contactId};
        state.conversations.push(conversation);
      }

      // Filter out duplicates
      const newItems = data.filter(
        newItem =>
          !conversation.galleryData.some(
            existing => existing._id === newItem._id,
          ),
      );
      conversation.galleryData = [...conversation.galleryData, ...newItems];
      conversation.galleryTotal = total || conversation.galleryTotal;
      conversation.galleryParams.page = page || conversation.galleryParams.page;
      conversation.galleryParams.per_page =
        per_page || conversation.galleryParams.per_page;
      conversation.galleryHasMore = page * per_page < total;
    },

    updateConversationGalleryItem: (state, action) => {
      const {contactId, itemId, updates} = action.payload;
      const conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (conversation) {
        const index = conversation.galleryData.findIndex(
          item => item._id === itemId,
        );
        if (index !== -1) {
          conversation.galleryData[index] = {
            ...conversation.galleryData[index],
            ...updates,
          };
        }
      }
    },

    removeConversationGalleryItems: (state, action) => {
      const {contactId, itemIds} = action.payload;
      const conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (conversation) {
        conversation.galleryData = conversation.galleryData.filter(
          item => !itemIds.includes(item._id),
        );
        conversation.galleryTotal = Math.max(
          0,
          conversation.galleryTotal - itemIds.length,
        );
      }
    },

    setConversationGalleryLoading: (state, action) => {
      const {contactId, loading} = action.payload;
      const conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (conversation) {
        conversation.galleryLoading = loading;
      }
    },

    setConversationGalleryError: (state, action) => {
      const {contactId, error} = action.payload;
      const conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (conversation) {
        conversation.galleryError = error;
        conversation.galleryLoading = false;
      }
    },

    setConversationGalleryParams: (state, action) => {
      const {contactId, params} = action.payload;
      const conversation = state.conversations.find(
        conv => conv.contactId === contactId,
      );
      if (conversation) {
        conversation.galleryParams = {...conversation.galleryParams, ...params};
      }
    },

    // Clear all conversations
    clearAllConversations: state => {
      state.conversations = [];
    },
  },
});

export const {
  initializeConversation,
  addDeletedMessageIds,
  clearDeletedMessageIds,
  setConversationGallerySelectionMode,
  setConversationSelectedItems,
  toggleConversationSelectItem,
  selectAllConversationItems,
  deselectAllConversationItems,
  clearConversation,
  clearAllConversations,
  setConversationGalleryData,
  appendConversationGalleryData,
  updateConversationGalleryItem,
  removeConversationGalleryItems,
  setConversationGalleryLoading,
  setConversationGalleryError,
  setConversationGalleryParams,
} = conversationSlice.actions;

// Memoized selector for conversation state
export const selectConversationState = (contactId) => (state) => {
  return state.conversation.conversations.find(conv => conv.contactId === contactId) || {};
};

export default conversationSlice.reducer;
