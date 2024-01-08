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
        expectRecords[2].account = 'Carteira';
        expectRecords[3].value = 200;
        expectRecords[3].account = 'Carteira';

      const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
      expectAccounts[1].balance = -100;

      const record = new Record({
        ...mocksData.transactionsEditRecords.records[2],
        value: 200,
        accountDestiny: '',
        account: 'Carteira',
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

// describe('Fixa', () => {
//   describe('Edita somente esta', () => {
//     it('Edita corretamente sem payday', () => {
//       expect(true).toBe(true);
//     });
//     it('Edita corretamente com payday', () => {
//       expect(true).toBe(true);
//     });
//   });
//   describe('Edita esta e as próximas', () => {
//     it('Edita corretamente sem payday', () => {
//       expect(true).toBe(true);
//     });
//     it('Edita corretamente com payday', () => {
//       expect(true).toBe(true);
//     });
//   });
// });