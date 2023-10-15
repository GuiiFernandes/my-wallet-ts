import { combineReducers } from '@reduxjs/toolkit';

import user from './user';
import currencies from './currencies';
import data from './data';

export default combineReducers({
  user,
  currencies,
  data,
});
