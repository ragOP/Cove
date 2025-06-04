import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  visible: false,
  type: 'info',
  title: '',
  subtitle: '',
  placement: 'bottom',
  duration: 3000,
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (state, action) => {
      state.visible = true;
      state.type = action.payload.type || 'info';
      state.duration = action.payload.duration || 3000;
      state.title = action.payload.title;
      state.placement = action.payload.placement || 'bottom';
      state.subtitle = action.payload.subtitle || '';
    },
    hideSnackbar: state => {
      state.visible = false;
    },
  },
});

export const {showSnackbar, hideSnackbar} = snackbarSlice.actions;
export default snackbarSlice.reducer;
