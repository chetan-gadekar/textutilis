import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import storeReducer from './slices/storeSlice';
import ratingReducer from './slices/ratingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stores: storeReducer,
    ratings: ratingReducer,
  },
});
