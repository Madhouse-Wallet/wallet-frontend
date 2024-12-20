import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootreducer';

export const store = configureStore({
  reducer: rootReducer,
});

// Type exports for usage in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
