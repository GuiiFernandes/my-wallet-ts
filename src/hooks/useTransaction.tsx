import { useSelector } from 'react-redux';
import { addMonths, differenceInMonths, endOfMonth, isBefore,
  isSameMonth, startOfMonth } from 'date-fns';
import { StateRedux } from '../types/State';
import { InstallmentsTransType } from '../types/Others';
import { TransactionType } from '../types/Data';
import { installmentsTransform, oneDay } from '../utils/auxFunctions';

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

    return [...recordsFilterTransfers, ...fixedFilterTransactions, ...transferWithPayday]
      .sort((a: TransactionType, b: TransactionType) => {
        return Number(b.date.split('-')[2]) - Number(a.date.split('-')[2]);
      });
  };

  return { getAllTransactions };
}
