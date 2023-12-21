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
      const objTrans: TransactionType = {
        ...super.record,
        id: i === 0 ? this.id : super.generateId(),
        value: this.formatedInstalments[this.installments]
          ? this.value : super.calculateValue(i),
        type: 'Despesa',
        date: super.calculateNextDate(i),
        period: this.formatedInstalments[this.installments] ? '' : this.period,
        installments: this.formatedInstalments[this.installments]
        || `${this.installment}/${this.installments}`,
      };
      newTransfers.push({
        ...objTrans,
        account: `${this.account}>${this.accountDestiny}`,
        type: 'Transferência',
      });
      newTransactions.push(objTrans);
      this.installment += 1;
    }
    const againstTransactions: TransactionType[] = newTransfers.map((transfer) => ({
      ...transfer,
      account: this.accountDestiny,
      type: 'Receita',
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
