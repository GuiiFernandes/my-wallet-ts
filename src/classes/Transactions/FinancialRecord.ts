import { v4 as uuidv4 } from 'uuid';

import { KeyByType, Period, TransactionType,
  TransactionsType, TypesTransaction } from '../../types/Data';
import { InstallmentsTransType } from '../../types/Others';
import { MetaCreateInfos } from '../../utils/firebaseFuncs';

export default abstract class FinancialRecord {
  id: string;

  transactionId: string;

  account: string;

  date: string;

  description: string;

  payday: string | null = null;

  value: number;

  category: string;

  subCategory: string;

  installment: number;

  installments: string;

  period: Period;

  type: TypesTransaction;

  private oneDay = 1000 * 60 * 60 * 24;

  installmentsTransform: InstallmentsTransType = {
    Diariamente: this.oneDay,
    Semanalmente: this.oneDay * 7,
    Quinzenalmente: this.oneDay * 14,
    Mensalmente: this.oneDay * 30.44,
    Bimestralmente: this.oneDay * 60.88,
    Trimestralmente: this.oneDay * 91.32,
    Semestralmente: this.oneDay * 186.64,
    Anualmente: this.oneDay * 365.28,
  };

  private keyByInstalments: KeyByType = {
    U: 'records',
    F: 'fixeds',
    t: 'transfers',
  };

  constructor(form: Omit<TransactionType, 'id'>) {
    this.account = form.account;
    this.date = form.date;
    this.description = form.description;
    this.value = form.value;
    this.period = form.period;
    this.installment = 1;
    this.category = form.category || '';
    this.subCategory = form.subCategory || '';
    this.type = form.type;
    this.id = this.generateId();
    this.transactionId = form.transactionId || this.generateId();
    this.installments = form.installments;
  }

  protected createMeta(uid: string): MetaCreateInfos {
    const keyForKey = this.type === 'Transferência' ? 't' : this.installments;
    return {
      uid,
      docName: 'transactions',
      key: this.keyByInstalments[keyForKey] || 'records',
    };
  }

  protected calcIntervalMonthRepeat(): number {
    const monthInterval = this.installmentsTransform.Mensalmente;
    const transFrequency = this.installmentsTransform[this.period];
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
    const periodNumber = Math.floor(this.installmentsTransform[periodValid]);
    const nextDate = new Date(this.date).getTime() + (periodNumber * i);
    return new Date(nextDate).toISOString().slice(0, 10);
  }

  protected generateId(id?: string): string {
    return id || uuidv4();
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
    prevData: TransactionsType,
  ): Promise<void>;
  // abstract update(): void;
  // abstract remove(): void;
  // abstract changeStatus(): void;
  // abstract listOne(): void;
  // abstract listAll(): void;
}
