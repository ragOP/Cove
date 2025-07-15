import {combineReducers, configureStore} from '@reduxjs/toolkit';
import authSlice from './slice/authSlice';
import snackbarSlice from './slice/snackbarSlice';
import chatReducer from './slice/chatSlice';
import galleryReducer from './slice/gallerySlice';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  keyPrefix: '',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authSlice,
  snackbar: snackbarSlice,
  chat: chatReducer,
  gallery: galleryReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
