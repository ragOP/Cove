import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  contacts: [],
  loading: false,
  error: null,
  page: 1,
  perPage: 20,
  hasMore: true,
  contactType: 'all',
  isFetched: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setContacts: (state, action) => {
      state.contacts = action.payload.contacts;
      state.page = action.payload.page;
      state.hasMore = action.payload.hasMore;
      state.loading = false;
      state.error = null;
      state.isFetched = true;
      if (typeof action.payload.contactType === 'string') {
        state.contactType = action.payload.contactType;
      }
    },
    appendContacts: (state, action) => {
      const newContacts = action.payload.contacts.filter(
        c => !state.contacts.some(existing => existing._id === c._id),
      );
      state.contacts = [...state.contacts, ...newContacts];
      state.page = action.payload.page;
      state.hasMore = action.payload.hasMore;
      state.loading = false;
      state.error = null;
    },
    addContact: (state, action) => {
      state.contacts.unshift(action.payload);
    },
    updateContact: (state, action) => {
      const idx = state.contacts.findIndex(c => c._id === action.payload._id);
      if (idx !== -1) {
        state.contacts[idx] = {...state.contacts[idx], ...action.payload};
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearContacts: state => {
      state.contacts = [];
      state.page = 1;
      state.hasMore = true;
      state.loading = false;
      state.error = null;
      state.isFetched = false;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1;
    },
    setContactType: (state, action) => {
      state.contactType = action.payload;
      state.page = 1;
    },
    setIsFetched: (state, action) => {
      state.isFetched = action.payload;
    },
  },
});

export const {
  setContacts,
  appendContacts,
  addContact,
  updateContact,
  setLoading,
  setError,
  clearContacts,
  setPage,
  setContactType,
  setIsFetched,
} = chatSlice.actions;
export default chatSlice.reducer;
