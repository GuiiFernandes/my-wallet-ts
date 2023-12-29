import { vi } from 'vitest';

import mocks from './mocks';
import { Transfer } from '../classes/Transactions';
import firebaseFuncs from '../utils/firebaseFuncs';

describe('Transfer', () => {
  it('Edita corretamente uma transferência única', async () => {
    vi.spyOn(firebaseFuncs, 'update').mockResolvedValue(true);
    vi.spyOn(firebaseFuncs, 'updateBalance').mockResolvedValue({ accounts: [] });
    const register = new Transfer(mocks.formTransfer);
    const result = await register.edit(
      'uid',
      mocks.transactions,
      [{ id: 1, name: 'Itaú', balance: 90, real: 180, type: 'conta-corrente' }],
      { year: 2023, month: 12 },
    );
    const [newTransfers, newRecords] = result;

    expect(newTransfers).toHaveLength(1);
    expect(newTransfers[0].value).toBe(100);
    expect(newTransfers[0].type).toBe('Transferência');
    expect(newTransfers[0].account).toBe('Itaú>Carteira');

    expect(newRecords).toHaveLength(2);
    expect(newRecords[0].value).toBe(100);
    expect(newRecords[0].type).toBe('Despesa');
    expect(newRecords[1].type).toBe('Receita');
    expect(newRecords[1].value).toBe(100);
  });
});
