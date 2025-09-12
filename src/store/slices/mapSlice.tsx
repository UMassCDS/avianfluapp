import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FlowResult {
  week: number;
  url: string;
  legend: string;
}

interface FlowResultsPayload {
  result: FlowResult[];
  geotiff?: string;
}

type OutbreakType = 'poultry' | 'bovine' | 'wild_birds';

interface MapState {
  overlayUrl: string;
  flowResults: FlowResult[];
  flowGeoTiffUrl: string;
  showRecentOutbreaks: Record<OutbreakType, boolean>;
  showHistoricOutbreaks: Record<OutbreakType, boolean>;
}

const initialState: MapState = {
  overlayUrl: "",
  flowResults: [],
  flowGeoTiffUrl: "",
  showRecentOutbreaks: {
    poultry: true,
    bovine: false,
    wild_birds: false,
  },
  showHistoricOutbreaks: {
    poultry: false,
    bovine: false,
    wild_birds: false,
  },
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
      const match = state.flowResults.find((r) => (r.week-1) === action.payload);
      state.overlayUrl = match ? match.url : "";
    },
    toggleRecentOutbreaks(state, action: PayloadAction<OutbreakType>) {
      const type = action.payload;
      state.showRecentOutbreaks[type] = !state.showRecentOutbreaks[type];
    },
    toggleHistoricOutbreaks(state, action: PayloadAction<OutbreakType>) {
      const type = action.payload;
      state.showHistoricOutbreaks[type] = !state.showHistoricOutbreaks[type];
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