import { Banks, Budgets, InvestimentsType,
  KeyByType, TransactionsType } from '../types/Data';

export const keyByType = (isFixed: boolean, isTransfer?: boolean): KeyByType => {
  const key = isTransfer ? 'Revenues' : 'Expenses';
  return {
    Despesa: isFixed ? 'fixedExpenses' : 'variableExpenses',
    Receita: isFixed ? 'fixedRevenues' : 'variableRevenues',
    Transferência: isFixed ? `fixed${key}` : `variable${key}`,
    Investimento: isFixed ? 'fixedExpenses' : 'fixedExpenses',
  };
};

export const transactionsModel: TransactionsType = {
  variableRevenues: [],
  fixedRevenues: [],
  fixedExpenses: [],
  variableExpenses: [],
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
