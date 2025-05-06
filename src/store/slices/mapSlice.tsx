import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MapState {
  overlayUrl: string;
}

const initialState: MapState = {
  overlayUrl: "",
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setOverlayUrl(state, action: PayloadAction<string>) {
      state.overlayUrl = action.payload;
    },
    clearOverlayUrl(state) {
      state.overlayUrl = "";
    },
  },
});

export const { setOverlayUrl, clearOverlayUrl } = mapSlice.actions;

export default mapSlice.reducer;