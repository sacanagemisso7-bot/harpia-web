export interface PriceTableItem {
  id: string;
  priceTableId: string;
  unitId?: string;
  unitTypeId?: string;
  price: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceTable {
  id: string;
  name: string;
  developmentId: string;
  active: boolean;
  validFrom?: string;
  validUntil?: string;
  items?: PriceTableItem[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
