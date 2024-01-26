import { format } from 'date-fns';
import { AccountType, TransactionKeys,
  TransactionType, TransactionsType } from '../../types/Data';
import firebaseFuncs, { MetaCreateInfos } from '../../utils/firebaseFuncs';
import swal from '../../utils/swal';
import TransferCreate from './TransferCreate';

export default class Transfer extends TransferCreate {
  async edit(
    uid: string,
    transactions: TransactionsType,
    accounts: AccountType[],
  ): Promise<any> {
    const meta = this.createMeta<TransactionKeys>(uid);
    if (this.installments === 'U') {
      return this.updateUnique(meta, transactions, { uid, accounts });
    }
    if (this.installments === 'F') {
      const { value } = await swal.upTrans();
      if (value === 'true') {
        return this
          .updateThisAndUpcomming(transactions, meta, { uid, accounts });
      }
      if (value === 'false') {
        return this.updateThisOnly(meta, transactions, { uid, accounts });
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
    meta: MetaCreateInfos<TransactionKeys>,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const includeThisRecord = this.payday ? 1 : 0;
    const [repetitions, initialDate] = this
      .calculateRepetitions(transactions, meta.key, includeThisRecord);
    const { account, accountDestiny } = this;
    const fixedTransfer = { ...this.transaction,
      date: format(initialDate, 'yyyy-MM-dd') };
    const newRecords: TransactionType[] = [];
    for (let i = 0; i < repetitions; i += 1) {
      newRecords.push({ ...fixedTransfer,
        date: super.calculateNextDate(i, fixedTransfer, false),
        type: 'Despesa',
        payday: i === repetitions - 1 ? this.payday : fixedTransfer.payday,
        account });
      newRecords.push({ ...fixedTransfer,
        date: super.calculateNextDate(i, fixedTransfer, false),
        account: accountDestiny,
        payday: i === repetitions - 1 ? this.payday : fixedTransfer.payday,
        type: 'Receita' });
    }
    const [formatedTransfers] = this.editFinRecords(
      transactions[meta.key],
      [{ ...fixedTransfer, account: `${account}>${accountDestiny}` }],
      'id',
    );
    const [formatedRecords, prevRecord, newRecord] = this.editFinRecords(
      transactions.records,
      newRecords,
      'id',
    );

    const arrayNewBalance = this.createArrayBalance(prevRecord, newRecord);
    return Promise.all([
      firebaseFuncs.update(meta, formatedTransfers),
      firebaseFuncs.update(
        { ...meta, key: 'records' },
        formatedRecords,
      ),
      arrayNewBalance.length
        ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance) : null,
    ]);
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
  ) {
    const { records } = transactions;
    const [account, accountDestiny] = [this.account, this.accountDestiny];
    const [,transferRecords] = this
      .formatTrans(1, [{ ...this.transaction, account, accountDestiny }], true);
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
