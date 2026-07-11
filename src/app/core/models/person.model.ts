export type PersonType = 'PF' | 'PJ';

export type PersonRoleType =
  | 'INVESTIDOR'
  | 'CLIENTE'
  | 'SOCIO'
  | 'CORRETOR'
  | 'FORNECEDOR'
  | 'CONTATO';

export type PersonDocumentType = 'CPF' | 'CNPJ' | 'RG' | 'PASSAPORTE' | 'OUTRO';

export interface PersonRole {
  id: string;
  type: PersonRoleType;
  personId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  name: string;
  type: PersonType;
  documentType?: PersonDocumentType;
  document?: string;
  email?: string;
  phone?: string;
  notes?: string;
  roles: PersonRole[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
