import { vi } from 'vitest';
import * as uuid from 'uuid';

import { SweetAlertResult } from 'sweetalert2';
import mocksData from '../mocks/data';
import { Transfer } from '../../classes/Transactions';
import swal from '../../utils/swal';
import { AccountType, TransactionType } from '../../types/Data';

const PAYDAY = '2024-01-06';

beforeEach(() => {
  const upDoc = vi.hoisted(() => {
    return {
      updateDoc: vi.fn(),
    };
  });

  vi.mock('firebase/firestore', async (importOriginal) => {
    const mod = await importOriginal<typeof import('firebase/firestore')>();
    return {
      ...mod,
      updateDoc: upDoc.updateDoc,
    };
  });
  vi.mock('firebase/analytics', async (importOriginal) => {
    const mod = await importOriginal<typeof import('firebase/firestore')>();
    return {
      ...mod,
      updateDoc: upDoc.updateDoc,
    };
  });
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe('Única', () => {
  it('Edita corretamente sem payday', async () => {
    const expectTransfers: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.transfers));
    expectTransfers[0].value = 50;

    const transaction = new Transfer({
      ...mocksData.transactionsEditRecords.transfers[0],
      value: 50,
      account: 'Carteira',
      accountDestiny: 'PicPay',
    });
    const result = await transaction.edit(
      'uid',
      mocksData.transactionsEditRecords,
      mocksData.accounts,
      { year: 2024, month: 1 },
    );
    const [{ transfers }, ...others] = result;
    expect(transfers).toEqual(expectTransfers);
    expect(others).toEqual([]);
  });
  it('Edita corretamente com payday', async () => {
    vi.spyOn(uuid, 'v4')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7');
    const expectTransfers: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.transfers));
    expectTransfers[0].value = 50;
    const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
    for (let index = 0; index < 2; index += 1) {
      expectRecords.push({
        ...mocksData.transactionsEditRecords.transfers[0],
        id: index === 0
        ? '760e0d03-6cf9-4ae0-9800-cf75cc222670'
        : '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7',
        type: index === 0 ? 'Despesa' : 'Receita',
        account: index === 0 ? 'Carteira' : 'PicPay',
        payday: PAYDAY,
        value: 50,
      });
    }
    const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
    expectAccounts[1].balance = 50;
    expectAccounts[2].balance = 150;

    const transaction = new Transfer({
      ...mocksData.transactionsEditRecords.transfers[0],
      value: 50,
      payday: PAYDAY,
      account: 'Carteira',
      accountDestiny: 'PicPay',
    });
    const result = await transaction.edit(
      'uid',
      mocksData.transactionsEditRecords,
      mocksData.accounts,
      { year: 2024, month: 1 },
    );
    const [{ transfers }, [{ records }, { accounts }]] = result;
    expect(transfers).toEqual(expectTransfers);
    expect(records).toEqual(expectRecords);
    expect(accounts).toEqual(expectAccounts);
  });
});