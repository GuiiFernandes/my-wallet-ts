import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import { add, addMonths, differenceInMonths, endOfMonth, format, isBefore,
  isSameMonth, startOfMonth } from 'date-fns';

import { StateRedux } from '../types/State';
import { InstallmentsTransType } from '../types/Others';
import { TransactionType } from '../types/Data';
import { installmentsTransform, objNextDate, oneDay } from '../utils/auxFunctions';

const INSTALLMENTS_NAMES = ['Diariamente',
  '4x no mês',
  'Semanalmente',
  'Quinzenalmente'];
const FORMAT_DATE = 'yyyy-MM-dd';

export default function useTransaction() {
  const { transactions } = useSelector(({ data }: StateRedux) => data);
  const {
    monthSelected,
  } = useSelector(({ operationals }: StateRedux) => operationals);
  const { month, year } = monthSelected;
  const { fixeds, records, transfers } = transactions;

  const isValidPeriod = (
    [transDate, nowDate]: Date[],
    period: keyof InstallmentsTransType,
    createInMonth: boolean,
  ): boolean => {
    const periodInMonths = Math.round(installmentsTransform[period] / oneDay / 30.44);
    const difference = differenceInMonths(nowDate, transDate);
    if (difference % periodInMonths > 0) {
      return false;
    }
    if (createInMonth) {
      const targetTransDate = startOfMonth(addMonths(transDate, difference));
      const targetNowDate = endOfMonth(addMonths(transDate, difference));
      return nowDate >= targetTransDate && nowDate <= targetNowDate;
    }
    const targetNowDate = addMonths(nowDate, difference);
    return nowDate <= targetNowDate;
  };

  const getByDate = (
    trans: TransactionType[],
    initialMonth: Date,
    createInMonth: boolean = false,
  ) => trans.filter(({ date, installments, period }) => {
    const transDate = new Date(`${date}T00:00`);
    if (createInMonth) {
      return isSameMonth(transDate, initialMonth);
    }
    if (installments === 'F') {
      const dates = [transDate, initialMonth];
      return isValidPeriod(dates, period, createInMonth);
    }
    return isBefore(transDate, endOfMonth(initialMonth));
  });

  const datasByDate = () => {
    const initialMonth = new Date(year, month - 1, 1, 0);
    const recorsByDate: TransactionType[] = getByDate(records, initialMonth, true);
    const fixedsByDate: TransactionType[] = getByDate(fixeds, initialMonth);
    const transfersByDate: TransactionType[] = getByDate(transfers, initialMonth);
    return [recorsByDate, fixedsByDate, transfersByDate];
  };

  const dataSets = (
    recorsByDate: TransactionType[],
  ) => {
    const setRecords = new Set(recorsByDate
      .map(({ transactionId, date }) => `${transactionId}/${date.split('-')[2]}`));
    const setTransfers = new Set(transfers.map(({ transactionId }) => transactionId));
    return [setRecords, setTransfers];
  };

  const searchWeekDay = (transDate: Date): Date => {
    const keyOfWeek = transDate.getDay();
    let date = new Date(year, month - 1, 1, 0);

    while (date.getDay() !== keyOfWeek) {
      date = add(date, { days: 1 });
    }
    return date;
  };

  const createWeeklyFixeds = (transaction: TransactionType): TransactionType[] => {
    const transDate = new Date(`${transaction.date}T00:00`);
    let date = new Date(year, month - 1, 1, 0);
    const endMonth = endOfMonth(date);
    const newFixeds: TransactionType[] = [];
    date = searchWeekDay(transDate);
    while (date <= endMonth) {
      newFixeds.push({ ...transaction, date: format(date, FORMAT_DATE), id: uuidv4() });
      date = add(date, { days: 7 });
    }
    return newFixeds;
  };

  const repeatFixedsFilter = (
    repeatFixeds: TransactionType[],
    transaction: TransactionType,
  ) => {
    if (transaction.period === 'Semanalmente') {
      return createWeeklyFixeds(transaction);
    }
    const [, transMonth, day] = transaction.date.split('-')
      .map((number) => Number(number));
    const initialDate = transMonth === month
      ? new Date(year, month - 1, day, 0)
      : searchWeekDay(new Date(`${transaction.date}T00:00`));
    const transactionCorrectDate = {
      ...transaction, date: format(initialDate, FORMAT_DATE),
    };
    const repetitions = calculateRepetitions(transactionCorrectDate);
    const newFixeds: TransactionType[] = [...repeatFixeds];
    for (let i = 0; i < repetitions; i += 1) {
      const date = i === 0
        ? format(initialDate, FORMAT_DATE) : calculateNextDate(i, transactionCorrectDate);
      newFixeds.push({ ...transaction,
        date,
        id: uuidv4() });
    }
    return newFixeds;
  };

  const getAllTransactions = () => {
    const initialMonth = new Date(year, month - 1, 1, 0);
    const [recorsByDate, fixedsByDate, transfersByDate] = datasByDate();
    const [setRecords, setTransfers] = dataSets(recorsByDate);
    const transfersfiltered: TransactionType[] = transfersByDate
      .filter(({ installments, date }) => installments === 'F'
        || isSameMonth(new Date(date), initialMonth));
    const recordsFilterTransfers = recorsByDate
      .filter(({ transactionId }) => !setTransfers.has(transactionId));
    const repeatFixedTransactions = fixedsByDate
      .filter(({ period }) => new Set(INSTALLMENTS_NAMES).has(period))
      .reduce(repeatFixedsFilter, [] as TransactionType[]);
    const setRepeatFixeds = new Set(repeatFixedTransactions
      .map(({ transactionId }) => transactionId));
    const fixedFilterTransactions = fixedsByDate
      .filter(({ transactionId, date }) => !setRepeatFixeds
        .has(transactionId) && !setRecords.has(`${transactionId}/${date.split('-')[2]}`));
    const repeatFixedRecordFilter = repeatFixedTransactions
      .filter(({ transactionId, date }) => !setRecords
        .has(`${transactionId}/${date.split('-')[2]}`));
    const transferWithPayday = transfersfiltered.map((transfer) => {
      const record = recorsByDate
        .find(({ transactionId, date }) => (
          transfer.transactionId === transactionId && transfer.date === date
        ));
      if (record) {
        return { ...transfer, payday: record.payday, value: record.value };
      }
      return transfer;
    });
    return [...recordsFilterTransfers, ...repeatFixedRecordFilter,
      ...transferWithPayday, ...fixedFilterTransactions]
      .sort((a: TransactionType, b: TransactionType) => {
        return Number(b.date.split('-')[2]) - Number(a.date.split('-')[2]);
      });
  };

  const calculateNextDate = (
    i: number = 1,
    { period, date }: TransactionType,
  ): string => {
    const periodValid = period || 'Mensalmente';
    const nextDate = add(
      new Date(`${date}T00:00`),
      objNextDate(i)[periodValid],
    );
    return format(nextDate, FORMAT_DATE);
  };

  const calculateRepetitions = (
    transaction: TransactionType,
  ): number => {
    const { period, date } = transaction;
    const day = date.split('-')[2];
    const initialDate = new Date(year, month - 1, Number(day), 0);
    const endDate = endOfMonth(new Date(year, month - 1, Number(day), 0));
    const transFrequency = installmentsTransform[period || 'Mensalmente'];
    const frequency = (endDate.getTime() - initialDate.getTime()) / transFrequency;
    return Math.ceil(frequency);
  };

  return { getAllTransactions };
}
