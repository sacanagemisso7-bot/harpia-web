export type InvestorStatus = 'ATIVO' | 'PROSPECTO' | 'INATIVO';

export interface Investor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: InvestorStatus;
  entryDate?: string;
  notes?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
