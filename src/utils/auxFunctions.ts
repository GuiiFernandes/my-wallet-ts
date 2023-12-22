import { InstallmentsTransType } from '../types/Others';

export const oneDay = 1000 * 60 * 60 * 24;

export const installmentsTransform: InstallmentsTransType = {
  Diariamente: oneDay,
  Semanalmente: oneDay * 7,
  Quinzenalmente: oneDay * 14,
  Mensalmente: oneDay * 30.44,
  Bimestralmente: oneDay * 60.88,
  Trimestralmente: oneDay * 91.32,
  Semestralmente: oneDay * 186.64,
  Anualmente: oneDay * 365.28,
};
