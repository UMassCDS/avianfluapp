// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import speciesReducer from './slices/speciesSlice';
import timelineReducer from './slices/timelineSlice';
import mapReducer from './slices/mapSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    species: speciesReducer,
    timeline: timelineReducer,
    map: mapReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
