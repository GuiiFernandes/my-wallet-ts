import { TransactionType, TransactionsType } from '../../types/Data';
import firebaseFuncs from '../../utils/firebaseFuncs';
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
    const meta = super.createMeta(uid);
    if (this.installments === 'U') {
      // Se for uma receita única
      this.period = '';
      await firebaseFuncs.create(meta, prevData, super.record);
    } else if (this.installments === 'F') {
      // Se for uma receita fixa
      this.period = '';
      const repetitions = super.calcIntervalMonthRepeat();
      if (repetitions > 1) {
        const newTransactions = this.formatTrans(repetitions);
        await firebaseFuncs.bulkCreate(meta, prevData, newTransactions);
      } else {
        await firebaseFuncs.create(meta, prevData, super.record);
      }
    } else {
      // Se for uma receita parcelada
      const newTransactions = this.formatTrans();
      await firebaseFuncs.bulkCreate(meta, prevData, newTransactions);
    }
  }
}
