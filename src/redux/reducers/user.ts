import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { User } from '../../types';

const initialState: User = {
  uid: '',
  email: '',
  displayName: '',
  phoneNumber: null,
  photoURL: '',
};

const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    saveUser: (_state, { payload }: PayloadAction<User>) => payload,
    deleteUser: () => initialState,
  },
});

export const { saveUser, deleteUser } = UserSlice.actions;

export default UserSlice.reducer;
