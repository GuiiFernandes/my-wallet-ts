import { combineReducers } from '@reduxjs/toolkit';

import user from './user';
import currencies from './currencies';
import data from './data';
import operationals from './operationals';
import configurations from './configurations';

export default combineReducers({
  user,
  currencies,
  data,
  configurations,
  operationals,
});
