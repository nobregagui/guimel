import { APP_PATHS } from '@/routes/paths'

/** Limite padrão de aprovação do analista financeiro (espelha backend) */
export const FINANCE_APPROVAL_LIMIT = 5_000

export const USER_ROLE_VALUES = [
  'admin',
  'owner',
  'administrative',
  'finance_manager',
  'finance_analyst',
  'sales',
  'sales_supervisor',
  'buyer',
  'stockkeeper',
  'support',
  'accountant',
  'auditor',
  'cashier',
  'hr',
] as const

export type AssignableUserRole = (typeof USER_ROLE_VALUES)[number]

export const USER_ROLE_LABEL: Record<AssignableUserRole | 'manager' | 'finance', string> = {
  admin: 'Administrador',
  owner: 'Diretor / Proprietário',
  administrative: 'Administrativo',
  finance_manager: 'Gerente Financeiro',
  finance_analyst: 'Analista Financeiro',
  sales: 'Vendedor',
  sales_supervisor: 'Supervisor Comercial',
  buyer: 'Comprador',
  stockkeeper: 'Estoquista',
  support: 'Atendimento / Suporte',
  accountant: 'Contador',
  auditor: 'Auditor',
  cashier: 'Caixa',
  hr: 'RH',
  manager: 'Gerente (legado)',
  finance: 'Financeiro (legado)',
}

/**
 * Descrição operacional dos perfis (UX no drawer de usuário).
 * Alinhado a ROLE_PERMISSIONS do backend (erp-guime-api).
 */
export const USER_ROLE_DESCRIPTION: Record<AssignableUserRole, string> = {
  admin:
    'Acesso total ao sistema, incluindo gestão de usuários e todas as ações em qualquer módulo.',
  owner:
    'Visão ampla da operação: dashboard, financeiro (leitura e aprovação), vendas, compras, clientes, produtos, estoque, relatórios e dados da empresa. Sem gestão de usuários.',
  administrative:
    'Acesso operacional a vendas, clientes, produtos, NF-e, conciliação, relatórios e configurações. No Financeiro, apenas visualização — sem criar, editar, baixar ou estornar. Não gerencia usuários.',
  finance_manager:
    'Controle completo do Financeiro: contas a pagar/receber, extrato, fluxo de caixa, transferências, conciliação e relatórios financeiros.',
  finance_analyst:
    'Opera o Financeiro no dia a dia (contas, extrato, transferências e conciliação). Pagamentos acima do limite exigem aprovação do gerente financeiro.',
  sales:
    'Acesso às próprias vendas e aos próprios clientes, além de consultar produtos e o dashboard.',
  sales_supervisor:
    'Gerencia vendas e clientes da equipe: consultar, editar, aprovar, cancelar e definir metas.',
  buyer:
    'Cuida de compras: fornecedores, produtos e pedidos de compra (incluindo recebimento).',
  stockkeeper:
    'Foco em estoque: consultar produtos, movimentar, ajustar e fazer inventário.',
  support:
    'Atendimento: consulta e edição de clientes, visualização de vendas/pedidos e gestão de tickets de suporte.',
  accountant:
    'Acesso contábil/fiscal em leitura: financeiro, relatórios, NF-e e dados fiscais (com exportação). Sem ações de baixa ou escrita financeira.',
  auditor:
    'Somente leitura em todos os módulos. Não realiza criações, edições nem exclusões.',
  cashier:
    'Opera o caixa: abertura/fechamento e recebimentos vinculados a vendas.',
  hr:
    'Módulo de RH: folha, benefícios e férias (leitura e escrita).',
}

/** Permissão mínima por rota — aceita qualquer item do array */
export const ROUTE_ACCESS_PERMISSIONS: Record<string, string[]> = {
  [APP_PATHS.dashboard]: ['dashboard:read'],
  [APP_PATHS.financeiro]: [
    'financeiro:read',
    'financeiro:*',
    'contas_receber:read',
    'contas_pagar:read',
    'extrato:read',
    'fluxo_caixa:read',
  ],
  [APP_PATHS.vendas]: ['vendas:read', 'vendas:read:own', 'vendas:read:team'],
  [APP_PATHS.clientes]: ['clientes:read', 'clientes:read:own', 'clientes:read:team'],
  [APP_PATHS.produtos]: ['produtos:read'],
  [APP_PATHS.notasFiscais]: ['nfe:read', 'nfe:export', 'fiscal:read'],
  [APP_PATHS.relatorios]: ['relatorios:read', 'relatorios:export'],
  [APP_PATHS.cobrancas]: ['financeiro:read', 'contas_receber:read'],
  [APP_PATHS.integracoes]: ['configuracoes:read'],
  [APP_PATHS.conciliacaoBancaria]: ['conciliacao:read', 'conciliacao:*'],
  [APP_PATHS.configuracoes]: ['empresa:read', 'configuracoes:read'],
}

export const MODULE_WRITE_PERMISSIONS = {
  vendas: ['vendas:write', 'vendas:write:own', 'vendas:write:team'],
  clientes: ['clientes:write', 'clientes:write:own', 'clientes:write:team'],
  produtos: ['produtos:write'],
  financeiro: [
    'financeiro:write',
    'financeiro:*',
    'contas_receber:write',
    'contas_receber:*',
    'contas_pagar:write',
    'contas_pagar:*',
  ],
  conciliacao: ['conciliacao:write', 'conciliacao:reconcile', 'conciliacao:*'],
  nfe: ['nfe:write', 'nfe:export'],
} as const

export const FINANCE_PAY_PERMISSIONS = [
  'financeiro:approve',
  'financeiro:*',
  'contas_pagar:write',
  'contas_pagar:*',
] as const

export const FINANCE_RECEIVE_PERMISSIONS = [
  'financeiro:approve',
  'financeiro:*',
  'contas_receber:write',
  'contas_receber:*',
] as const

export const FINANCE_REVERSE_PERMISSIONS = ['financeiro:reverse', 'financeiro:*'] as const

export const FINANCE_APPROVE_HIGH_VALUE_PERMISSIONS = [
  'financeiro:approve',
  'financeiro:*',
  'contas_pagar:approve',
] as const

export function getRouteAccessPermissions(pathname: string): string[] | undefined {
  const normalized = pathname.replace(/\/+$/, '') || '/'

  if (ROUTE_ACCESS_PERMISSIONS[normalized]) {
    return ROUTE_ACCESS_PERMISSIONS[normalized]
  }

  if (normalized.startsWith(`${APP_PATHS.clientes}/`)) {
    return ROUTE_ACCESS_PERMISSIONS[APP_PATHS.clientes]
  }

  if (normalized.startsWith(`${APP_PATHS.vendas}/`)) {
    return ROUTE_ACCESS_PERMISSIONS[APP_PATHS.vendas]
  }

  return undefined
}
