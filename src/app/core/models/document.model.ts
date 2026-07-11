export type DocumentCategory = 'CONTRATO' | 'COMPROVANTE' | 'IDENTIDADE' | 'OUTRO';

export interface Document {
  id: string;
  name: string;
  fileUrl: string;
  category: DocumentCategory;
  personId?: string;
  developmentId?: string;
  investmentId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
