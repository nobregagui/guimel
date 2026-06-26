export const APP_PATHS = {
  dashboard: '/dashboard',
  clientes: '/clientes',
  produtos: '/produtos',
  financeiro: '/financeiro',
  vendas: '/vendas',
  relatorios: '/relatorios',
  notasFiscais: '/notas-fiscais',
  conciliacaoBancaria: '/conciliacao-bancaria',
  cobrancas: '/cobrancas',
  integracoes: '/integracoes',
  configuracoes: '/configuracoes',
} as const

export type AppPath = (typeof APP_PATHS)[keyof typeof APP_PATHS]
