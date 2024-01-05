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

type ObjNextDate = {
  [key in string]: { [key2 in string]: number }
};

export const objNextDate = (i: number): ObjNextDate => {
  return {
    Diariamente: { days: 1 * i },
    Semanalmente: { weeks: 1 * i },
    Quinzenalmente: { weeks: 2 * i },
    Mensalmente: { months: 1 * i },
    Bimestralmente: { months: 2 * i },
    Trimestralmente: { months: 3 * i },
    Semestralmente: { months: 6 * i },
    Anualmente: { years: 1 * i },
  };
};
