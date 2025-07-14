import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MIN_WEEK } from '../../utils/utils';

interface TimelineState {
  week: number;
}

const initialState: TimelineState = {
  week: MIN_WEEK,
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setWeek(state, action: PayloadAction<number>) {
      state.week = action.payload;
    },
  },
});

export const { setWeek } = timelineSlice.actions;
export default timelineSlice.reducer;
