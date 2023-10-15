import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Data } from '../../types/Data';
import { banksModel, budgetsModel, investmentsModel,
  transactionsModel } from '../../utils/dataModel';

export const initialState: Data = {
  banks: banksModel,
  budgets: budgetsModel,
  investments: investmentsModel,
  transactions: transactionsModel,
};

const DataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    updateData: (_state, { payload }: PayloadAction<Data>) => payload,
  },
});

export const { updateData } = DataSlice.actions;

export default DataSlice.reducer;
