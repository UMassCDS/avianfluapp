import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MantineSize } from '@mantine/core';

interface UIState {
  isMonitor: boolean;
  iconSize: MantineSize;
  textSize: MantineSize;
  fontHeight: number;
  titleSize: number;
}

const initialState: UIState = {
  isMonitor: true,
  iconSize: 'xl',
  textSize: 'md',
  fontHeight: 14,
  titleSize: 40,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsMonitor(state, action: PayloadAction<boolean>) {
      state.isMonitor = action.payload;
    },
    setIconSize(state, action: PayloadAction<MantineSize>) {
      state.iconSize = action.payload;
    },
    setTextSize(state, action: PayloadAction<MantineSize>) {
      state.textSize = action.payload;
    },
    setFontHeight(state, action: PayloadAction<number>) {
      state.fontHeight = action.payload;
    },
    setTitleSize(state, action: PayloadAction<number>) {
      state.titleSize = action.payload;
    },
  },
});

export const {
  setIsMonitor,
  setIconSize,
  setTextSize,
  setFontHeight,
  setTitleSize,
} = uiSlice.actions;
export default uiSlice.reducer;
