import type { RouteObject } from 'react-router-dom'
import { RequirePermissionRoute } from '@/components/auth/RequirePermissionRoute'
import { HomeRedirect } from '@/components/auth/HomeRedirect'
import { MainLayout } from '@/layouts'
import { DashboardPage } from '@/pages/dashboard'
import { ClientesPage } from '@/pages/clientes'
import { ClienteDetalhePage } from '@/pages/clientes/detalhe'
import { ConfiguracoesPage } from '@/pages/configuracoes'
import { ConciliacaoBancariaPage } from '@/pages/conciliacao-bancaria'
import { FinanceiroPage } from '@/pages/financeiro'
import { ForbiddenPage } from '@/pages/Forbidden'
import { ModulePlaceholder } from '@/pages/ModulePlaceholder'
import { NotasFiscaisPage } from '@/pages/notas-fiscais'
import { ProdutosPage } from '@/pages/produtos'
import { ProdutoDetalhePage } from '@/pages/produtos/detalhe'
import { RelatoriosPage } from '@/pages/relatorios'
import { VendasPage } from '@/pages/vendas'
import { VendaDetalhePage } from '@/pages/vendas/detalhe'
import { APP_PATHS } from '@/routes/paths'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

export const privateRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      { path: APP_PATHS.forbidden, element: <ForbiddenPage /> },
      {
        element: <MainLayout />,
        children: [
          {
            element: <RequirePermissionRoute />,
            children: [
              { path: '/', element: <HomeRedirect /> },
              { path: APP_PATHS.dashboard, element: <DashboardPage /> },
              { path: APP_PATHS.clientes, element: <ClientesPage /> },
              { path: `${APP_PATHS.clientes}/:id`, element: <ClienteDetalhePage /> },
              { path: APP_PATHS.produtos, element: <ProdutosPage /> },
              { path: `${APP_PATHS.produtos}/:id`, element: <ProdutoDetalhePage /> },
              { path: APP_PATHS.financeiro, element: <FinanceiroPage /> },
              { path: APP_PATHS.conciliacaoBancaria, element: <ConciliacaoBancariaPage /> },
              { path: APP_PATHS.vendas, element: <VendasPage /> },
              { path: `${APP_PATHS.vendas}/:id`, element: <VendaDetalhePage /> },
              { path: APP_PATHS.relatorios, element: <RelatoriosPage /> },
              { path: APP_PATHS.notasFiscais, element: <NotasFiscaisPage /> },
              { path: APP_PATHS.cobrancas, element: <ModulePlaceholder title="Cobranças" /> },
              { path: APP_PATHS.integracoes, element: <ModulePlaceholder title="Integrações" /> },
              { path: APP_PATHS.configuracoes, element: <ConfiguracoesPage /> },
            ],
          },
        ],
      },
    ],
  },
]
