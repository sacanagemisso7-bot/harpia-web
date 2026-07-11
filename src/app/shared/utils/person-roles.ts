import { PersonRoleType } from '../../core/models/person.model';

export const ROLE_OPTIONS: { value: PersonRoleType; label: string }[] = [
  { value: 'LEAD', label: 'Lead' },
  { value: 'CLIENTE', label: 'Cliente' },
  { value: 'INVESTIDOR', label: 'Investidor' },
  { value: 'CORRETOR', label: 'Corretor' },
  { value: 'FUNCIONARIO', label: 'Funcionário' },
  { value: 'FORNECEDOR', label: 'Fornecedor' },
  { value: 'PARCEIRO', label: 'Parceiro' },
];

export const ROLE_LABELS: Record<PersonRoleType, string> = {
  LEAD: 'Lead',
  CLIENTE: 'Cliente',
  INVESTIDOR: 'Investidor',
  CORRETOR: 'Corretor',
  FUNCIONARIO: 'Funcionário',
  FORNECEDOR: 'Fornecedor',
  PARCEIRO: 'Parceiro',
};

/** Fundos sólidos claros (não translúcidos) + texto escuro legível. */
export const ROLE_BADGE: Record<PersonRoleType, string> = {
  INVESTIDOR: 'bg-green-100 text-green-800',
  CLIENTE: 'bg-blue-100 text-blue-800',
  LEAD: 'bg-amber-100 text-amber-800',
  CORRETOR: 'bg-purple-100 text-purple-800',
  FUNCIONARIO: 'bg-slate-100 text-slate-700',
  FORNECEDOR: 'bg-cyan-100 text-cyan-800',
  PARCEIRO: 'bg-orange-100 text-orange-800',
};

export function roleLabel(role: PersonRoleType): string {
  return ROLE_LABELS[role] ?? role;
}

export function roleBadge(role: PersonRoleType): string {
  return ROLE_BADGE[role] ?? 'bg-slate-100 text-slate-700';
}
