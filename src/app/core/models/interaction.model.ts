export type InteractionType = 'REUNIAO' | 'LIGACAO' | 'WHATSAPP' | 'EMAIL' | 'OUTRO';

export interface Interaction {
  id: string;
  date: string;
  type: InteractionType;
  summary: string;
  nextStep?: string;
  investorId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  investor?: { id: string; name: string };
}
