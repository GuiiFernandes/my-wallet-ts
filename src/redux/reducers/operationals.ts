import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Operationals } from '../../types/State';

const date = new Date();
const monthLocale = date.toLocaleDateString('pt-BR', { month: 'long' });
const monthString = `${monthLocale[0].toLocaleUpperCase()}${monthLocale.substring(1)}`;

export const initialState = {
  newAccount: false,
  changeAccount: false,
  newTransaction: false,
  monthSelected: {
    monthString,
    month: date.getMonth() + 1,
  },
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
