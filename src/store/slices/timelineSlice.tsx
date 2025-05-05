import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TimelineState {
  week: number;
}

const initialState: TimelineState = {
  week: 0,
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
