import { Interaction } from './interaction.model';

export interface DashboardOverview {
  totalCaptado: number;
  totalInvestidores: number;
  retornosPendentes: { count: number; valor: number };
  retornosAtrasados: { count: number; valor: number };
  ultimasInteracoes: Interaction[];
}
