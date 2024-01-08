import { vi } from 'vitest';
import * as uuid from 'uuid';

import mocksRecord from '../mocks/records';
import mocksData from '../mocks/data';
import { Record } from '../../classes/Transactions';
import { TransactionType } from '../../types/Data';

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
  it('Cria corretamente sem payday', async () => {
    vi.spyOn(uuid, 'v4')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6');
    const record = new Record(mocksRecord.formUnique);
    const result = await record.create(
      'uid',
      mocksData.transactionsRecords,
      mocksData.accounts,
    );
    const expectRecord: TransactionType = {
      ...mocksRecord.recordUnique,
      transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
    };
    const [{ records }, balance] = result;
    expect(records[0]).toEqual(expectRecord);
    expect(balance).toBeNull();
  });
  it('Cria corretamente com payday', async () => {
    vi.spyOn(uuid, 'v4')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6');
    const record = new Record({
      ...mocksRecord.formUnique,
      payday: '2024-01-06',
    });
    const result = await record.create(
      'uid',
      mocksData.transactionsRecords,
      mocksData.accounts,
    );
    const expectRecord: TransactionType = {
      ...mocksRecord.recordUnique,
      transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
      payday: '2024-01-06',
    };
    const [{ records }, { accounts }] = result;
    expect(records[0]).toEqual(expectRecord);
    expect(accounts[2].balance).toBe(80);
  });
});
describe('Parcelada', () => {
  it('Cria corretamente sem payday', async () => {
    vi.spyOn(uuid, 'v4')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75fdh75t43')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc65r380')
      .mockReturnValueOnce('d5de8cd2-dcff-4570-9c6f-5b1a73220065');
    const record = new Record(mocksRecord.formInstallments);
    const result = await record.create(
      'uid',
      mocksData.transactionsRecords,
      mocksData.accounts,
    );
    const expectRecord: TransactionType = {
      ...mocksRecord.recordInstallments,
      id: '760e0d03-6cf9-4ae0-9800-cf75fdh75t43',
      transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
      value: 70,
    };
    const [{ records }, balance] = result;
    
    expect(records).toHaveLength(3);
    expect(records[0]).toEqual(expectRecord);
    expect(records[2]).toEqual({
      ...expectRecord, id: 'd5de8cd2-dcff-4570-9c6f-5b1a73220065', installment: 3,
    });
    expect(balance).toBeNull();
  });
  it('Cria corretamente com payday', async () => {
    vi.spyOn(uuid, 'v4')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75fdh75t43')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc65r380')
      .mockReturnValueOnce('d5de8cd2-dcff-4570-9c6f-5b1a73220065');
    const record = new Record({...mocksRecord.formInstallments, payday: '2024-01-06'});
    const result = await record.create(
      'uid',
      mocksData.transactionsRecords,
      mocksData.accounts,
    );
    const expectRecord: TransactionType = {
      ...mocksRecord.recordInstallments,
      payday: '2024-01-06',
      id: '760e0d03-6cf9-4ae0-9800-cf75fdh75t43',
      transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
      value: 70,
    };
    const [{ records }, { accounts }] = result;
    
    expect(records).toHaveLength(3);
    expect(records[0]).toEqual(expectRecord);
    expect(records[2]).toEqual({
      ...expectRecord, id: 'd5de8cd2-dcff-4570-9c6f-5b1a73220065', installment: 3, payday: null,
    });
    expect(accounts[0].balance).toBe(30);
  });
});
describe('Fixa', () => {
  it('Cria corretamente sem payday', async () => {
    vi.spyOn(uuid, 'v4')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6');
    const record = new Record(mocksRecord.formFixed);
    const result = await record.create(
      'uid',
      mocksData.transactionsRecords,
      mocksData.accounts,
    );
    const expectFixed: TransactionType = {
      ...mocksRecord.recordFixed,
      transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
    };
    const [{ fixeds }, balance] = result;
    
    expect(fixeds).toHaveLength(1);
    expect(fixeds[0]).toEqual(expectFixed);
    expect(balance).toBeUndefined();
  });
  it('Cria corretamente com payday', async () => {
    vi.spyOn(uuid, 'v4')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75fdh75t43');
    const record = new Record({...mocksRecord.formFixed, payday: '2024-01-06'});
    const result = await record.create(
      'uid',
      mocksData.transactionsRecords,
      mocksData.accounts,
    );
    const expectFixed: TransactionType = {
      ...mocksRecord.recordFixed,
      transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
    };
    const [{ fixeds }, [{ records }, { accounts }]] = result;
    
    expect(fixeds).toHaveLength(1);
    expect(fixeds[0]).toEqual(expectFixed);
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
      ...expectFixed, id: '760e0d03-6cf9-4ae0-9800-cf75cc222670', payday: '2024-01-06',
    });
    expect(accounts[0].balance).toBe(-400);
  });
});
