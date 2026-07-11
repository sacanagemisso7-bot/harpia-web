export type DevelopmentType = 'VERTICAL' | 'HORIZONTAL' | 'LOTEAMENTO' | 'COMERCIAL' | 'MISTO';

export type DevelopmentStatus =
  | 'PLANEJAMENTO'
  | 'LANCAMENTO'
  | 'EM_OBRA'
  | 'ENTREGUE'
  | 'CANCELADO';

export interface Development {
  id: string;
  name: string;
  description?: string;
  type: DevelopmentType;
  status: DevelopmentStatus;
  location?: string;
  companyId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
