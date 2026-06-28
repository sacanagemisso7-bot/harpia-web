export type ProjectStatus = 'EM_CAPTACAO' | 'EM_OBRA' | 'ENTREGUE' | 'CANCELADO';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  location?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
