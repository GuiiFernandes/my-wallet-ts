import { combineReducers } from '@reduxjs/toolkit';

import user from './user';
import currencies from './currencies';
import data from './data';
import operationals from './operationals';

export default combineReducers({
  user,
  currencies,
  data,
  operationals,
});
