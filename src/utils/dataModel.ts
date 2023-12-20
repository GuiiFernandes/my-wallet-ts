import { Banks, Budgets, InvestimentsType, TransactionsType } from '../types/Data';

export const transactionsModel: TransactionsType = {
  fixeds: [],
  records: [],
  transfers: [],
};

export const investmentsModel: InvestimentsType = {
  national: [],
  international: [],
};

export const banksModel: Banks = {
  accounts: [],
  creditCards: [],
};

export const budgetsModel: Budgets = {
  ...transactionsModel,
  peoplesBudgets: {},
};

export const configurationsModel = {
  categories: [],
  subCategories: [],
  currency: 'BRL',
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
