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
type FlowResultsCache = Record<string, FlowResultsPayload>;

interface FlowResultsKey {
  dataIndex: number;
  speciesIndex: number;
  location: string[];
  week: number;
}

interface MapState {
  overlayUrl: string;
  flowResults: FlowResult[];
  flowGeoTiffUrl: string;
  flowResultsCache: FlowResultsCache;
  showRecentOutbreaks: Record<OutbreakType, boolean>;
  showHistoricOutbreaks: Record<OutbreakType, boolean>;
}

const initialState: MapState = {
  overlayUrl: "",
  flowResults: [],
  flowGeoTiffUrl: "",
  flowResultsCache: {},
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

function makeCacheKey(key: FlowResultsKey): string {
  return `${key.week}|${key.dataIndex}|${key.speciesIndex}|${key.location.join(';')}`;
}

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
    setAndCacheFlowResults(state, action: PayloadAction<{data: FlowResultsPayload, key: FlowResultsKey}>) {
      const {data, key} = action.payload;
      const cacheKey = makeCacheKey(key);
      state.flowResultsCache[cacheKey] = data;
      state.flowResults = data.result;
      state.flowGeoTiffUrl = data.geotiff || "";
    },
    loadFlowResultsFromCache(state, action: PayloadAction<FlowResultsKey>) {
      const key = action.payload;
      const cacheKey = makeCacheKey(key);
      const cached = state.flowResultsCache[cacheKey];
      if (cached) {
        state.flowResults = cached.result;
        state.flowGeoTiffUrl = cached.geotiff || "";
      }
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
  setAndCacheFlowResults,
  loadFlowResultsFromCache,
  clearFlowResults,
  updateOverlayByWeek,
  toggleRecentOutbreaks,
  toggleHistoricOutbreaks,
} = mapSlice.actions;

export default mapSlice.reducer;