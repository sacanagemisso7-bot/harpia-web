export interface Allocation {
  id: string;
  amount: number;
  percentage?: number;
  investmentId: string;
  developmentId?: string;
  unitId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
