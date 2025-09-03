import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import uiReducer from './slices/uiSlice';
import speciesReducer from './slices/speciesSlice';
import timelineReducer from './slices/timelineSlice';
import mapReducer from './slices/mapSlice';
import outbreaksReducer from './slices/outbreaksSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    species: speciesReducer,
    timeline: timelineReducer,
    map: mapReducer,
    outbreaks: outbreaksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
