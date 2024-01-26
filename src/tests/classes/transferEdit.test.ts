import { vi } from 'vitest';
import * as uuid from 'uuid';

import { SweetAlertResult } from 'sweetalert2';
import mocksData from '../mocks/data';
import { Transfer } from '../../classes/Transactions';
import swal from '../../utils/swal';
import { AccountType, ExpenseRevenue, TransactionType } from '../../types/Data';
import { recordsMockObj } from '../mocks/expectedsRecords';

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
    );
    const [{ transfers }, ...others] = result;
    expect(transfers).toEqual(expectTransfers);
    expect(others).toEqual([]);
  });
  it('Edita corretamente com payday', async () => {
    vi.spyOn(uuid, 'v4')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7');
    const expectTransfers: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.transfers));
    expectTransfers[0].value = 50;
    const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
    for (let index = 0; index < 2; index += 1) {
      expectRecords.push({
        ...mocksData.transactionsEditRecords.transfers[0],
        id: index === 0
        ? '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6'
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
    );
    const [{ transfers }, [{ records }, { accounts }]] = result;
    expect(transfers).toEqual(expectTransfers);
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
      vi.spyOn(uuid, 'v4')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2223f8')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7');
      const expectTransfers: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.transfers));
      expectTransfers[2].value = 200;
      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
      for (let index = 0; index < 2; index += 1) {
        expectRecords.push({
          ...mocksData.transactionsEditRecords.transfers[2],
          id: index === 0
          ? '760e0d03-6cf9-4ae0-9800-cf75cc222670'
          : '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7',
          type: index === 0 ? 'Despesa' : 'Receita',
          account: index === 0 ? 'Itaú' : 'PicPay',
          value: 200,
        });
      }

      const transaction = new Transfer({
        ...mocksData.transactionsEditRecords.transfers[2],
        value: 200,
        account: 'Itaú',
        accountDestiny: 'PicPay',
      });
      const result = await transaction.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
      );
      
      const [{ transfers }, [{records}, balance]] = result;
      
      expect(transfers).toEqual(expectTransfers);
      expect(records).toEqual(expectRecords);
      expect(balance).toBeNull();
    });
    it('Edita corretamente com payday', async () => {
      vi.spyOn(uuid, 'v4')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2223f8')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
        .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7');
      const expectTransfers: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.transfers));
      expectTransfers[2].value = 200;
      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
      for (let index = 0; index < 2; index += 1) {
        expectRecords.push({
          ...mocksData.transactionsEditRecords.transfers[2],
          id: index === 0
          ? '760e0d03-6cf9-4ae0-9800-cf75cc222670'
          : '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7',
          type: index === 0 ? 'Despesa' : 'Receita',
          account: index === 0 ? 'Itaú' : 'PicPay',
          value: 200,
          payday: PAYDAY,
        });
      }
      const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
      expectAccounts[0].balance = -100;
      expectAccounts[2].balance = 300;
  
      const transaction = new Transfer({
        ...mocksData.transactionsEditRecords.transfers[2],
        value: 200,
        payday: PAYDAY,
        account: 'Itaú',
        accountDestiny: 'PicPay',
      });
      const result = await transaction.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
      );
      
      const [{ transfers }, [{records}, { accounts }]] = result;
      
      expect(transfers).toEqual(expectTransfers);
      expect(records).toEqual(expectRecords);
      expect(accounts).toEqual(expectAccounts);
    });
  });
  describe('Edita esta e as próximas', () => {
    beforeEach(() => {
      vi.spyOn(swal, 'upTrans').mockResolvedValue({ value: 'true' } as SweetAlertResult<any>);
    });
    it('Edita corretamente sem payday', async () => {
      const ids = [
        '760e0d03-6cf9-4ae0-9800-cf75cc222670',
        '760e0d03-6cf9-4ae0-9800-cf75ccr4e33e',
        '760e0d03-6cf9-4ae0-9800-cf75ccr4e34f',
        '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
      ];
      vi.spyOn(uuid, 'v4')
        .mockReturnValueOnce(ids[0])
        .mockReturnValueOnce(ids[1])
        .mockReturnValueOnce(ids[2])
        .mockReturnValueOnce(ids[3]);
      const expectTransfers: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.transfers));
      expectTransfers[2].value = 200;
      expectTransfers[3].value = 200;

      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
      const objs: { type: ExpenseRevenue, account: string }[] = [
        { type: 'Despesa', account: 'Itaú' },
        { type: 'Receita', account: 'PicPay'},
      ]
      for (let index = 0; index < 4; index += 1) {
        vi.spyOn(uuid, 'v4').mockReturnValueOnce(ids[index]);
        const i = index % 2;
        expectRecords.push({
          ...mocksData.transactionsEditRecords.transfers[2],
          ...objs[i],
          installment: index < 2 ? 2 : 3,
          date: index < 2 ? '2024-02-06' : '2024-03-06',
          id: ids[index],
          value: 200,
        });        
      }

      const transaction = new Transfer({
        ...mocksData.transactionsEditRecords.transfers[2],
        value: 200,
        account: 'Itaú',
        accountDestiny: 'PicPay',
      });
      const result = await transaction.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
      );

      const [{ transfers }, { records }, balance] = result;
      
      expect(transfers).toEqual(expectTransfers);
      expect(records).toEqual(expectRecords);
      expect(balance).toBeNull();
    });
    it('Edita corretamente com payday', async () => {
      const ids = [
        '760e0d03-6cf9-4ae0-9800-cf75cc222670',
        '760e0d03-6cf9-4ae0-9800-cf75ccr4e33e',
        '760e0d03-6cf9-4ae0-9800-cf75ccr4e34f',
        '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
      ];
      vi.spyOn(uuid, 'v4')
        .mockReturnValueOnce(ids[0])
        .mockReturnValueOnce(ids[1])
        .mockReturnValueOnce(ids[2])
        .mockReturnValueOnce(ids[3]);
      const expectTransfers: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.transfers));
      expectTransfers[2].value = 200;
      expectTransfers[3].value = 200;

      const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
      const objs: { type: ExpenseRevenue, account: string }[] = [
        { type: 'Despesa', account: 'Itaú' },
        { type: 'Receita', account: 'PicPay'},
      ]
      for (let index = 0; index < 4; index += 1) {
        vi.spyOn(uuid, 'v4').mockReturnValueOnce(ids[index]);
        const i = index % 2;
        expectRecords.push({
          ...mocksData.transactionsEditRecords.transfers[2],
          ...objs[i],
          installment: index < 2 ? 2 : 3,
          date: index < 2 ? '2024-02-06' : '2024-03-06',
          id: ids[index],
          payday: index < 2 ? PAYDAY : null,
          value: 200,
        });        
      }

      const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
      expectAccounts[0].balance = -100;
      expectAccounts[2].balance = 300;

      const transaction = new Transfer({
        ...mocksData.transactionsEditRecords.transfers[2],
        value: 200,
        account: 'Itaú',
        payday: PAYDAY,
        accountDestiny: 'PicPay',
      });
      const result = await transaction.edit(
        'uid',
        mocksData.transactionsEditRecords,
        mocksData.accounts,
      );

      const [{ transfers }, { records }, { accounts }] = result;
      
      expect(transfers).toEqual(expectTransfers);
      expect(records).toEqual(expectRecords);
      expect(accounts).toEqual(expectAccounts);
    });
  });
  describe('Fixa', () => {
    describe('Edita somente esta', () => {
      beforeEach(() => {
        vi.spyOn(swal, 'upTrans').mockResolvedValue({ value: 'false' } as SweetAlertResult<any>);
      })
      it('Edita corretamente sem payday', async () => {
        vi.spyOn(uuid, 'v4')
          .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc21g2f4')
          .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc21efs1')
          .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
          .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7');
        const expectTransfers: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.transfers));
        const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
        for (let index = 0; index < 2; index += 1) {
          expectRecords.push({
            ...mocksData.transactionsEditRecords.transfers[4],
            id: index === 0
            ? '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6'
            : '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7',
            transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc21g2f4',
            type: index === 0 ? 'Despesa' : 'Receita',
            date: '2024-03-06',
            account: index === 0 ? 'Carteira' : 'Itaú',
            value: 100,
          });
        }

        const transaction = new Transfer({
          ...mocksData.transactionsEditRecords.transfers[4],
          value: 100,
          date: '2024-03-06',
          transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc21g2f4',
          account: 'Carteira',
          accountDestiny: 'Itaú',
        });
        const result = await transaction.edit(
          'uid',
          mocksData.transactionsEditRecords,
          mocksData.accounts,
        );
        
        const [transfers, {records}, balance] = result;
        
        expect(transfers).toEqual(expectTransfers);
        expect(records).toEqual(expectRecords);
        expect(balance).toBeNull();
      });
      it('Edita corretamente com payday', async () => {
        vi.spyOn(uuid, 'v4')
          .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc21g2f4')
          .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc21efs1')
          .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
          .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7');
        const expectTransfers: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.transfers));
        const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
        for (let index = 0; index < 2; index += 1) {
          expectRecords.push({
            ...mocksData.transactionsEditRecords.transfers[4],
            id: index === 0
            ? '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6'
            : '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs7',
            transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc21g2f4',
            type: index === 0 ? 'Despesa' : 'Receita',
            date: '2024-03-06',
            payday: PAYDAY,
            account: index === 0 ? 'Carteira' : 'Itaú',
            value: 100,
          });
        }
        const expectAccounts: AccountType[] = JSON.parse(JSON.stringify(mocksData.accounts));
        expectAccounts[0].balance = 200;
        expectAccounts[1].balance = 0;

        const transaction = new Transfer({
          ...mocksData.transactionsEditRecords.transfers[4],
          date: '2024-03-06',
          value: 100,
          transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc21g2f4',
          payday: PAYDAY,
          account: 'Carteira',
          accountDestiny: 'Itaú',
        });
        const result = await transaction.edit(
          'uid',
          mocksData.transactionsEditRecords,
          mocksData.accounts,
        );
        
        const [transfers, {records}, { accounts }] = result;
        
        expect(transfers).toEqual(expectTransfers);
        expect(records).toEqual(expectRecords);
        expect(accounts).toEqual(expectAccounts);
      });
    });
    describe('Edita esta e as próximas', () => {
      beforeEach(() => {
        vi.spyOn(swal, 'upTrans').mockResolvedValue({ value: 'true' } as SweetAlertResult<any>);
      })
      it.only('Edita corretamente sem payday', async () => {
        vi.spyOn(uuid, 'v4')
          .mockReturnValueOnce(recordsMockObj[0].id)
          .mockReturnValueOnce(recordsMockObj[1].id)
          .mockReturnValueOnce(recordsMockObj[2].id)
          .mockReturnValueOnce(recordsMockObj[3].id)
          .mockReturnValueOnce(recordsMockObj[4].id)
          .mockReturnValueOnce(recordsMockObj[5].id)
          .mockReturnValueOnce(recordsMockObj[6].id)
          .mockReturnValueOnce(recordsMockObj[7].id)
          .mockReturnValueOnce(recordsMockObj[8].id)
          .mockReturnValueOnce(recordsMockObj[9].id);
        const expectTransfers: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.transfers));
        expectTransfers[4].value = 100;
        const expectRecords: TransactionType[] = JSON.parse(JSON.stringify(mocksData.transactionsEditRecords.records));
        for (let index = 0; index < 10; index += 1) {
          expectRecords.push({
            ...mocksData.transactionsEditRecords.transfers[4],
            transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc21g2f4',
            ...recordsMockObj[index],
            value: 100,
          });
        }

        const transaction = new Transfer({
          ...mocksData.transactionsEditRecords.transfers[4],
          date: '2024-02-10',
          value: 100,
          transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc21g2f4',
          account: 'Carteira',
          accountDestiny: 'Itaú',
        });
        const result = await transaction.edit(
          'uid',
          mocksData.transactionsEditRecords,
          mocksData.accounts,
        );
        
        const [{ transfers }, {records}, balance] = result;
        
        expect(transfers).toEqual(expectTransfers);
        expect(records).toEqual(expectRecords);
        expect(balance).toBeNull();
      });
    });
  });
});