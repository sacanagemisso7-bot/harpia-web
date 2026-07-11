import { Document } from './document.model';
import { Interaction } from './interaction.model';
import { Investment } from './investment.model';

export type PersonType = 'FISICA' | 'JURIDICA';

export type PersonRoleType =
  | 'LEAD'
  | 'CLIENTE'
  | 'CORRETOR'
  | 'FUNCIONARIO'
  | 'FORNECEDOR'
  | 'PARCEIRO'
  | 'INVESTIDOR';

export type PersonDocumentType = 'CPF' | 'CNPJ';

export interface PersonRole {
  id: string;
  role: PersonRoleType;
  personId: string;
  organizationId: string;
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  personType: PersonType;
  documentType?: PersonDocumentType;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  roles: PersonRole[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload de criação (POST /people) — papéis vão como array de strings. */
export interface CreatePersonInput {
  name: string;
  personType: PersonType;
  documentType?: PersonDocumentType;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  roles?: PersonRoleType[];
}

/** Resposta de GET /people/:id — inclui relações. */
export interface PersonDetail extends Person {
  investments: Investment[];
  interactions: Interaction[];
  documents: Document[];
}
