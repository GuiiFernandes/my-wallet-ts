import { format } from 'date-fns';
import { AccountType, TransactionKeys,
  TransactionType, TransactionsType } from '../../types/Data';
import firebaseFuncs, { MetaCreateInfos } from '../../utils/firebaseFuncs';
import { swalUpTrans } from '../../utils/swal';
import FinancialRecord from './FinancialRecord';
import { ParamupdateAllWithPayday } from '../../types/Others';

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
  ): Promise<void> {
    const meta = super.createMeta<TransactionKeys>(uid);
    if (this.installments === 'U') {
      // Se for uma receita única
      this.period = '';
      const newTransaction = super.record;
      await Promise.all([firebaseFuncs.update(
        meta,
        [...transactions[meta.key], newTransaction],
      ),
      firebaseFuncs.updateBalance(uid, accounts, [newTransaction])]);
    } else if (this.installments === 'F') {
      // Se for uma receita fixa
      const repetitions = super.calcIntervalMonthRepeat();
      if (repetitions > 1) {
        const newTransactions = this.formatTrans(repetitions);
        await firebaseFuncs.update(
          meta,
          [transactions[meta.key], ...newTransactions],
        );
        if (this.payday) {
          await Promise.all([firebaseFuncs.update(
            { ...meta, key: 'records' },
            [...transactions.records, { ...newTransactions[0], payday: this.payday }],
          ),
          firebaseFuncs.updateBalance(uid, accounts, [newTransactions[0]])]);
        }
      } else {
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
      }
    } else {
      // Se for uma receita parcelada
      const newTransactions = this.formatTrans();
      await Promise.all([await firebaseFuncs.update(
        meta,
        [...transactions[meta.key], ...newTransactions],
      ),
      firebaseFuncs.updateBalance(uid, accounts, [newTransactions[0]])]);
    }
  }

  async edit(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
    date: Date,
  ): Promise<boolean> {
    const meta = super.createMeta<TransactionKeys>(uid);
    if (this.installments === 'U') {
      const result = super.editFinRecords(transactions[meta.key]);
      if (!result) throw new Error('Record not found');
      const [newData, prevRecord, newRecord] = result;
      const arrayNewBalance = this.createArrayBalance(prevRecord, newRecord);
      await Promise.all([
        firebaseFuncs.update(meta, newData),
        arrayNewBalance.length
          ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
      ]);
      return true;
    }
    if (this.installments === 'F') {
      return this.editFixed({ uid, meta }, transactions, accounts, date);
    }
    return false;
  }

  private async editFixed(
    { uid, meta }: { uid: string, meta: MetaCreateInfos<TransactionKeys> },
    transactions: TransactionsType,
    accounts: AccountType[],
    date: Date,
  ): Promise<boolean> {
    const { value } = await swalUpTrans();
    if (value === 'true') {
      await this.updateThisAndUpcomming(transactions, date, meta, { uid, accounts });
      return true;
    }
    if (value === 'false') {
      await this.updateThisOnly(meta, transactions, accounts, { uid, date });
      return true;
    }
    return false;
  }

  private async updateThisAndUpcomming(
    transactions: TransactionsType,
    date: Date,
    meta: MetaCreateInfos<TransactionKeys>,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const recordsByFixeds = transactions.records
      .filter(({ transactionId }) => transactionId === this.transactionId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const fixedTrans = transactions
      .fixeds.find(({ transactionId }) => transactionId === this.transactionId);
    if (!fixedTrans) throw new Error('Fixed transaction not found');
    const initialDate = recordsByFixeds[0].date
      ? new Date(this.calculateNextDate(1, recordsByFixeds[0]))
      : new Date(fixedTrans.date);
    const repetitions = super.calcIntervalEditRepeat(recordsByFixeds, date, initialDate);
    const newTransactions = this.formatTrans(
      repetitions,
      { ...fixedTrans, date: format(initialDate, 'yyyy-MM-dd') },
    );
    const newFixed = { ...this.record,
      date: fixedTrans.date,
      payday: null,
      id: fixedTrans.id };
    const result = super.editFinRecords(transactions[meta.key], newFixed);
    if (!result) throw new Error('Record not found');
    const [newData] = result;
    const [data] = await Promise.all([
      firebaseFuncs.update(
        { ...meta, key: 'records' },
        [...transactions.records, ...newTransactions],
      ),
      firebaseFuncs.update(meta, newData),
    ]);
    if (this.payday) {
      await this.updateAllWithPayday({
        data,
        uid,
        date,
        accounts,
        meta,
      });
    }
  }

  private async updateAllWithPayday({
    data,
    uid,
    date,
    accounts,
    meta,
  }: ParamupdateAllWithPayday) {
    await this.updateThisOnly(meta, data, accounts, { uid, date });
  }

  private async updateThisOnly(
    meta: MetaCreateInfos<TransactionKeys>,
    transactions: TransactionsType,
    accounts: AccountType[],
    { uid, date }: { uid: string, date: Date },
  ) {
    const validMeta = { ...meta, key: 'records' };
    const result = super.editFinRecords(transactions.records, undefined, 'id');
    if (result) {
      const [newData, prevRecord, newRecord] = result;
      const arrayNewBalance = this.createArrayBalance(prevRecord, newRecord);
      await Promise.all([
        firebaseFuncs.update(validMeta, newData),
        arrayNewBalance.length
          ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
      ]);
    } else {
      const newTransaction = { ...super.record,
        id: super.generateId(),
        date: format(new Date(
          date.getFullYear(),
          date.getMonth(),
          Number(super.record.date.split('-')[2]),
        ), 'yyyy-MM-dd') };
      await Promise.all([
        firebaseFuncs.update(validMeta, [...transactions.records, newTransaction]),
        firebaseFuncs.updateBalance(uid, accounts, [newTransaction]),
      ]);
    }
  }

  private createArrayBalance(
    prevRecord: TransactionType,
    newRecord: TransactionType,
  ) {
    const arrayNewBalance: TransactionType[] = [];
    if (prevRecord.payday) {
      arrayNewBalance.push({ ...prevRecord, value: -prevRecord.value });
    }
    if (newRecord.payday) {
      arrayNewBalance.push(newRecord);
    }
    return arrayNewBalance;
  }
}
