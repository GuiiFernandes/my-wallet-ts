import { vi } from 'vitest';
import * as uuid from 'uuid';

import { SweetAlertResult } from 'sweetalert2';
import mocksData from '../mocks/data';
import { Record } from '../../classes/Transactions';
import swal from '../../utils/swal';
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

describe('Única', () => {
  it('Edita corretamente sem payday', async () => {
    const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
    expectRecords[0].value = 30;
    
    const record = new Record({
      ...mocksData.transactionsEditRecords.records[0],
      value: 30,
      accountDestiny: '',
    });
    const result = await record.edit(
      'uid',
      mocksData.transactionsEditRecords,
      mocksData.accounts,
      { year: 2024, month: 1 },
    );

    const [{ records }, balance] = result;
    expect(records).toEqual(expectRecords);
    expect(balance).toBeNull();
  });
  it('Edita corretamente com payday', async () => {
        const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
      expectRecords[0].value = 30;
      expectRecords[0].payday = '2024-01-08';
    const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
      expectAccounts[2].balance = 70;

    const record = new Record({
      ...mocksData.transactionsEditRecords.records[0],
      value: 30,
      payday: '2024-01-08',
      accountDestiny: '',
    });
    const result = await record.edit(
      'uid',
      mocksData.transactionsEditRecords,
      mocksData.accounts,
      { year: 2024, month: 1 },
    );

    const [{ records }, {accounts}] = result;
    expect(records).toEqual(expectRecords);
    expect(accounts).toEqual(expectAccounts);
  });
});

describe('Parcelada', () => {
  describe('Edita somente esta', () => {
    beforeEach(() => {
      vi.spyOn(swal, 'upTrans').mockResolvedValue({ value: 'false' } as SweetAlertResult<any>);
    });
    it('Edita corretamente sem payday', async () => {
      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
      expectRecords[2].value = 190;

      const record = new Record({
        ...mocksData.transactionsEditRecords.records[2],
        value: 190,
        accountDestiny: '',
      });
      const result = await record.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
        { year: 2024, month: 1 },
      );
    
      const [{ records }, balance] = result;
      
      expect(records).toEqual(expectRecords);
      expect(balance).toBeNull();
    });
    it('Edita corretamente com payday', async () => {
      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
      expectRecords[2].value = 190;
      expectRecords[2].payday = '2024-01-08';
      expectRecords[2].account = 'Carteira';

      const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
      expectAccounts[1].balance = -90;

      const record = new Record({
        ...mocksData.transactionsEditRecords.records[2],
        value: 190,
        payday: '2024-01-08',
        accountDestiny: '',
        account: 'Carteira',
      });
      const result = await record.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
        { year: 2024, month: 1 },
      );
    
      const [{ records }, { accounts }] = result;
      
      expect(records).toEqual(expectRecords);
      expect(accounts).toEqual(expectAccounts);
    });
  });

  describe('Edita esta e as próximas', () => {
    beforeEach(() => {
      vi.spyOn(swal, 'upTrans').mockResolvedValue({ value: 'true' } as SweetAlertResult<any>);
    });
    it('Edita corretamente sem payday', async () => {
      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));

        expectRecords[2].value = 200;
        expectRecords[3].value = 200;

      const record = new Record({
        ...mocksData.transactionsEditRecords.records[2],
        value: 200,
        accountDestiny: '',
      });
      const result = await record.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
        { year: 2024, month: 1 },
      );
    
      const [{ records }, balance] = result;
      
      expect(records).toEqual(expectRecords);
      expect(balance).toBeNull();
    });
    it('Edita corretamente com payday', async () => {
      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));

        expectRecords[2].value = 200;
        expectRecords[2].payday = '2024-01-08';
        expectRecords[2].account = 'Carteira';
        expectRecords[3].value = 200;
        expectRecords[3].account = 'Carteira';

      const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
      expectAccounts[1].balance = -100;

      const record = new Record({
        ...mocksData.transactionsEditRecords.records[2],
        value: 200,
        payday: '2024-01-08',
        accountDestiny: '',
        account: 'Carteira',
      });
      const result = await record.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
        { year: 2024, month: 1 },
      );
    
      const [{ records }, { accounts }] = result;
      
      expect(records).toEqual(expectRecords);
      expect(accounts).toEqual(expectAccounts);
    });
  });
});

