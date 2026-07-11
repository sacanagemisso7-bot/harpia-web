export type InteractionType =
  | 'REUNIAO'
  | 'LIGACAO'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'VISITA'
  | 'OUTRO';

export interface Interaction {
  id: string;
  date: string;
  type: InteractionType;
  summary: string;
  nextStep?: string;
  personId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  person?: { id: string; name: string };
}
