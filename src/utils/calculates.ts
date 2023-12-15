type InstallmentsTransType = {
  Diariamente: number;
  Semanalmente: number;
  Quinzenalmente: number;
  Mensalmente: number;
  Bimestralmente: number;
  Trimestralmente: number;
  Semestralmente: number;
  Anualmente: number;
  [key: string]: number;
};

const oneDay = 1000 * 60 * 60 * 24;

const installmentsTransform: InstallmentsTransType = {
  Diariamente: oneDay,
  Semanalmente: oneDay * 7,
  Quinzenalmente: oneDay * 14,
  Mensalmente: oneDay * 30,
  Bimestralmente: oneDay * 60,
  Trimestralmente: oneDay * 90,
  Semestralmente: oneDay * 180,
  Anualmente: oneDay * 365,
};

export const calculateNextDate = (
  date: string,
  period: keyof InstallmentsTransType,
  i: number = 1,
) => {
  const periodNumber = installmentsTransform[period];
  const nextDate = new Date(date).getTime() + (periodNumber * i);
  return new Date(nextDate).toISOString().slice(0, 10);
};

export const calculateValue = (
  installments: number,
  value: number,
  i: number = 1,
) => {
  const baseValue = Math.floor((value / installments) * 100) / 100;
  const totalBase = baseValue * installments;
  const restValue = (value - totalBase) * 100;
  return i < restValue - 1 ? baseValue + 0.01 : baseValue;
};
