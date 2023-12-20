import { TransactionType, TransactionsType } from '../../types/Data';
import firebase from '../../utils/firebaseFuncs';
import FinancialRecord from './FinancialRecord';

export default class Transaction extends FinancialRecord {
  private formatTrans(repetitions?: number) {
    const newTransactions: TransactionType[] = [];
    const periodRepetion = repetitions || Number(this.installments);
    for (let i = 0; i < periodRepetion; i += 1) {
      newTransactions.push({
        ...super.record,
        id: i === 0 ? this.id : super.generateId(),
        value: this.installments === 'F' ? this.value : super.calculateValue(i),
        date: super.calculateNextDate(i),
        installments: this.installments === 'F'
          ? 'F' : `${this.installment}/${this.installments}`,
      });
      this.installment += 1;
    }
    return newTransactions;
  }

  async create(
    uid: string,
    prevData: TransactionsType,
  ): Promise<void> {
    if (this.installments === 'U') {
      // Se for uma receita única
      const meta = this.createMeta(uid);
      await firebase.create(meta, prevData, super.record);
    } else if (this.installments === 'F') {
      // Se for uma receita fixa
      const meta = super.createMeta(uid);
      const repetitions = super.calcIntervalMonthRepeat();
      if (repetitions > 1) {
        const newTransactions = this.formatTrans(repetitions);
        await firebase.bulkCreate(meta, prevData, newTransactions);
      } else {
        await firebase.create(meta, prevData, super.record);
      }
    } else {
      // Se for uma receita parcelada
      const meta = super.createMeta(uid);
      const newTransactions = this.formatTrans();
      await firebase.bulkCreate(meta, prevData, newTransactions);
    }
  }
}
