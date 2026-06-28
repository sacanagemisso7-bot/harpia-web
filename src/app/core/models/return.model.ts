export type ReturnStatus = 'PENDENTE' | 'PAGO' | 'ATRASADO';

export interface Return {
  id: string;
  expectedAmount: number;
  expectedDate: string;
  realizedDate?: string;
  realizedAmount?: number;
  status: ReturnStatus;
  investmentId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
