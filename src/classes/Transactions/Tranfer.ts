import { AccountType, TransactionKeys,
  TransactionType, TransactionsType } from '../../types/Data';
import { FormTransaction } from '../../types/LocalStates';
import { YearAndMonth } from '../../types/Others';
import firebaseFuncs from '../../utils/firebaseFuncs';
import FinancialRecord from './FinancialRecord';

type FormatedTrans = [TransactionType[], TransactionType[]];

export default class Transfer extends FinancialRecord {
  accountDestiny: string;

  private formatedInstalments: { [key: string]: string } = {
    F: 'F',
    U: 'U',
  };

  constructor(form: FormTransaction) {
    super(form);
    this.accountDestiny = form.accountDestiny;
  }

  private formatTrans(repetitions?: number): FormatedTrans {
    const newTransfers: TransactionType[] = [];
    const records: TransactionType[] = [];
    const periodRepetion = repetitions || Number(this.installments);
    for (let i = 0; i < periodRepetion; i += 1) {
      this.id = super.generateId();
      const value = this.formatedInstalments[this.installments]
        ? this.value : super.calculateValue(i);
      const date = super.calculateNextDate(i);
      this.period = this.installments === 'U' ? '' : this.period;
      const payday = i === 0 ? this.payday : null;
      const account = `${this.account}>${this.accountDestiny}`;
      const newData = super.record;
      newTransfers.push({ ...newData, value, date, payday: null, account });
      if (payday) {
        records.push({
          ...newData, value, payday, date, type: 'Despesa',
        });
        records.push({
          ...newData,
          id: super.generateId(),
          payday,
          value,
          date,
          account: this.accountDestiny,
          type: 'Receita',
        });
      }
      this.installment += 1;
    }

    return [newTransfers, records];
  }

  async create(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
  ): Promise<void> {
    const meta = super.createMeta<TransactionKeys>(uid);
    let [newTransfers, newTransactions]: FormatedTrans = [[], []];
    if (this.installments === 'U') {
      // Se for uma transferência única
      [newTransfers, newTransactions] = this.formatTrans(1);
    } else if (this.installments === 'F') {
      // Se for uma transferência fixa
      const repetitions = super.calcIntervalMonthRepeat();
      if (repetitions > 1) {
        [newTransfers, newTransactions] = this.formatTrans(repetitions);
      } else {
        const [formatedTransfer, formatedTransactions] = this.formatTrans(1);
        newTransfers = formatedTransfer;
        newTransactions = formatedTransactions;
      }
    } else {
      // Se for uma transferência parcelada
      [newTransfers, newTransactions] = this.formatTrans();
    }
    await firebaseFuncs.update<TransactionKeys>(
      meta,
      [...transactions[meta.key], ...newTransfers],
    );
    if (newTransactions.length) {
      const [expense, revenue] = newTransactions;
      await Promise.all([
        await firebaseFuncs.update(
          { ...meta, key: 'records' },
          [...transactions.records, ...newTransactions],
        ),
        await firebaseFuncs.updateBalance(uid, accounts, [expense, revenue]),
      ]);
    }
  }

  async edit(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
    yearAndMonth: YearAndMonth,
  ): Promise<any> {
    const meta = super.createMeta<TransactionKeys>(uid);
    if (this.installments === 'U') {
      // Se for uma transferência única
      const [formatedTransfers, formatedRecords] = this.formatTrans(1);
      const [newTransfers] = super
        .editFinRecords(transactions[meta.key], formatedTransfers, 'id');
      console.log(formatedTransfers);
      console.log(formatedRecords);
      const [newRecords, prevRecords, nextRecords] = super
        .editFinRecords(transactions.records, formatedRecords, 'id');
      const arrayNewBalance = this.createArrayBalance(prevRecords, nextRecords);
      await Promise.all([
        firebaseFuncs.update(meta, newTransfers),
        firebaseFuncs.update({ ...meta, key: 'records' }, newRecords),
        firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance),
      ]);
      return [newTransfers, newRecords, arrayNewBalance];
    }
    return null;
  }
}
