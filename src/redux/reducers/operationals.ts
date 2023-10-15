import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Operationals } from '../../types/State';

export const initialState = {
  newAccount: false,
};

const OperationalsSlice = createSlice({
  name: 'operationals',
  initialState,
  reducers: {
    changeOperationls: <T>(
      state: Operationals,
      { payload }: PayloadAction<T>,
    ) => (
      { ...state, ...payload }
    ),
  },
});

export const { changeOperationls } = OperationalsSlice.actions;

export default OperationalsSlice.reducer;
