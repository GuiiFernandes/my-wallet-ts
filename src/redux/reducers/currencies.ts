import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Currencies } from '../../types';
import { fetchAPI } from '../../services/fetchAPI';

const initialState: string[] = [];

const fetchCurrencies = createAsyncThunk(
  'currencies/fetchCurrencies',
  async ():Promise<Currencies> => {
    const data = await fetchAPI();
    return data;
  },
);

const CurrenciesSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(
      fetchCurrencies.fulfilled,
      (_state, { payload }: PayloadAction<Currencies>) => {
        const currencies = Object.keys(payload);
        return currencies;
      },
    );
  },
});

export default CurrenciesSlice.reducer;
