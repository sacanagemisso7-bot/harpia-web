/**
 * Estrutura única da navegação da sidebar.
 * Para mudar a navegação, edite este array — a sidebar renderiza a partir daqui.
 *
 * `icon` é o nome do ícone Lucide (PascalCase). A sidebar mapeia o nome para o
 * objeto do ícone. Ao adicionar um item com um ícone novo, registre-o também no
 * mapa de ícones da sidebar (sidebar.component.ts).
 */
export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

export interface NavGroup {
  /** Rótulo do grupo. Vazio ('') = grupo sem cabeçalho (itens de topo). */
  label: string;
  items: NavItem[];
}

export const NAVIGATION: NavGroup[] = [
  {
    label: '',
    items: [{ label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard' }],
  },
  {
    label: 'Comercial',
    items: [
      { label: 'Pessoas', route: '/people', icon: 'Users' },
      { label: 'Interações', route: '/interactions', icon: 'MessageSquare' },
    ],
  },
  {
    label: 'Empreendimentos',
    items: [{ label: 'Empreendimentos', route: '/developments', icon: 'Building2' }],
  },
  {
    label: 'Investidores',
    items: [
      { label: 'Investimentos', route: '/investments', icon: 'TrendingUp' },
      { label: 'Retornos', route: '/returns', icon: 'Coins' },
    ],
  },
  {
    label: 'Cadastros',
    items: [
      { label: 'Empresas / SPEs', route: '/companies', icon: 'Landmark' },
      { label: 'Contas Bancárias', route: '/bank-accounts', icon: 'Wallet' },
    ],
  },
];
