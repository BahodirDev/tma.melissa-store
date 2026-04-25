export type UserBrief = {
  user_role: string;
  user_name: string;
  user_id: string;
};

export type LoginResponse = {
  status: number;
  message: string;
  user: UserBrief;
  token: string;
};

export type CurrencyRow = {
  currency_id: string;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  currency_amount: string;
  name: string;
  flag: string;
};

export type EmployeeRow = {
  user_id: string;
  user_name: string;
  user_nomer: string;
  user_role: string;
  user_login: string;
  user_password?: string;
  user_createdat: string;
};

export type ClientDebt = Record<string, unknown>;

export type ClientRow = {
  clients_id: string;
  clients_name: string;
  clients_nomer: string;
  clients_desc: string;
  clients_createdat: string;
  isdelete: boolean;
  debts: ClientDebt[];
};
