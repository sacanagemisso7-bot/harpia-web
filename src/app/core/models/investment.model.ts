export type InvestmentType = 'FINANCEIRO' | 'PERMUTA' | 'OUTRO';

export interface Investment {
  id: string;
  amount: number;
  date: string;
  type: InvestmentType;
  notes?: string;
  investorId: string;
  projectId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
