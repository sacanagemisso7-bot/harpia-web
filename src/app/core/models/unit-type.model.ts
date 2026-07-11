export interface UnitType {
  id: string;
  name: string;
  description?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;
  developmentId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
