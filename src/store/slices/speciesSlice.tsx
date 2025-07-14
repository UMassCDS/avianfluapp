import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SpeciesState {
  dataIndex: number;
  speciesIndex: number;
}

const initialState: SpeciesState = {
  dataIndex: 0,
  speciesIndex: 0,
};

const speciesSlice = createSlice({
  name: 'species',
  initialState,
  reducers: {
    setDataIndex(state, action: PayloadAction<number>) {
      state.dataIndex = action.payload;
    },
    setSpeciesIndex(state, action: PayloadAction<number>) {
      state.speciesIndex = action.payload;
    },
    setBoth(state, action: PayloadAction<{ dataIndex: number; speciesIndex: number }>) {
      state.dataIndex = action.payload.dataIndex;
      state.speciesIndex = action.payload.speciesIndex;
    },
  },
});

export const { setDataIndex, setSpeciesIndex, setBoth } = speciesSlice.actions;
export default speciesSlice.reducer;
