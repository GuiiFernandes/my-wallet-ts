import { format } from 'date-fns';
import { AccountType, TransactionKeys,
  TransactionType, TransactionsType } from '../../types/Data';
import { YearAndMonth } from '../../types/Others';
import firebaseFuncs, { MetaCreateInfos } from '../../utils/firebaseFuncs';
import swal from '../../utils/swal';
import TransferCreate from './TransferCreate';

export default class Transfer extends TransferCreate {
  async edit(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
    yearAndMonth: YearAndMonth,
  ): Promise<any> {
    const meta = this.createMeta<TransactionKeys>(uid);
    if (this.installments === 'U') {
      return this.updateUnique(meta, transactions, { uid, accounts });
    }
    if (this.installments === 'F') {
      const { value } = await swal.upTrans();
      if (value === 'true') {
        return this
          .updateThisAndUpcomming(transactions, yearAndMonth, meta, { uid, accounts });
      }
      if (value === 'false') {
        return this.updateThisOnly(meta, transactions, { uid, accounts }, yearAndMonth);
      }
    }
    const { value } = await swal.upTrans();
    if (value === 'true') {
      return this
        .updateInstThisAndUpComming(transactions, meta, { uid, accounts });
    }
    if (value === 'false') {
      return this.updateUnique(meta, transactions, { uid, accounts }, true);
    }
  }

  private async updateThisAndUpcomming(
    transactions: TransactionsType,
    yearAndMonth: YearAndMonth,
    meta: MetaCreateInfos<TransactionKeys>,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const { year, month } = yearAndMonth;
    const [repetitions, initialDate, fixedTransfer] = this
      .calculateRepetitions(transactions, year, month, meta.key);
    const [account, accountDestiny] = fixedTransfer.account.split('>');
    const [, newRecords] = this.formatTrans(repetitions, [{ ...fixedTransfer,
      account,
      accountDestiny,
      date: format(initialDate, 'yyyy-MM-dd') }], true);
    const newTransfers: TransactionType = { ...fixedTransfer,
      date: fixedTransfer.date,
      id: fixedTransfer.id,
      installment: fixedTransfer.installment,
      account: `${this.transaction.account}>${this.accountDestiny}`,
      payday: null };
    const [formatedTransfers] = this
      .editFinRecords(transactions[meta.key], [newTransfers], 'id');
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
        yearAndMonth,
      );
    }
    if (!result.length) result.unshift(dataRecords);
    result.unshift(dataTransfers);
    return result;
  }

  private async updateInstThisAndUpComming(
    transactions: TransactionsType,
    meta: MetaCreateInfos<TransactionKeys>,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const { transfers, records } = transactions;
    const transfersToEdit = transfers
      .filter(({ transactionId }) => transactionId === this.transactionId)
      .sort((a, b) => a.installment - b.installment)
      .splice(this.installment - 1)
      .map(({ type, installment, installments, id, transactionId, date }, index) => ({
        ...this.transaction,
        type,
        installment,
        installments,
        id,
        accountDestiny: this.accountDestiny,
        transactionId,
        date,
        payday: index === 0 ? this.payday : null,
      }));
    const [formatTransfers, formatRecords] = this
      .formatTrans(transfersToEdit.length, transfersToEdit, true);
    const [dataTransfers] = this
      .editFinRecords(transfers, formatTransfers, 'id');
    const [dataRecords, prevRecords, newRecords] = this
      .editFinRecords(records, formatRecords, 'id');
    const arrayNewBalance = this.createArrayBalance(prevRecords, newRecords);
    return Promise.all([
      firebaseFuncs.update(meta, dataTransfers),
      firebaseFuncs.update({ ...meta, key: 'records' }, dataRecords),
      arrayNewBalance.length
        ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
    ]);
  }

  private async updateThisOnly(
    meta: MetaCreateInfos<TransactionKeys>,
    transactions: TransactionsType,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
    yearAndMonth: YearAndMonth,
  ) {
    const { year, month } = yearAndMonth;
    const date = format(
      new Date(year, month - 1, Number(this.date.split('-')[2]), 0),
      'yyyy-MM-dd',
    );

    const { records } = transactions;
    const [account, accountDestiny] = [this.account, this.accountDestiny];
    const [,transferRecords] = this
      .formatTrans(1, [{ ...this.transaction, account, accountDestiny, date }], true);
    const [dataRecords, prevRecords, newRecords] = this
      .editFinRecords(records, transferRecords, 'id');
    const arrayNewBalance = this
      .createArrayBalance(prevRecords, newRecords);
    return Promise.all([
      transactions.transfers,
      firebaseFuncs.update({ ...meta, key: 'records' }, dataRecords),
      arrayNewBalance.length
        ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
    ]);
  }

  private async updateUnique(
    meta: MetaCreateInfos<TransactionKeys>,
    transactions: TransactionsType,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
    isEditIntallments = false,
  ) {
    const [transfers, records] = this.formatTrans(1, undefined, isEditIntallments);
    const [dataTransfer, prevTransfer, newTransfer] = this
      .editFinRecords(transactions[meta.key], transfers, 'id');
    const result: any[] = [];
    if (newTransfer !== prevTransfer) {
      result.push(await firebaseFuncs.update<TransactionKeys>(
        meta,
        dataTransfer,
      ));
      if (records.length) {
        const [dataRecords, prevRecord, newRecord] = this
          .editFinRecords(transactions.records, records);
        const arrayNewBalance = this.createArrayBalance(prevRecord, newRecord);
        result.push(await Promise.all([
          await firebaseFuncs.update({ ...meta, key: 'records' }, dataRecords),
          arrayNewBalance.length
            ? await firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
        ]));
      }
    }
    return result;
  }
}
