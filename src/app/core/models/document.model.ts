export type DocumentCategory = 'CONTRATO' | 'COMPROVANTE' | 'OUTRO';

export interface Document {
  id: string;
  name: string;
  fileUrl: string;
  category: DocumentCategory;
  investorId?: string;
  investmentId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
