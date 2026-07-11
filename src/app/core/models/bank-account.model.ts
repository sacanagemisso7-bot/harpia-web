export type BankAccountType = 'CORRENTE' | 'POUPANCA' | 'PAGAMENTO' | 'INVESTIMENTO';

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode?: string;
  agency: string;
  accountNumber: string;
  type: BankAccountType;
  pixKey?: string;
  companyId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
