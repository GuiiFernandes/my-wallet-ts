import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import { add, addMonths, differenceInMonths, endOfMonth, format, isBefore,
  isSameMonth, startOfMonth } from 'date-fns';

import { StateRedux } from '../types/State';
import { InstallmentsTransType } from '../types/Others';
import { TransactionType } from '../types/Data';
import { installmentsTransform, objNextDate, oneDay } from '../utils/auxFunctions';

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

  const getAllTransactions = () => {
    const initialMonth = new Date(year, month - 1, 1, 0);
    const recorsByDate: TransactionType[] = getByDate(records, initialMonth, true);
    const fixedsByDate: TransactionType[] = getByDate(fixeds, initialMonth);
    const transfersByDate: TransactionType[] = getByDate(transfers, initialMonth);

    const setRecordsTransIdAndDate = new Set(recorsByDate
      .map(({ transactionId, date }) => `${transactionId}-${date.split('-')[2]}`));
    const setTransfersTransId = new Set(transfers
      .map(({ transactionId }) => transactionId));

    const transfersfiltered: TransactionType[] = transfersByDate
      .filter(({ installments, date }) => installments === 'F'
        || isSameMonth(new Date(date), initialMonth));
    const fixedFilterTransactions = fixedsByDate
      .filter(({ transactionId, date }) => !setRecordsTransIdAndDate
        .has(`${transactionId}-${date.split('-')[2]}`));
    const recordsFilterTransfers = recorsByDate
      .filter(({ transactionId }) => !setTransfersTransId.has(transactionId));
    const repeatFixedTransactions = fixedFilterTransactions
      .reduce((repeatFixeds, transaction) => {
        const repetitions = calculateRepetitions(transaction);
        const newFixeds: TransactionType[] = [...repeatFixeds];
        for (let i = 0; i < repetitions; i += 1) {
          const date = calculateNextDate(i, transaction);
          newFixeds.push({
            ...transaction,
            date,
            id: uuidv4(),
          });
        }
        return newFixeds;
      }, [] as TransactionType[]);

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

    return [...recordsFilterTransfers, ...repeatFixedTransactions, ...transferWithPayday]
      .sort((a: TransactionType, b: TransactionType) => {
        return Number(b.date.split('-')[2]) - Number(a.date.split('-')[2]);
      });
  };

  const calculateRepetitions = (
    transaction: TransactionType,
  ): number => {
    const day = Number(transaction.date.split('-')[2]);
    const recordsByFixeds = transactions.records
      .filter(({ transactionId }) => transactionId === transaction.transactionId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const initialDate = recordsByFixeds[0]?.date
      ? new Date(calculateNextDate(1, recordsByFixeds[0]))
      : new Date(`${transaction.date}T00:00`);
    const endDate = endOfMonth(new Date(year, month - 1, day, 0));
    return calcIntervalEditRepeat(endDate, initialDate, transaction.period);
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
    return format(nextDate, 'yyyy-MM-dd');
  };

  const calcIntervalEditRepeat = (
    endDate: Date,
    initialDate: Date,
    period: keyof InstallmentsTransType = 'Mensalmente',
  ): number => {
    const transFrequency = installmentsTransform[period];
    return Math.ceil((endDate.getTime() - initialDate.getTime()) / transFrequency);
  };

  return { getAllTransactions };
}
