import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { dateToWeek } from '../../utils/utils';

interface TimelineState {
  week: number;
}

const initialState: TimelineState = {
  week: dateToWeek(new Date()),
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
