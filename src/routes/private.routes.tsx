import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

import { MainLayout } from '@/layouts'
import { DashboardPage } from '@/pages/dashboard'
import { ClientesPage } from '@/pages/clientes'
import { ClienteDetalhePage } from '@/pages/clientes/detalhe'
import { PerfilPage } from '@/pages/configuracoes'
import { FinanceiroPage } from '@/pages/financeiro'
import { ModulePlaceholder } from '@/pages/ModulePlaceholder'
import { NotasFiscaisPage } from '@/pages/notas-fiscais'
import { ProdutosPage } from '@/pages/produtos'
import { RelatoriosPage } from '@/pages/relatorios'
import { VendasPage } from '@/pages/vendas'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

export const privateRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/clientes', element: <ClientesPage /> },
          { path: '/clientes/:id', element: <ClienteDetalhePage /> },
          { path: '/produtos', element: <ProdutosPage /> },
          { path: '/financeiro', element: <FinanceiroPage /> },
          { path: '/vendas', element: <VendasPage /> },
          { path: '/relatorios', element: <RelatoriosPage /> },
          { path: '/notas-fiscais', element: <NotasFiscaisPage /> },
          { path: '/cobrancas', element: <ModulePlaceholder title="Cobranças" /> },
          { path: '/integracoes', element: <ModulePlaceholder title="Integrações" /> },
          { path: '/configuracoes', element: <PerfilPage /> },
        ],
      },
    ],
  },
]
