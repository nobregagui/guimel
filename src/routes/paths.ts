export const APP_PATHS = {
  dashboard: '/dashboard',
  clientes: '/clientes',
  produtos: '/produtos',
  financeiro: '/financeiro',
  vendas: '/vendas',
  relatorios: '/relatorios',
  notasFiscais: '/notas-fiscais',
  cobrancas: '/cobrancas',
  integracoes: '/integracoes',
  configuracoes: '/configuracoes',
} as const

export type AppPath = (typeof APP_PATHS)[keyof typeof APP_PATHS]
