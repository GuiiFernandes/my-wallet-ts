import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ConfigurationsType } from '../../types/Data';

const INITIAL_STATE = {
  categories: [],
  subCategories: [],
  currency: 'BRL',
};

const ConfigSlice = createSlice({
  name: 'configuration',
  initialState: INITIAL_STATE,
  reducers: {
    updateConfig: <T>(
      state: ConfigurationsType,
      { payload }: PayloadAction<T>,
    ) => ({ ...state, ...payload }),
  },
});

export const { updateConfig } = ConfigSlice.actions;

export default ConfigSlice.reducer;
