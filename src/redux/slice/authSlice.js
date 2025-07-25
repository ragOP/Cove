import {createSlice} from '@reduxjs/toolkit';
import {clearContacts} from './chatSlice';

const initialState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout(state) {
      state.token = null;
      state.user = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    updateUser(state, action) {
      state.user = {...state.user, ...action.payload};
    },
  },
});

export const loginUser = userData => dispatch => {
  // dispatch(clearContacts());
  dispatch(login(userData));
};

export const logoutUser = () => dispatch => {
  dispatch(clearContacts());
  dispatch(logout());
};

export const {login, logout, setUser, updateUser} = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = state => state.auth;
export const selectToken = state => state.auth.token;
export const selectUser = state => state.auth.user;
