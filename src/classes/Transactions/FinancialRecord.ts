import { v4 as uuidv4 } from 'uuid';
import { add, format } from 'date-fns';

import { AccountType, KeyByType, Period, TransactionType,
  TransactionsType, TypesTransaction } from '../../types/Data';
import { MetaCreateInfos } from '../../utils/firebaseFuncs';
import { installmentsTransform } from '../../utils/auxFunctions';
import { FormTransaction } from '../../types/LocalStates';
import { YearAndMonth } from '../../types/Others';

export default abstract class FinancialRecord {
  id: string;

  transactionId: string;

  account: string;

  date: string;

  description: string;

  payday: string | null;

  value: number;

  category: string;

  subCategory: string;

  installment: number;

  installments: string;

  period: Period;

  type: TypesTransaction;

  objNextDate(i: number): { [key in string]: { [key2 in string]: number } } {
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
  }

  private keyByInstalments: KeyByType = {
    U: 'records',
    F: 'fixeds',
    t: 'transfers',
  };

  constructor(form: FormTransaction) {
    this.account = form.account;
    this.date = form.date;
    this.description = form.description;
    this.value = form.value;
    this.period = form.period;
    this.payday = form.payday;
    this.installment = form.installment;
    this.category = form.category || '';
    this.subCategory = form.subCategory || '';
    this.type = form.type;
    this.id = form.id || this.generateId();
    this.transactionId = form.transactionId || this.generateId();
    this.installments = form.installments;
  }

  protected createMeta<T>(uid: string): MetaCreateInfos<T> {
    const keyForKey = this.type === 'Transferência' ? 't' : this.installments;
    return {
      uid,
      docName: 'transactions',
      key: (this.keyByInstalments[keyForKey] || 'records') as T,
    };
  }

  protected calcIntervalMonthRepeat(): number {
    const monthInterval = installmentsTransform.Mensalmente;
    const transFrequency = installmentsTransform[this.period];
    return Math.floor(monthInterval / transFrequency);
  }

  protected calcIntervalEditRepeat(
    endDate: Date,
    initialDate: Date,
  ): number {
    const transFrequency = installmentsTransform[this.period];
    return Math.floor((endDate.getTime() - initialDate.getTime()) / transFrequency);
  }

  protected calculateValue(
    i: number = 1,
    transaction?: TransactionType,
  ) {
    const trans = transaction || this.record;
    const numInstallments = Number(trans.installments);
    const baseValue = Math.floor((trans.value / numInstallments) * 100) / 100;
    const totalBase = baseValue * numInstallments;
    const restValue = (trans.value - totalBase) * 100;
    return i < restValue - 1 ? baseValue + 0.01 : baseValue;
  }

  protected calculateNextDate(
    i: number = 1,
    transaction?: TransactionType,
  ): string {
    const trans = transaction || this.record;
    const periodValid = trans.period || 'Mensalmente';
    const nextDate = add(
      new Date(`${trans.date}T00:00`),
      this.objNextDate(i)[periodValid],
    );
    return format(nextDate, 'yyyy-MM-dd');
  }

  protected generateId(id?: string): string {
    return id || uuidv4();
  }

  protected editFinRecords(
    transactions: TransactionType[],
    editedRecord?: TransactionType[],
    key: keyof TransactionType = 'transactionId',
  ): [TransactionType[], TransactionType[], TransactionType[]] {
    const newRecord = editedRecord || [this.record];
    const data = [...transactions];
    const prevRecords: TransactionType[] = [];
    const nextRecords: TransactionType[] = [];
    console.log(transactions);
    console.log(newRecord);
    newRecord.forEach((record) => {
      const index = transactions
        .findIndex((trans) => trans[key] === record[key]);
      if (index === -1) throw new Error('Record not found');
      data[index] = record;
      prevRecords.push(transactions[index]);
      nextRecords.push(record);
    });
    return [data, prevRecords, nextRecords];
  }

  protected createArrayBalance(
    prevRecord: TransactionType[],
    newRecord: TransactionType[],
  ) {
    const arrayNewBalance: TransactionType[] = [];
    prevRecord.forEach((record) => {
      if (record.payday) {
        arrayNewBalance.push({ ...record, value: -record.value });
      }
    });
    newRecord.forEach((record) => {
      if (record.payday) {
        arrayNewBalance.push(record);
      }
    });
    return arrayNewBalance;
  }

  get record(): TransactionType {
    return {
      id: this.id,
      account: this.account,
      date: this.date,
      description: this.description,
      payday: this.payday,
      value: this.value,
      category: this.category,
      subCategory: this.subCategory,
      installment: this.installment,
      installments: this.installments,
      period: this.period,
      type: this.type,
      transactionId: this.transactionId,
    };
  }

  abstract create(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
  ): Promise<void>;
  abstract edit(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
    yearAndMonth: YearAndMonth,
  ): Promise<any>;
  // abstract remove(): void;
  // abstract changeStatus(): void;
}
