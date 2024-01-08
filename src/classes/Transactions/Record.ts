import { format } from 'date-fns';
import { AccountType, TransactionKeys,
  TransactionType, TransactionsType } from '../../types/Data';
import firebaseFuncs, { MetaCreateInfos } from '../../utils/firebaseFuncs';
import swal from '../../utils/swal';
import Transaction from './Transaction';
import { YearAndMonth } from '../../types/Others';

export default class Record extends Transaction {
  private formatTrans(
    repetitions?: number,
    transaction?: TransactionType,
  ): TransactionType[] {
    const newTransactions: TransactionType[] = [];
    const periodRepetion = repetitions || Number(this.installments);
    const trans: TransactionType = transaction
      ? { ...transaction } : { ...super.transaction };

    for (let i = 0; i < periodRepetion; i += 1) {
      trans.id = super.generateId();
      const value = trans.installments === 'F'
        ? trans.value : super.calculateValue(i, transaction);
      const date = super.calculateNextDate(i, transaction);
      const payday = i === 0 && trans.installments !== 'F' ? trans.payday : null;
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
      const newTransaction = super.transaction;
      return Promise.all([firebaseFuncs.update(
        meta,
        [...transactions[meta.key], newTransaction],
      ),
      newTransaction.payday
        ? firebaseFuncs.updateBalance(uid, accounts, [newTransaction]) : null]);
    } if (this.installments === 'F') {
      const result: any[] = [];
      result.push(await firebaseFuncs.update(meta, [
        ...transactions[meta.key],
        { ...super.transaction, payday: null },
      ]));
      if (this.payday) {
        const newTransaction = super.transaction;
        result.push(await Promise.all([firebaseFuncs.update(
          { ...meta, key: 'records' },
          [...transactions[meta.key], newTransaction],
        ),
        firebaseFuncs.updateBalance(uid, accounts, [newTransaction])]));
      }
      return result;
    }
    const newTransactions = this.formatTrans();
    return Promise.all([await firebaseFuncs.update(
      meta,
      [...transactions[meta.key], ...newTransactions],
    ),
    newTransactions[0].payday
      ? firebaseFuncs.updateBalance(uid, accounts, newTransactions) : null]);
  }

  async edit(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
    yearAndMonth: YearAndMonth,
  ): Promise<any> {
    const { records } = transactions;
    const meta = super.createMeta<TransactionKeys>(uid);
    if (this.installments === 'U') {
      const [newData, prevRecord, newRecord] = super
        .editFinRecords(transactions[meta.key]);
      const arrayNewBalance = super.createArrayBalance(prevRecord, newRecord);
      return Promise.all([
        firebaseFuncs.update(meta, newData),
        arrayNewBalance.length
          ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
      ]);
    }
    if (this.installments === 'F') {
      const { value } = await swal.upTrans();
      if (value === 'true') {
        return this
          .updateThisAndUpcomming(transactions, yearAndMonth, meta, { uid, accounts });
      }
      if (value === 'false') {
        return this.updateThisOnly(meta, records, yearAndMonth, { uid, accounts });
      }
    } else {
      return this.updateInstallments(records, yearAndMonth, meta, { uid, accounts });
    }
    return null;
  }

  private async updateInstallments(
    transactions: TransactionType[],
    yearAndMonth: YearAndMonth,
    meta: MetaCreateInfos<TransactionKeys>,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const { value } = await swal.upTrans();
    if (value === 'true') {
      const filteredTrans = transactions
        .filter(({ transactionId, date }) => transactionId === this.transactionId
          && date >= this.date);
      const editedTrans = filteredTrans
        .map(({ type, installment, installments, id, transactionId, date }, index) => ({
          ...this.transaction,
          type,
          installment,
          installments,
          id,
          transactionId,
          date,
          payday: index === 0 ? this.payday : null,
        }));
      const [data, prevRecord, newRecord] = super
        .editFinRecords(transactions, editedTrans, 'id');
      const arrayNewBalance = super.createArrayBalance(prevRecord, newRecord);
      return Promise.all([
        firebaseFuncs.update({ ...meta, key: 'records' }, data),
        arrayNewBalance.length
          ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
      ]);
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
    const [repetitions, initialDate, fixedTrans] = super
      .calculateRepetitions(transactions, year, month, meta.key);
    const newTransactions = this.formatTrans(
      repetitions,
      { ...fixedTrans[0], date: format(initialDate, 'yyyy-MM-dd') },
    );
    const newFixeds = fixedTrans.map((fixed) => ({
      ...this.transaction,
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
    transactions: TransactionType[],
    { year, month }: YearAndMonth,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const validMeta = { ...meta, key: 'records' };
    const result = super.editFinRecords(transactions, undefined, 'id');
    if (result) {
      const [newData, prevRecord, newRecord] = result;
      const arrayNewBalance = super.createArrayBalance(prevRecord, newRecord);
      return Promise.all([
        firebaseFuncs.update(validMeta, newData),
        arrayNewBalance.length
          ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
      ]);
    }
    const day = Number(super.transaction.date.split('-')[2]);
    const newDate = new Date(`${year}-${month}-${day}T00:00`);
    const newTransaction = { ...super.transaction,
      id: super.generateId(),
      date: format(newDate, 'yyyy-MM-dd') };
    return Promise.all([
      firebaseFuncs.update(validMeta, [...transactions, newTransaction]),
      firebaseFuncs.updateBalance(uid, accounts, [newTransaction]),
    ]);
  }
}
