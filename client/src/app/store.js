import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import cartReducer from '../features/cartSlice';
import uiReducer from '../features/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
