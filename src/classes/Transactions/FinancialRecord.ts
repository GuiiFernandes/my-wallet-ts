import { v4 as uuidv4 } from 'uuid';
import { add, format } from 'date-fns';

import { AccountType, KeyByType, Period, TransactionType,
  TransactionsType, TypesTransaction } from '../../types/Data';
import { MetaCreateInfos } from '../../utils/firebaseFuncs';
import { installmentsTransform } from '../../utils/auxFunctions';
import { FormTransaction } from '../../types/LocalStates';

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

  objNextDate(i: number) {
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
    this.installment = 1;
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

  protected calculateValue(
    i: number = 1,
  ) {
    const numInstallments = Number(this.installments);
    const baseValue = Math.floor((this.value / numInstallments) * 100) / 100;
    const totalBase = baseValue * numInstallments;
    const restValue = (this.value - totalBase) * 100;
    return i < restValue - 1 ? baseValue + 0.01 : baseValue;
  }

  protected calculateNextDate(
    i: number = 1,
  ): string {
    const periodValid = this.period || 'Mensalmente';
    const nextDate = add(
      new Date(`${this.date}T00:00`),
      this.objNextDate(i)[periodValid],
    );
    return format(nextDate, 'yyyy-MM-dd');
  }

  protected generateId(id?: string): string {
    return id || uuidv4();
  }

  protected editRecords(
    transactions: TransactionType[],
    editedRecord?: TransactionType,
  ): [TransactionType[], TransactionType, TransactionType] | null {
    const index = transactions.findIndex(({ id }) => id === this.id);
    if (index === -1) return null;
    const prevDataCopy = [...transactions];
    prevDataCopy[index] = editedRecord || this.record;
    return [prevDataCopy, transactions[index], prevDataCopy[index]];
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
  ): Promise<void>;
  // abstract remove(): void;
  // abstract changeStatus(): void;
}
