export type UnitCategory = 'APARTAMENTO' | 'CASA' | 'LOTE' | 'SALA' | 'LOJA' | 'OUTRO';

export type UnitStatus = 'DISPONIVEL' | 'RESERVADA' | 'VENDIDA' | 'BLOQUEADA';

export interface Unit {
  id: string;
  identifier: string;
  category: UnitCategory;
  status: UnitStatus;
  area?: number;
  floor?: number;
  block?: string;
  basePrice?: number;
  developmentId: string;
  unitTypeId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
