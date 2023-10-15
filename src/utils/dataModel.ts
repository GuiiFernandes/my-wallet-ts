import { InvestimentsType } from '../types';

export const transactionsModel = {
  revenue: [],
  fixedExpense: [],
  variableExpense: [],
};

export const investmentsModel: InvestimentsType = {
  national: [],
  international: [],
};

export const banksModel = {
  accounts: [],
  creditCards: [],
};

export const budgetsModel = {
  revenue: [],
  fixedExpense: [],
  variableExpense: [],
  peoplesBudgets: {},
};

export const typesInvestModel = [
  {
    name: 'fixa',
    title: 'Renda Fixa',
  },
  {
    name: 'variável',
    title: 'Renda Variável',
  }, {
    name: 'FII',
    title: 'Fundos Imobiliários',
  }, {
    name: 'previdência',
    title: 'Previdência',
  }, {
    name: 'outros',
    title: 'Outros',
  },
];
