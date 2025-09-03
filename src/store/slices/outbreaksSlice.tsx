import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { monthDayToWeek } from '../../utils/utils';

export type OutbreakType = 'poultry' | 'bovine' | 'wild_birds';

interface OutbreaksState {
  [type: string]: {
    data: any[];
    loading: boolean;
    error: string | null;
  };
}

const BASE_URL = 'https://avianinfluenza.s3.us-east-2.amazonaws.com';


function processOutbreakMarkers( rawData: any[], outbreakType: OutbreakType) {
  const thisYear = new Date().getFullYear();
  return rawData.map(outbreak => {
    const [yearStr, monthStr, dayStr] = outbreak.Confirmed.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    return {
      year,
      yearsAgo: thisYear - year,
      week: monthDayToWeek(month, day),
      geoLoc: [outbreak.GeoLoc[0], outbreak.GeoLoc[1]],
      label: `${outbreak.Confirmed}: ${outbreak.Production}${outbreak.NumInfected ? ` (${outbreak.NumInfected})` : ''}`,
    };
  });
}


export const fetchOutbreaks = createAsyncThunk(
  'outbreaks/fetchOutbreaks',
  async (type: OutbreakType) => {
    const url = `${BASE_URL}/outbreaks/${type}.json`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch');
    return { type, data: await resp.json() };
  }
);

const initialState: OutbreaksState = {};

const outbreaksSlice = createSlice({
  name: 'outbreaks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOutbreaks.pending, (state, action) => {
        const type = action.meta.arg;
        state[type] = { data: [], loading: true, error: null };
      })
      .addCase(fetchOutbreaks.fulfilled, (state, action) => {
        const { type, data } = action.payload;
        state[type] = {
          data: processOutbreakMarkers(data, type),
          loading: false,
          error: null,
        };
      })
      .addCase(fetchOutbreaks.rejected, (state, action) => {
        const type = action.meta.arg;
        state[type] = { data: [], loading: false, error: action.error.message || 'Error' };
      });
  },
});

export default outbreaksSlice.reducer;


