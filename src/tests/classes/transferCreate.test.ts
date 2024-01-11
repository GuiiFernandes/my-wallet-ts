import { vi } from 'vitest';
import * as uuid from 'uuid';

import mocksTransfer from '../mocks/transfers';
import mocksData from '../mocks/data';
import { Transfer } from '../../classes/Transactions';
import { AccountType, TransactionType } from '../../types/Data';

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

const PAYDAY = '2024-01-06';

describe('Única', () => {
  it('Cria corretamente sem payday', async () => {
    vi.spyOn(uuid, 'v4')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
      .mockReturnValueOnce('8a803c3e-e6a6-42c8-8bfa-6c04fa391c71');
    const expectTransfers: TransactionType[] = [{
      ...mocksTransfer.transferUnique,
      transactionId: '8a803c3e-e6a6-42c8-8bfa-6c04fa391c71',
    }];

    const transaction = new Transfer(mocksTransfer.formUnique);
    const result = await transaction.create(
      'uid',
      mocksData.transactionsRecords,
      mocksData.accounts,
    );    

    const [{ transfers }, ...others] = result;
    expect(transfers).toEqual(expectTransfers);
    expect(others).toEqual([]);
  });
  it('Cria corretamente com payday', async () => {
    vi.spyOn(uuid, 'v4')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
      .mockReturnValueOnce('8a803c3e-e6a6-42c8-8bfa-6c04fa391c71')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6');
    const expectTransfers: TransactionType[] = [{
      ...mocksTransfer.transferUnique,
      transactionId: '8a803c3e-e6a6-42c8-8bfa-6c04fa391c71',
    }];
    const expectRecords: TransactionType[] = [];
    for (let i = 0; i < 2; i += 1) {
      expectRecords.push({
        ...mocksTransfer.transferUnique,
        transactionId: '8a803c3e-e6a6-42c8-8bfa-6c04fa391c71',
        id: i === 0 ? mocksTransfer.transferUnique.id : '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
        type: i === 0 ? 'Despesa' : 'Receita',
        account: i === 0 ? 'Carteira' : 'PicPay',
        payday: PAYDAY,
      });
    }
    const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
    expectAccounts[1].balance = 80;
    expectAccounts[2].balance = 120;

    const transaction = new Transfer({
      ...mocksTransfer.formUnique,
      payday: '2024-01-06',
    });
    const result = await transaction.create(
      'uid',
      mocksData.transactionsRecords,
      mocksData.accounts,
    );

    const [{ transfers }, { records }, { accounts }] = result;
    expect(transfers).toEqual(expectTransfers);
    expect(records).toEqual(expectRecords);    
    expect(accounts).toEqual(expectAccounts);
    
  });
});

describe('Parcelada', () => {
  it('Cria corretamente sem payday', async () => {
    const idArray = [
      '760e0d03-6cf9-4ae0-9800-cf75fdh75t43',
      '760e0d03-6cf9-4ae0-9800-cf75cc65r380',
      'd5de8cd2-dcff-4570-9c6f-5b1a73220065',
      'd5de8cd2-dcff-4570-9c6f-5b1a732fe45x',
    ];
    vi.spyOn(uuid, 'v4')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75fdh75t43')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc65r380')
      .mockReturnValueOnce('d5de8cd2-dcff-4570-9c6f-5b1a73220065');
    const expectTransfers: TransactionType[] = [];
    for (let i = 1; i <= 3; i += 1) {
      expectTransfers.push({
        ...mocksTransfer.transferInstallments,
        transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
        id: idArray[i - 1],
        installment: i,
        date: `2024-0${i}-06`,
        value: 100,
      });
    }

    const transaction = new Transfer(mocksTransfer.formInstallments);
    const result = await transaction.create(
      'uid',
      mocksData.transactionsRecords,
      mocksData.accounts,
    );
    const [{ transfers }, ...others] = result;
    expect(transfers).toEqual(expectTransfers);
    expect(others).toEqual([]);
  });
  it('Cria corretamente com payday', async () => {
    const idArray = [
      '760e0d03-6cf9-4ae0-9800-cf75fdh75t43',
      'd5de8cd2-dcff-4570-9c6f-5b1a73220065',
      'd5de8cd2-dcff-4570-9c6f-5b1a732fe45x',
    ];
    vi.spyOn(uuid, 'v4')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75fdh75t43')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc65r380')
      .mockReturnValueOnce('d5de8cd2-dcff-4570-9c6f-5b1a73220065')
      .mockReturnValueOnce('d5de8cd2-dcff-4570-9c6f-5b1a732fe45x');
    const expectTransfers: TransactionType[] = [];
    for (let i = 1; i <= 3; i += 1) {
      expectTransfers.push({
        ...mocksTransfer.transferInstallments,
        transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
        id: idArray[i - 1],
        installment: i,
        date: `2024-0${i}-06`,
        value: 100,
      });
    }
    const expectRecords: TransactionType[] = [];
    for (let i = 0; i < 2; i += 1) {
      expectRecords.push({
        ...mocksTransfer.transferInstallments,
        transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
        id: i === 0 ? '760e0d03-6cf9-4ae0-9800-cf75fdh75t43' : '760e0d03-6cf9-4ae0-9800-cf75cc65r380',
        value: 100,
        type: i === 0 ? 'Despesa' : 'Receita',
        account: i === 0 ? 'Itaú' : 'PicPay',
        payday: PAYDAY,
      });
    }
    const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
    expectAccounts[0].balance = 0;
    expectAccounts[2].balance = 200;

    const transaction = new Transfer({...mocksTransfer.formInstallments, payday: PAYDAY});
    const result = await transaction.create(
      'uid',
      mocksData.transactionsRecords,
      mocksData.accounts,
    );
    const [{ transfers }, { records }, { accounts }] = result;
    expect(transfers).toEqual(expectTransfers);
    expect(records).toEqual(expectRecords);
    expect(accounts).toEqual(expectAccounts);
  });
});

// describe('Fixa', () => {
//   it('Cria corretamente sem payday', async () => {});
//   it('Cria corretamente com payday', async () => {});
// });