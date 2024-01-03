import { AccountType, TransactionKeys,
  TransactionType, TransactionsType } from '../../types/Data';
import { FormTransaction } from '../../types/LocalStates';
import { YearAndMonth } from '../../types/Others';
import firebaseFuncs, { MetaCreateInfos } from '../../utils/firebaseFuncs';
import swal from '../../utils/swal';
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

  private formatTrans(repetitions?: number, editTrans: boolean = false): FormatedTrans {
    const newTransfers: TransactionType[] = [];
    const records: TransactionType[] = [];
    const periodRepetion = repetitions || Number(this.installments);
    for (let i = 0; i < periodRepetion; i += 1) {
      this.id = editTrans ? this.id : super.generateId();
      const value = this.formatedInstalments[this.installments]
        ? this.value : super.calculateValue(i);
      const date = super.calculateNextDate(i);
      this.period = this.installments === 'U' ? '' : this.period;
      const payday = i === 0 ? this.payday : null;
      const account = `${this.account}>${this.accountDestiny}`;
      const newData = { ...super.record, category: '', subCategory: '' };
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
  ): Promise<any> {
    const meta = super.createMeta<TransactionKeys>(uid);
    let [newTransfers, newTransactions]: FormatedTrans = [[], []];
    let result: any[] = [];
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
    const resultTransfer = await firebaseFuncs.update<TransactionKeys>(
      meta,
      [...transactions[meta.key], ...newTransfers],
    );
    if (newTransactions.length) {
      const [expense, revenue] = newTransactions;
      result = await Promise.all([
        await firebaseFuncs.update(
          { ...meta, key: 'records' },
          [...transactions.records, ...newTransactions],
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

  private async updateThisOnly(
    meta: MetaCreateInfos<TransactionKeys>,
    transactions: TransactionsType,
    { uid, accounts }: { uid: string, accounts: AccountType[] },
  ) {
    const t = 'T00:00';
    const transferRecords = transactions.records
      .filter(({ transactionId, date }) => transactionId === this.transactionId
      && new Date(`${date}${t}`).getDate() === new Date(`${this.date}${t}`).getDate());
    let newTransferRecords: TransactionType[] = [];
    let newData: TransactionType[] = [];

    if (transferRecords.length) {
      const editedTransferRecords = transferRecords.map(({
        type, installment, installments, id, transactionId,
      }, index) => {
        if (index === 0) {
          return { ...this.record, type, installment, installments, id, transactionId };
        }
        return {
          ...this.record,
          type,
          installment,
          installments,
          id,
          transactionId,
          account: this.accountDestiny,
        };
      });
      const [data, , nextData] = super
        .editFinRecords(transactions.records, editedTransferRecords, 'id');
      newData = data;
      newTransferRecords = nextData;
    } else {
      newTransferRecords = [
        { ...this.record, type: 'Despesa' },
        { ...this.record,
          account: this.accountDestiny,
          id: super.generateId(),
          type: 'Receita' },
      ];
    }
    const arrayNewBalance = super
      .createArrayBalance(transferRecords, newTransferRecords);
    return Promise.all([
      firebaseFuncs.update(
        { ...meta, key: 'records' },
        newData.length ? newData
          : [...transactions.records, ...newTransferRecords],
      ),
      arrayNewBalance.length
        ? firebaseFuncs.updateBalance(uid, accounts, arrayNewBalance)
        : null,
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
