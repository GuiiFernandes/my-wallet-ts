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
      trans.id = super.generateId();
      const value = this.formatedInstalments[trans.installments]
        ? trans.value : super.calculateValue(i, transaction);
      const date = super.calculateNextDate(i, transaction);
      const payday = i === 0 || isFormatTransactions ? trans.payday : null;
      trans.period = trans.installments === 'U' ? '' : trans.period;
      const account = `${trans.account}>${trans.accountDestiny}`;
      const newData = { ...trans, category: '', subCategory: '' };
      transfers.push({ ...newData, value, date, payday: null, account });
      if (payday) {
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
    let result: any[] = [];
    if (this.installments === 'U') {
      // Se for uma transferência única
      [transfers, records] = this.formatTrans(1);
    } else if (this.installments === 'F') {
      // Se for uma transferência fixa
      const repetitions = super.calcIntervalMonthRepeat();
      if (repetitions > 1) {
        [transfers, records] = this.formatTrans(repetitions);
      } else {
        const [formatedTransfer, formatedRecords] = this.formatTrans(1);
        transfers = formatedTransfer;
        records = formatedRecords;
      }
    } else {
      // Se for uma transferência parcelada
      [transfers, records] = this.formatTrans();
    }
    const resultTransfer = await firebaseFuncs.update<TransactionKeys>(
      meta,
      [...transactions[meta.key], ...transfers],
    );
    if (records.length) {
      const [expense, revenue] = records;
      result = await Promise.all([
        await firebaseFuncs.update(
          { ...meta, key: 'records' },
          [...transactions.records, ...records],
        ),
        await firebaseFuncs.updateBalance(uid, accounts, [expense, revenue]),
      ]);
    }
    return [resultTransfer, ...result];
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
      return this.updateUniqueTransfer(transactions, meta, { uid, accounts });
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
    return [result[0], dataTransfers, result[1]];
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

  private async updateUniqueTransfer(
    transactions: TransactionsType,
    meta: MetaCreateInfos<TransactionKeys>,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const transCopy = { ...transactions };
    const filteredTransfers = transactions[meta.key]
      .filter(({ transactionId }) => transactionId !== this.transactionId);
    const filteredRecords = transactions.records
      .filter(({ transactionId }) => transactionId !== this.transactionId);
    transCopy[meta.key] = filteredTransfers;
    transCopy.records = filteredRecords;
    const day = new Date(`${this.date}T00:00`).getDate();
    const recordsTransfer = transactions.records
      .filter((transfer) => transfer.transactionId === this.transactionId
          && new Date(`${transfer.date}T00:00`).getDate() === day);
    const arrayNewBalance = super.createArrayBalance(recordsTransfer);
    const newAccounts = await firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance);
    if (!newAccounts) throw new Error('Erro ao atualizar o saldo');
    const result = await this.create(uid, transCopy, newAccounts.accounts);
    return result;
  }
}
