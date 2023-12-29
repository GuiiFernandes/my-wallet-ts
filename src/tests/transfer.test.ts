import { vi } from 'vitest';

import mocks from './mocks';
import { Transfer } from '../classes/Transactions';

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
      const register = new Transfer(mocks.formTransfer);
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

      expect(transfers).toHaveLength(1);
      expect(transfers[0].type).toBe('Transferência');
      expect(transfers[0].account).toBe('Itaú>Carteira');
      expect(transfers[0].value).toBe(100);

      expect(records).toHaveLength(2);
      expect(records[0].value).toBe(100);
      expect(records[0].type).toBe('Despesa');
      expect(records[1].type).toBe('Receita');
      expect(records[1].value).toBe(100);
    });
  });
});
