import { FormTransaction } from '../types/LocalStates';

type InstallmentsTransType = {
  Diariamente: number;
  Semanalmente: number;
  Quinzenalmente: number;
  Mensalmente: number;
  Bimestralmente: number;
  Trimestralmente: number;
  Semestralmente: number;
  Anualmente: number;
  [key: string]: number;
};

const oneDay = 1000 * 60 * 60 * 24;

const installmentsTransform: InstallmentsTransType = {
  Diariamente: oneDay,
  Semanalmente: oneDay * 7,
  Quinzenalmente: oneDay * 14,
  Mensalmente: oneDay * 30,
  Bimestralmente: oneDay * 60,
  Trimestralmente: oneDay * 90,
  Semestralmente: oneDay * 180,
  Anualmente: oneDay * 365,
};

export default function useTransaction() {
  const createTransaction = async (form: Omit<FormTransaction, 'id'>) => {
    const { installments, period } = form;

    const newForm: any = { ...form };

    delete newForm.installments;
    delete newForm.period;
    delete newForm.isFixed;

    const transactions = [];
    if (installments) {
      const periodNumber = installmentsTransform[period];

      for (let i = 0; i <= installments; i += 1) {
        const dueDate = new Date(form.dueDate).getTime() + (periodNumber * i);
        transactions.push({
          ...form,
          dueDate: new Date(dueDate).toISOString().slice(0, 10),
        });
      }
    } else {
      transactions.push(form);
    }

    // const newTransactions = {
    //   ...form,
    //   installments: installments
    //     ?
    //     : null,
    // };
  };

  return { createTransaction };
}
