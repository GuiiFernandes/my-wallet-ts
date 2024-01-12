import { format } from 'date-fns';
import { AccountType, TransactionKeys,
  TransactionType, TransactionsType } from '../../types/Data';
import { FormTransaction } from '../../types/LocalStates';
import { YearAndMonth } from '../../types/Others';
import firebaseFuncs, { MetaCreateInfos } from '../../utils/firebaseFuncs';
import swal from '../../utils/swal';
import Transaction from './Transaction';

type FormatedTrans = [TransactionType[], TransactionType[]];
const T = 'T00:00';

export default class Transfer extends Transaction {
  accountDestiny: string;

  private formatedInstalments: { [key: string]: string } = {
    F: 'F',
    U: 'U',
  };

  constructor(form: FormTransaction) {
    super(form);
    this.accountDestiny = form.accountDestiny;
  }

  private formatTrans(
    repetitions?: number,
    transaction?: FormTransaction,
    isFormatTransactions = false,
  ): FormatedTrans {
    const transfers: TransactionType[] = [];
    const records: TransactionType[] = [];
    const periodRepetion = repetitions || Number(this.installments);
    const trans: FormTransaction = transaction
      ? { ...transaction }
      : { ...super.transaction, accountDestiny: this.accountDestiny };
    for (let i = 0; i < periodRepetion; i += 1) {
      trans.id = periodRepetion > 1 ? super.generateId() : this.id;
      const value = this.formatedInstalments[trans.installments]
        ? trans.value : super.calculateValue(i, transaction);
      const date = super.calculateNextDate(i, transaction);
      const payday = i === 0 || isFormatTransactions ? trans.payday : null;
      trans.period = trans.installments === 'U' ? '' : trans.period;
      const account = `${trans.account}>${trans.accountDestiny}`;
      const newData: TransactionType
      & { accountDestiny?: string } = { ...trans, category: '', subCategory: '' };
      delete newData.accountDestiny;
      transfers.push({ ...newData, value, date, payday: null, account });
      if (payday || isFormatTransactions) {
        records.push({ ...newData, value, payday, date, type: 'Despesa' });
        records.push({ ...newData,
          id: super.generateId(),
          payday,
          value,
          date,
          account: trans.accountDestiny,
          type: 'Receita' });
      }
      trans.installment += 1;
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

  async edit(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
    yearAndMonth: YearAndMonth,
  ): Promise<any> {
    const meta = super.createMeta<TransactionKeys>(uid);
    if (this.installments === 'U') {
      const [transfers, records] = this.formatTrans(1);
      const [dataTransfer, prevTransfer, newTransfer] = super
        .editFinRecords(transactions[meta.key], transfers, 'id');
      const result: any[] = [];
      if (newTransfer !== prevTransfer) {
        result.push(await firebaseFuncs.update<TransactionKeys>(
          meta,
          dataTransfer,
        ));
        if (records.length) {
          const [dataRecords, prevRecord, newRecord] = super
            .editFinRecords(transactions.records, records);
          const arrayNewBalance = super.createArrayBalance(prevRecord, newRecord);
          result.push(await Promise.all([
            await firebaseFuncs.update({ ...meta, key: 'records' }, dataRecords),
            await firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance),
          ]));
        }
      }
      return result;
    }
    if (this.installments === 'F') {
      const { value } = await swal.upTrans();
      if (value === 'true') {
        return this
          .updateThisAndUpcomming(transactions, yearAndMonth, meta, { uid, accounts });
      }
      if (value === 'false') {
        return this.updateThisOnly(meta, transactions, { uid, accounts });
      }
    }
    return null;
  }

  private async updateThisAndUpcomming(
    transactions: TransactionsType,
    { year, month }: YearAndMonth,
    meta: MetaCreateInfos<TransactionKeys>,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const [repetitions, initialDate, fixedTransfers] = super
      .calculateRepetitions(transactions, year, month, meta.key);
    const [account, accountDestiny] = fixedTransfers[0].account.split('>');
    const [, newRecords] = this.formatTrans(repetitions, { ...fixedTransfers[0],
      account,
      accountDestiny,
      date: format(initialDate, 'yyyy-MM-dd') }, true);
    const newTransfers: TransactionType[] = fixedTransfers
      .map((transfer) => ({ ...this.transaction,
        date: transfer.date,
        id: transfer.id,
        installment: transfer.installment,
        account: `${this.transaction.account}>${this.accountDestiny}`,
        payday: null }));
    const [formatedTransfers] = super
      .editFinRecords(transactions[meta.key], newTransfers, 'id');
    const [dataRecords, dataTransfers] = await Promise.all([
      firebaseFuncs.update(
        { ...meta, key: 'records' },
        [...transactions.records, ...newRecords],
      ),
      firebaseFuncs.update(meta, formatedTransfers),
    ]);
    let result: TransactionType[] = [];
    if (this.payday) {
      result = await this.updateThisOnly(
        meta,
        dataRecords,
        { uid,
          accounts },
      );
    }
    return [result[0], dataTransfers, result];
  }

  private async updateThisOnly(
    meta: MetaCreateInfos<TransactionKeys>,
    transactions: TransactionsType,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const transferRecords = transactions.records
      .filter(({ transactionId, date }) => transactionId === this.transactionId
      && new Date(`${date}${T}`).getDate() === new Date(`${this.date}${T}`).getDate());
    let [newTransfers, newData]: [TransactionType[], TransactionType[]] = [[], []];

    if (transferRecords.length) {
      const editedTransferRecords = transferRecords.map(({
        type, installment, installments, id, transactionId,
      }, index) => {
        if (index === 0) {
          return { ...this.transaction,
            type,
            installment,
            installments,
            id,
            transactionId };
        }
        return { ...this.transaction,
          type,
          installment,
          installments,
          id,
          transactionId,
          account: this.accountDestiny };
      });
      const [data, , nextData] = super
        .editFinRecords(transactions.records, editedTransferRecords, 'id');
      newData = data;
      newTransfers = nextData;
    } else {
      newTransfers = [
        { ...this.transaction, type: 'Despesa' },
        { ...this.transaction,
          account: this.accountDestiny,
          id: super.generateId(),
          type: 'Receita' },
      ];
    }
    const arrayNewBalance = super
      .createArrayBalance(transferRecords, newTransfers);
    return Promise.all([
      firebaseFuncs.update({ ...meta, key: 'records' }, newData.length
        ? newData : [...transactions.records, ...newTransfers]),
      arrayNewBalance.length
        ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
    ]);
  }
}
