import { format } from 'date-fns';
import { AccountType, TransactionKeys,
  TransactionType, TransactionsType } from '../../types/Data';
import firebaseFuncs, { MetaCreateInfos } from '../../utils/firebaseFuncs';
import { swalUpTrans } from '../../utils/swal';
import FinancialRecord from './FinancialRecord';
import { YearAndMonth } from '../../types/Others';

const DATE_FORMAT = 'yyyy-MM-dd';

export default class Transaction extends FinancialRecord {
  private formatTrans(repetitions?: number, transaction?: TransactionType) {
    const newTransactions: TransactionType[] = [];
    const periodRepetion = repetitions || Number(this.installments);
    const trans: TransactionType = transaction ? { ...transaction } : { ...super.record };

    for (let i = 0; i < periodRepetion; i += 1) {
      trans.id = super.generateId();
      const value = trans.installments === 'F'
        ? trans.value : super.calculateValue(i, transaction);
      const date = super.calculateNextDate(i, transaction);
      const payday = i === 0 && trans.installments !== 'F'
        ? trans.payday : null;
      trans.period = trans.installments === 'U' ? '' : trans.period;
      newTransactions.push({ ...trans, payday, value, date });
      trans.installment += 1;
    }
    return newTransactions;
  }

  async create(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
  ): Promise<any> {
    const meta = super.createMeta<TransactionKeys>(uid);
    if (this.installments === 'U') {
      this.period = '';
      const newTransaction = super.record;
      return Promise.all([firebaseFuncs.update(
        meta,
        [...transactions[meta.key], newTransaction],
      ),
      firebaseFuncs.updateBalance(uid, accounts, [newTransaction])]);
    } if (this.installments === 'F') {
      const repetitions = super.calcIntervalMonthRepeat();
      if (repetitions > 1) {
        const newTransactions = this.formatTrans(repetitions);
        await firebaseFuncs.update(
          meta,
          [...transactions[meta.key], ...newTransactions],
        );
        if (this.payday) {
          await Promise.all([firebaseFuncs.update(
            { ...meta, key: 'records' },
            [...transactions.records, { ...newTransactions[0], payday: this.payday }],
          ),
          firebaseFuncs.updateBalance(uid, accounts, [newTransactions[0]])]);
        }
        return [newTransactions, []];
      }
      await firebaseFuncs.update(meta, [
        ...transactions[meta.key],
        { ...super.record, payday: null },
      ]);
      if (this.payday) {
        const newTransaction = super.record;
        await Promise.all([firebaseFuncs.update(
          { ...meta, key: 'records' },
          [...transactions[meta.key], newTransaction],
        ),
        firebaseFuncs.updateBalance(uid, accounts, [newTransaction])]);
      }
      return [{ ...super.record, payday: null }, super.record];
    }
    const newTransactions = this.formatTrans();
    return Promise.all([await firebaseFuncs.update(
      meta,
      [...transactions[meta.key], ...newTransactions],
    ),
    firebaseFuncs.updateBalance(uid, accounts, [newTransactions[0]])]);
  }

  async edit(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
    yearAndMonth: YearAndMonth,
  ): Promise<any> {
    const meta = super.createMeta<TransactionKeys>(uid);
    if (this.installments === 'U') {
      const [newData, prevRecord, newRecord] = super
        .editFinRecords(transactions[meta.key]);
      const arrayNewBalance = super.createArrayBalance(prevRecord, newRecord);
      await Promise.all([
        firebaseFuncs.update(meta, newData),
        arrayNewBalance.length
          ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
      ]);
      return [newData, arrayNewBalance];
    }
    if (this.installments === 'F') {
      const { value } = await swalUpTrans();
      if (value === 'true') {
        return this
          .updateThisAndUpcomming(transactions, yearAndMonth, meta, { uid, accounts });
      }
      if (value === 'false') {
        return this.updateThisOnly(meta, transactions, yearAndMonth, { uid, accounts });
      }
    } else {
      return this.updateInstallments(transactions, yearAndMonth, meta, { uid, accounts });
    }
    return null;
  }

