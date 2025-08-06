import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FlowResult {
  week: number;
  url: string;
  legend: string;
}

interface FlowResultsPayload {
  result: FlowResult[];
  geotiff?: string;
};

interface MapState {
  overlayUrl: string;
  flowResults: FlowResult[]; // stores all API Flow results
  flowGeoTiffUrl: string;
  showRecentOutbreaks: boolean;
  showHistoricOutbreaks: boolean;
}

const initialState: MapState = {
  overlayUrl: "",
  flowResults: [],
  flowGeoTiffUrl: "",
  showRecentOutbreaks: true,
  showHistoricOutbreaks: false,
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
    setFlowResults(state, action: PayloadAction<FlowResultsPayload>) {
      state.flowResults = action.payload.result;
      state.flowGeoTiffUrl = action.payload.geotiff || "";
    },
    clearFlowResults(state) {
      state.flowResults = [];
      state.flowGeoTiffUrl = "";
    },
    updateOverlayByWeek(state, action: PayloadAction<number>) {
      if (state.flowResults.length === 0) return;
      const match = state.flowResults.find((r) => r.week === action.payload);
      state.overlayUrl = match ? match.url : "";
    },
    toggleRecentOutbreaks(state) {
      state.showRecentOutbreaks = !state.showRecentOutbreaks;
    },
    toggleHistoricOutbreaks(state) {
      state.showHistoricOutbreaks = !state.showHistoricOutbreaks;
    },
  },
});

export const {
  setOverlayUrl,
  clearOverlayUrl,
  setFlowResults,
  clearFlowResults,
  updateOverlayByWeek,
  toggleRecentOutbreaks,
  toggleHistoricOutbreaks,
} = mapSlice.actions;

export default mapSlice.reducer;