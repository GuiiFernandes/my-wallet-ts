import { TransactionType, TransactionsType } from '../../types/Data';
import { FormWithoutId } from '../../types/LocalStates';
import firebaseFuncs from '../../utils/firebaseFuncs';
import FinancialRecord from './FinancialRecord';

type FormatedTrans = [TransactionType[], TransactionType[]];

export default class Transfer extends FinancialRecord {
  accountDestiny: string;

  private formatedInstalments: { [key: string]: string } = {
    F: 'F',
    U: 'U',
  };

  constructor(form: FormWithoutId & { accountDestiny: string }) {
    super(form);
    this.accountDestiny = form.accountDestiny;
  }

  private formatTrans(repetitions?: number): FormatedTrans {
    const newTransfers: TransactionType[] = [];
    const newTransactions: TransactionType[] = [];
    const periodRepetion = repetitions || Number(this.installments);
    for (let i = 0; i < periodRepetion; i += 1) {
      this.id = i === 0 ? this.id : super.generateId();
      this.value = this.formatedInstalments[this.installments]
        ? this.value : super.calculateValue(i);
      this.date = super.calculateNextDate(i);
      this.payday = i === 0 ? this.payday : null;
      this.period = this.installments === 'U' ? '' : this.period;
      newTransfers.push({
        ...super.record,
        account: `${this.account}>${this.accountDestiny}`,
      });
      newTransactions.push(super.record);
      this.installment += 1;
    }
    const againstTransactions: TransactionType[] = newTransfers.map((transfer) => ({
      ...transfer,
      account: this.accountDestiny,
    }));
    return [newTransfers, [...newTransactions, ...againstTransactions]];
  }

  async create(
    uid: string,
    prevData: TransactionsType,
  ): Promise<void> {
    const meta = super.createMeta(uid);

    if (this.installments === 'U') {
      // Se for uma transferência única
      const [newTransfers, newTransactions] = this.formatTrans(1);
      const result = await firebaseFuncs.bulkCreate(meta, prevData, newTransfers);
      await firebaseFuncs.bulkCreate(
        { ...meta, key: 'records' },
        result,
        newTransactions,
      );
    } else if (this.installments === 'F') {
      // Se for uma transferência fixa
      const repetitions = super.calcIntervalMonthRepeat();
      if (repetitions > 1) {
        const [newTransfers] = this.formatTrans(repetitions);
        await firebaseFuncs.bulkCreate(meta, prevData, newTransfers);
      } else {
        const [newTransfers, newTransactions] = this.formatTrans(1);
        const result = await firebaseFuncs.bulkCreate(meta, prevData, newTransfers);
        await firebaseFuncs.bulkCreate(
          { ...meta, key: 'records' },
          result,
          newTransactions,
        );
      }
    } else {
      // Se for uma transferência parcelada
      const [newTransfers, newTransactions] = this.formatTrans();
      const result = await firebaseFuncs.bulkCreate(meta, prevData, newTransfers);
      await firebaseFuncs.bulkCreate(
        { ...meta, key: 'records' },
        result,
        newTransactions,
      );
    }
  }
}