  private async updateInstallments(
    transactions: TransactionsType,
    yearAndMonth: YearAndMonth,
    meta: MetaCreateInfos<TransactionKeys>,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const { value } = await swalUpTrans();
    if (value === 'true') {
      const filteredTrans = transactions.records
        .filter(({ transactionId, date }) => transactionId === this.transactionId
          && date >= this.date);
      const editedTrans = filteredTrans
        .map(({ type, installment, installments, id, transactionId, date }) => ({
          ...this.record, type, installment, installments, id, transactionId, date,
        }));
      const [data, prevRecord, newRecord] = super
        .editFinRecords(transactions.records, editedTrans, 'id');
      const arrayNewBalance = super.createArrayBalance(prevRecord, newRecord);
      await Promise.all([
        firebaseFuncs.update({ ...meta, key: 'records' }, data),
        arrayNewBalance.length
          ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
      ]);
      return [data, arrayNewBalance];
    }
    if (value === 'false') {
      return this.updateThisOnly(meta, transactions, yearAndMonth, { uid, accounts });
    }
    return null;
  }

  private async updateThisAndUpcomming(
    transactions: TransactionsType,
    { year, month }: YearAndMonth,
    meta: MetaCreateInfos<TransactionKeys>,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const day = Number(this.date.split('-')[2]);
    const recordsByFixeds = transactions.records
      .filter(({ transactionId }) => transactionId === this.transactionId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const fixedTrans = transactions.fixeds
      .filter(({ transactionId }) => transactionId === this.transactionId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (!fixedTrans.length) throw new Error('Fixed transaction not found');

    const initialDate = recordsByFixeds[0]?.date
      ? new Date(this.calculateNextDate(1, recordsByFixeds[0]))
      : new Date(`${fixedTrans[0].date}T00:00`);
    const endDate = new Date(year, month - 1, day, 0);
    const repetitions = super.calcIntervalEditRepeat(endDate, initialDate);
    const newTransactions = this.formatTrans(
      repetitions,
      { ...fixedTrans[0], date: format(initialDate, DATE_FORMAT) },
    );
    const newFixeds = fixedTrans.map((fixed) => ({
      ...this.record,
      date: fixed.date,
      payday: null,
      id: fixed.id,
    }));
    const [newData] = super.editFinRecords(transactions[meta.key], newFixeds, 'id');
    const [data] = await Promise.all([
      firebaseFuncs.update(
        { ...meta, key: 'records' },
        [...transactions.records, ...newTransactions],
      ),
      firebaseFuncs.update(meta, newData),
    ]);
    if (this.payday) {
      await this.updateThisOnly(
        meta,
        data,
        { year, month },
        { uid,
          accounts },
      );
    }
  }

  private async updateThisOnly(
    meta: MetaCreateInfos<TransactionKeys>,
    transactions: TransactionsType,
    { year, month }: YearAndMonth,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const validMeta = { ...meta, key: 'records' };
    const result = super.editFinRecords(transactions.records, undefined, 'id');
    if (result) {
      const [newData, prevRecord, newRecord] = result;
      const arrayNewBalance = super.createArrayBalance(prevRecord, newRecord);
      await Promise.all([
        firebaseFuncs.update(validMeta, newData),
        arrayNewBalance.length
          ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
      ]);
      return [newData, arrayNewBalance];
    }
    const day = Number(super.record.date.split('-')[2]);
    const newDate = new Date(`${year}-${month}-${day}T00:00`);
    const newTransaction = { ...super.record,
      id: super.generateId(),
      date: format(newDate, DATE_FORMAT) };
    await Promise.all([
      firebaseFuncs.update(validMeta, [...transactions.records, newTransaction]),
      firebaseFuncs.updateBalance(uid, accounts, [newTransaction]),
    ]);
    return [[newTransaction], []];
  }
}
