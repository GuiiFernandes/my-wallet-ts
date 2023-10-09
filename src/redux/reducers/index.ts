import { combineReducers } from '@reduxjs/toolkit';

import user from './user';
import currencies from './currencies';

export default combineReducers({
  user,
  currencies,
});
