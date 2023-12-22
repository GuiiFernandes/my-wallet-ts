import { AccountType, TransactionKeys,
  TransactionType, TransactionsType } from '../../types/Data';
import firebaseFuncs from '../../utils/firebaseFuncs';
import FinancialRecord from './FinancialRecord';

export default class Transaction extends FinancialRecord {
  private formatTrans(repetitions?: number) {
    const newTransactions: TransactionType[] = [];
    const periodRepetion = repetitions || Number(this.installments);
    for (let i = 0; i < periodRepetion; i += 1) {
      this.id = i === 0 ? this.id : super.generateId();
      const value = this.installments === 'F' ? this.value : super.calculateValue(i);
      const date = super.calculateNextDate(i);
      const payday = i === 0 && this.installments !== 'F' ? this.payday : null;
      this.period = this.installments === 'U' ? '' : this.period;
      newTransactions.push({ ...super.record, payday, value, date });
      this.installment += 1;
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
      await Promise.all([firebaseFuncs.create(
        meta,
        [...transactions[meta.key], newTransaction],
      ),
      firebaseFuncs.updateBalance(uid, accounts, [newTransaction])]);
    } else if (this.installments === 'F') {
      // Se for uma receita fixa
      const repetitions = super.calcIntervalMonthRepeat();
      if (repetitions > 1) {
        const newTransactions = this.formatTrans(repetitions);
        await firebaseFuncs.create(
          meta,
          [transactions[meta.key], ...newTransactions],
        );
        if (this.payday) {
          await Promise.all([firebaseFuncs.create(
            { ...meta, key: 'records' },
            [...transactions.records, { ...newTransactions[0], payday: this.payday }],
          ),
          firebaseFuncs.updateBalance(uid, accounts, [newTransactions[0]])]);
        }
      } else {
        await firebaseFuncs.create(meta, [
          ...transactions[meta.key],
          { ...super.record, payday: null },
        ]);
        if (this.payday) {
          const newTransaction = super.record;
          await Promise.all([firebaseFuncs.create(
            { ...meta, key: 'records' },
            [...transactions[meta.key], newTransaction],
          ),
          firebaseFuncs.updateBalance(uid, accounts, [newTransaction])]);
        }
      }
    } else {
      // Se for uma receita parcelada
      const newTransactions = this.formatTrans();
      await Promise.all([await firebaseFuncs.create(
        meta,
        [...transactions[meta.key], ...newTransactions],
      ),
      firebaseFuncs.updateBalance(uid, accounts, [newTransactions[0]])]);
    }
  }
}
