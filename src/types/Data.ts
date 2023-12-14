export type Data = {
  banks: Banks,
  budgets: Budgets,
  investments: InvestimentsType,
  transactions: TransactionsType,
  configurations: ConfigurationsType,
};

export type Budgets = TransactionsType & {
  peoplesBudgets: unknown,
};

export type TransactionsType = {
  variableRevenues: TransactionType[],
  fixedRevenues: FixedTransactionType[],
  fixedExpenses: FixedTransactionType[],
  variableExpenses: TransactionType[],
};

export type Banks = {
  accounts: AccountType[];
  creditCards: [];
};

export type AccountType = {
  id: number,
  name: string,
  balance: number,
  real: number,
  type: 'carteira' | 'conta-corrente' | 'conta-investimento',
};

export type TypesTransaction = 'Receita' | 'Despesa' | 'Investimento' | 'Transferência';

export type InfosTransVar = {
  date: string,
  value: number,
  payday: string | null,
  account: string,
};

export type TransactionType = {
  id: string,
  description: string,
  type: TypesTransaction,
  category: string | null,
  subCategory: string | null,
  installments: string | null,
} & InfosTransVar;

export type FixedTransactionType = TransactionType & {
  variations: InfosTransVar[],
};

export type InvestimentsType = {
  national: InvestNational[];
  international: InvestInternational[];
  [key: string]: InvestInternational[] | InvestNational[];
};

export type InvestNational = {
  id: string,
  name: string,
  buyValue: number,
  currentValue: number,
  simbol: string;
  quantity: number | null,
  date: string,
  type: InvestimentType,
};

export type InvestInternational = {
  id: string,
  name: string,
  buyValue: number,
  currentValue: number,
  simbol: string,
  quantity: number | null,
  date: string,
  type: 'ação' | 'conta' | 'outros',
};

type InvestimentType = 'fixa' | 'variável' | 'FII' | 'previdência' | 'outros';

export type SubCategory = {
  name: string,
  category: string,
};

export type ConfigurationsType = {
  categories: string[],
  subCategories: SubCategory[],
  currency: string,
};
