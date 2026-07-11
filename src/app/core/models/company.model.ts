export type CompanyType = 'HOLDING' | 'INCORPORADORA' | 'SPE' | 'OUTRO';

export interface Company {
  id: string;
  name: string;
  tradeName?: string;
  cnpj?: string;
  type: CompanyType;
  parentCompanyId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