describe('Fixa', () => {
  describe('Edita somente esta', () => {
    beforeEach(() => {
      vi.spyOn(swal, 'upTrans').mockResolvedValue({ value: 'false' } as SweetAlertResult<any>);
    });
    it('Edita corretamente sem payday', async () => {
      vi.spyOn(uuid, 'v4')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6');
      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
      expectRecords.push({
        ...expectRecords[4],
        id: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
        date: '2024-02-06',
        payday: null,
        value: 200,
      });

      const record = new Record({
        ...mocksData.transactionsEditRecords.fixeds[0],
        value: 200,
        date: '2024-02-06',
        accountDestiny: '',
      });
      const result = await record.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
        { year: 2024, month: 2 },
      );
    
      const [{ records }, balance] = result;
      
      expect(records).toEqual(expectRecords);
      expect(balance).toBeNull();
    });
    it('Edita corretamente com payday', async () => {
      vi.spyOn(uuid, 'v4')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6');
      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
      expectRecords.push({
        ...expectRecords[4],
        id: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
        date: '2024-02-06',
        payday: '2024-02-06',
        value: 200,
      });
      const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
      expectAccounts[0].balance = -100;

      const record = new Record({
        ...mocksData.transactionsEditRecords.fixeds[0],
        value: 200,
        date: '2024-02-06',
        payday: '2024-02-06',
        accountDestiny: '',
      });
      const result = await record.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
        { year: 2024, month: 2 },
      );
    
      const [{ records }, { accounts }] = result;
      
      expect(records).toEqual(expectRecords);
      expect(accounts).toEqual(expectAccounts);
    });
  });
  describe('Edita esta e as próximas', () => {
    beforeEach(() => {
      vi.spyOn(swal, 'upTrans').mockResolvedValue({ value: 'true' } as SweetAlertResult<any>);
    });
    it('Edita corretamente sem payday', async () => {
      vi.spyOn(uuid, 'v4')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7');
      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
      for (let index = 0; index < 2; index += 1) {
        const id = index === 0
          ? '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6'
          : '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7';
        const date = index === 0 ? '2024-02-06' : '2024-03-06';
        const installment = index === 0 ? 1 : 2;
        expectRecords.push({
          ...expectRecords[4],
          id,
          date,
          payday: null,
          installment,
          value: 500,
        });
      }
      const expectFixed: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.fixeds));
      expectFixed[0].value = 200;
      const record = new Record({
        ...mocksData.transactionsEditRecords.fixeds[0],
        value: 200,
        date: '2024-04-06',
        accountDestiny: '',
      });
      const result = await record.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
        { year: 2024, month: 4 },
      );
      
      const [[{ records }, { fixeds }], balance] = result;
      
      expect(records).toEqual(expectRecords);
      expect(fixeds).toEqual(expectFixed);
      expect(balance).toBeUndefined();
    });
    it('Edita corretamente com payday', async () => {
      vi.spyOn(uuid, 'v4')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs8');
      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
      for (let index = 0; index < 2; index += 1) {
        const id = index === 0
          ? '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6'
          : '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7';
        const date = index === 0 ? '2024-02-06' : '2024-03-06';
        const installment = index === 0 ? 1 : 2;
        expectRecords.push({
          ...expectRecords[4],
          id,
          date,
          payday: null,
          installment,
          value: 500,
        });
      }
      const expectFixed: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.fixeds));
      expectFixed[0].value = 200;
      const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
      expectAccounts[0].balance = -200;

      const record = new Record({
        ...mocksData.transactionsEditRecords.fixeds[0],
        value: 200,
        date: '2024-04-06',
        payday: '2024-04-06',
        accountDestiny: '',
      });
      const result = await record.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
        { year: 2024, month: 4 },
      );
      
      const [[{ records }, { fixeds }], [{ records: recordThisOnly }]] = result;
      
      expect(records).toEqual(expectRecords);
      expect(fixeds).toEqual(expectFixed);
      expect(recordThisOnly).toEqual([...expectRecords, {
        ...mocksData.transactionsEditRecords.fixeds[0],
        value: 200,
        date: '2024-04-06',
        payday: '2024-04-06',
        id: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs8',
      }]);
    });
  });
});