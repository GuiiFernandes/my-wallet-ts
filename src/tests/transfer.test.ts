import { vi } from 'vitest';
import * as uuid from 'uuid';

import { SweetAlertResult } from 'sweetalert2';
import mocks from './mocks/transfers';
import { Transfer } from '../classes/Transactions';
import swal from '../utils/swal';

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

describe('Transfer', () => {
  describe('Editar', () => {
    it('Edita corretamente uma transferência única', async () => {
      const register = new Transfer(mocks.formTransferUnique);
      const result = await register.edit(
        'uid',
        mocks.transactions,
        mocks.accounts,
        { year: 2023, month: 12 },
      );
      const [{ transfers }, { records }, { accounts }] = result;

      expect(result).toHaveLength(3);
      expect(accounts[0].balance).toBe(90);
      expect(accounts[1].balance).toBe(110);

      expect(transfers).toHaveLength(2);
      expect(transfers[1].type).toBe('Transferência');
      expect(transfers[1].account).toBe('Itaú>Carteira');
      expect(transfers[1].value).toBe(100);

      expect(records).toHaveLength(2);
      expect(records[0].value).toBe(100);
      expect(records[0].type).toBe('Despesa');
      expect(records[1].type).toBe('Receita');
      expect(records[1].value).toBe(100);
    });

    it('Edita corretamente uma transferência fixa que atualiza somente esta', async () => {
      vi.spyOn(swal, 'upTrans').mockResolvedValue({ value: 'false' } as SweetAlertResult<any>);
      vi.spyOn(uuid, 'v4').mockReturnValue('760e0d03-6cf9-4ae0-9800-cf75cc222670');
      const register = new Transfer(mocks.formTransferThisOnly);
      let result = await register.edit(
        'uid',
        mocks.transactions,
        mocks.accounts,
        { year: 2023, month: 12 },
      );
      const [{ records }, updateBalance] = result;

      const expectExpense = { ...mocks.transfers[2], value: 150 };
      expect(records[2]).toEqual({ ...expectExpense, type: 'Despesa', account: 'Itaú' });
      expect(records[3]).toEqual({ ...expectExpense, type: 'Receita', account: 'Carteira', id: '760e0d03-6cf9-4ae0-9800-cf75cc222670' });
      expect(records[2].payday).toBeNull();
      expect(records[3].payday).toBeNull();
      expect(updateBalance).toBeNull();
      
      register.payday = '2023-01-03';
      result = await register.edit(
        'uid',
        {...mocks.transactions, records},
        mocks.accounts,
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
      .mockReturnValueOnce('760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6');
      // vi.spyOn(uuid, 'v4').mockReturnValue('760e0d03-6cf9-4ae0-9800-cf75cc222670');
      const register = new Transfer(mocks.formTransferThisAndComming);
      let result = await register.edit(
        'uid',
        mocks.transactions,
        mocks.accounts,
        { year: 2023, month: 12 },
      );
      const expectExpense = {
        ...mocks.transfers[2],
        value: 150,
        payday: '2023-12-22',
        type: 'Despesa',
        account: 'Itaú',
        id: '760e0d03-6cf9-4ae0-9800-cf75cc222670',
      };
      const expectRevenue = {
        ...expectExpense,
        type: 'Receita',
        account: 'Carteira',
        id: '760e0d03-6cf9-4ae0-9800-cf75cc2d5hs6',
      };
      const [{ records }, { transfers }, updateBalance] = result;
      expect(transfers).toHaveLength(2);
      expect(transfers[1].value).toBe(150);
      expect(transfers[1].payday).toBeNull();
      expect(records).toHaveLength(4);
      expect(records[2]).toEqual(expectExpense)
      expect(records[3]).toEqual(expectRevenue);
      expect(updateBalance[0].balance).toBe(-50);
      expect(updateBalance[1].balance).toBe(250);
    });
  });
});
