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

    expect(result).toBe('xablau');
  });
});
