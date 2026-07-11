import { Interaction } from './interaction.model';

export interface DashboardOverview {
  totalInvestido: number;
  totalPessoas: number;
  totalEmpreendimentos: number;
  unidadesDisponiveis: number;
  unidadesVendidas: number;
  retornosPendentes: { count: number; valor: number };
  retornosAtrasados: { count: number; valor: number };
  ultimasInteracoes: Interaction[];
}
