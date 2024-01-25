import Transaction from './Transaction';
import { AccountType, TransactionKeys,
  TransactionType, TransactionsType } from '../../types/Data';
import { FormTransaction } from '../../types/LocalStates';
import firebaseFuncs from '../../utils/firebaseFuncs';

type FormatedTrans = [TransactionType[], TransactionType[]];

export default abstract class TransferCreate extends Transaction {
  accountDestiny: string;

  constructor(form: FormTransaction) {
    super(form);
    this.accountDestiny = form.accountDestiny;
  }

  private defineValues(
    { i, isFormatTrans }: { i: number, isFormatTrans: boolean },
    transForm: FormTransaction,
    periodRepetion: number,
    transaction?: TransactionType,
  ) {
    if (!isFormatTrans) transForm.id = periodRepetion > 1 ? super.generateId() : this.id;
    const value = super.calculateValue(i, transaction, isFormatTrans);
    const date = super.calculateNextDate(i, transaction, isFormatTrans);
    const payday = i === 0 || isFormatTrans ? transForm.payday : null;
    const period = transForm.installments === 'U' ? '' : transForm.period;
    const account = `${transForm.account}>${transForm.accountDestiny}`;
    const installment = isFormatTrans ? transForm.installment : transForm.installment + i;
    const newData: TransactionType
    & { accountDestiny?: string } = { ...transForm, category: '', subCategory: '' };
    delete newData.accountDestiny;
    return { ...newData, value, date, payday, account, period, installment };
  }

  protected formatTrans(
    repetitions?: number,
    transactions?: FormTransaction[],
    isFormatTrans = false,
  ): FormatedTrans {
    const transfers: TransactionType[] = [];
    const records: TransactionType[] = [];
    const periodRepetion = repetitions || transactions?.length
      || Number(this.installments);
    for (let i = 0; i < periodRepetion; i += 1) {
      const transForm: FormTransaction = transactions && transactions[i]
        ? { ...transactions[i] }
        : { ...super.transaction, accountDestiny: this.accountDestiny };
      const transDefine = transactions && transactions[i];
      const newData = this
        .defineValues({ i, isFormatTrans }, transForm, periodRepetion, transDefine);
      transfers.push({ ...newData, payday: null });
      if (newData.payday || isFormatTrans) {
        const [account, accountDestiny] = newData.account.split('>');
        records.push({ ...newData,
          id: super.generateId(),
          type: 'Despesa',
          account });
        records.push({ ...newData,
          id: super.generateId(),
          account: accountDestiny,
          type: 'Receita' });
      }
    }
    return [transfers, records];
  }

  async create(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
  ): Promise<any> {
    const meta = super.createMeta<TransactionKeys>(uid);
    let [transfers, records]: FormatedTrans = [[], []];
    const result: any[] = [];
    if (this.installments === 'U' || this.installments === 'F') {
      [transfers, records] = this.formatTrans(1);
    } else {
      [transfers, records] = this.formatTrans();
    }
    result.push(await firebaseFuncs.update<TransactionKeys>(
      meta,
      [...transactions[meta.key], ...transfers],
    ));
    if (records.length) {
      const [expense, revenue] = records;
      result.push(await Promise.all([
        await firebaseFuncs.update(
          { ...meta, key: 'records' },
          [...transactions.records, ...records],
        ),
        await firebaseFuncs.updateBalance(uid, accounts, [expense, revenue]),
      ]));
    }
    return result;
  }
}
