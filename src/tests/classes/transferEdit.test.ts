import { vi } from 'vitest';
import * as uuid from 'uuid';

import { SweetAlertResult } from 'sweetalert2';
import mocksTransfer from '../mocks/transfers';
import mocksData from '../mocks/data';
import { Transfer } from '../../classes/Transactions';
import swal from '../../utils/swal';
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
});

it('Edita corretamente uma transferência única', async () => {
  const register = new Transfer(mocksTransfer.formTransferUnique);
  const result = await register.edit(
    'uid',
    mocksData.transactionsTransfers,
    mocksData.accounts,
    { year: 2023, month: 12 },
  );
  const [{ transfers }, { records }, { accounts }] = result;

  const expectTransfer: TransactionType = {
    ...mocksTransfer.transfers[1],
  }

  expect(result).toHaveLength(3);
  expect(accounts[0].balance).toBe(90);
  expect(accounts[1].balance).toBe(110);

  expect(transfers).toHaveLength(5);
  

  expect(records).toHaveLength(2);
  expect(records[0].value).toBe(100);
  expect(records[0].type).toBe('Despesa');
  expect(records[1].type).toBe('Receita');
  expect(records[1].value).toBe(100);
});

it('Edita corretamente uma transferência fixa que atualiza somente esta', async () => {
  vi.spyOn(swal, 'upTrans').mockResolvedValue({ value: 'false' } as SweetAlertResult<any>);
  vi.spyOn(uuid, 'v4').mockReturnValue('760e0d03-6cf9-4ae0-9800-cf75cc222670');
  const register = new Transfer(mocksTransfer.formTransferThisOnly);
  let result = await register.edit(
    'uid',
    mocksData.transactionsTransfers,
    mocksData.accounts,
    { year: 2023, month: 12 },
  );
  const [{ records }, updateBalance] = result;

  const expectExpense = { ...mocksTransfer.transfers[2], value: 150 };
  expect(records[2]).toEqual({ ...expectExpense, type: 'Despesa', account: 'Itaú' });
  expect(records[3]).toEqual({ ...expectExpense, type: 'Receita', account: 'Carteira', id: '760e0d03-6cf9-4ae0-9800-cf75cc222670' });
  expect(records[2].payday).toBeNull();
  expect(records[3].payday).toBeNull();
  expect(updateBalance).toBeNull();
  
  register.payday = '2023-01-03';
  result = await register.edit(
    'uid',
    {...mocksData.transactionsTransfers, records},
    mocksData.accounts,
    { year: 2023, month: 12 },
  );

  const [{ records: records2 }, { accounts }] = result;
  
  expect(records2[2].payday).toBe('2023-01-03');
  expect(records2[3].payday).toBe('2023-01-03');

  expect(accounts[0].balance).toBe(-50);
  expect(accounts[1].balance).toBe(250);
});

it('Edita corretamente uma transferência fixa que atualiza esta e as próximas', async () => {
  vi.spyOn(swal, 'upTrans').mockResolvedValue({ value: 'true' } as SweetAlertResult<any>);
  vi.spyOn(uuid, 'v4')
    .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc222670')
    .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6')
    .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75fdh75t43')
    .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc65r380');
  // vi.spyOn(uuid, 'v4').mockReturnValue('760e0d03-6cf9-4ae0-9800-cf75cc222670');
  const register = new Transfer(mocksTransfer.formTransferThisAndComming);
  let result = await register.edit(
    'uid',
    mocksData.transactionsTransfers,
    mocksData.accounts,
    { year: 2024, month: 1 },
  );
  const expectExpenses = [
    {...mocksTransfer.transfers[1], id: '760e0d03-6cf9-4ae0-9800-cf75cc222670', type: 'Despesa', account: 'Itaú'},
    {
      ...mocksTransfer.transfers[2],
      value: 150,
      payday: '2023-12-22',
      type: 'Despesa',
      account: 'Itaú',
    },
  ];
  const expectRevenues = [
    {...mocksTransfer.transfers[1], type: 'Receita', account: 'PicPay', id: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6'},
    {
      ...expectExpenses[1],
      type: 'Receita',
      account: 'Carteira',
      id: '760e0d03-6cf9-4ae0-9800-cf75fdh75t43',
    },
  ];

  const [{ records }, { transfers }, [,{ accounts }]] = result;

  expect(transfers).toHaveLength(5);
  expect(transfers[1].value).toBe(150);
  expect(transfers[1].payday).toBeNull();
  expect(transfers[1].account).toBe('Itaú>Carteira');
  expect(records).toHaveLength(6);
  expect(records[2]).toEqual(expectExpenses[0]);
  expect(records[3]).toEqual(expectRevenues[0]);
  expect(records[4]).toEqual(expectExpenses[1]);
  expect(records[5]).toEqual(expectRevenues[1]);
  expect(accounts[0].balance).toBe(-50);
  expect(accounts[1].balance).toBe(250);
});
