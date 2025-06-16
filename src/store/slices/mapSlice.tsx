import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FlowResult {
  week: number;
  url: string;
  legend: string;
}

interface MapState {
  overlayUrl: string;
  flowResults: FlowResult[]; // stores all API Flow results
}

const initialState: MapState = {
  overlayUrl: "",
  flowResults: [],
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
    setFlowResults(state, action: PayloadAction<FlowResult[]>) {
      state.flowResults = action.payload;
    },
    clearFlowResults(state) {
      state.flowResults = [];
    },
    updateOverlayByWeek(state, action: PayloadAction<number>) {
      const match = state.flowResults.find((r) => r.week === action.payload);
      if (match) {
        state.overlayUrl = match.url;
      } else {
        state.overlayUrl = "";
      }
    }
  },
});

export const {
  setOverlayUrl,
  clearOverlayUrl,
  setFlowResults,
  clearFlowResults,
  updateOverlayByWeek
} = mapSlice.actions;

export default mapSlice.reducer;