# Dashboard — GuiMe Money

Documentação da estrutura de código do dashboard ERP: rotas, layout compartilhado, feature module e composição visual da página `/dashboard`.

---

## Visão geral

O dashboard é dividido em **três camadas**:

| Camada | Responsabilidade |
|--------|------------------|
| **Roteamento** | Autenticação, `MainLayout` e rota `/dashboard` |
| **Layout (shell)** | Sidebar + Header em todas as telas autenticadas |
| **Página + feature** | Conteúdo exclusivo do dashboard (KPIs, gráficos, listas) |

```
ProtectedRoute
└── MainLayout                    ← shell (sidebar + header + <Outlet />)
    ├── /dashboard → DashboardPage   ← conteúdo do dashboard
    ├── /clientes  → ClientesPage
    ├── /financeiro → FinanceiroPage
    └── …
```

---

## Árvore de arquivos

```
src/
├── routes/
│   └── private.routes.tsx          # Rotas autenticadas + MainLayout
│
├── layouts/
│   └── MainLayout/
│       ├── index.tsx               # Shell: Sidebar + Header + Outlet
│       └── MainLayout.module.css   # margin-left da sidebar, padding do main
│
├── pages/
│   └── dashboard/
│       ├── index.tsx               # export { DashboardPage }
│       ├── DashboardPage.tsx       # Composição dos widgets do dashboard
│       └── DashboardPage.module.css  # Grid da página (KPIs, colunas, rodapé)
│
└── features/
    └── dashboard/
        ├── README.md               # Este arquivo
        ├── index.ts                # Barrel exports dos componentes
        ├── types.ts                # Interfaces TypeScript
        ├── data.ts                 # Dados mock (KPIs, listas, menu, gráfico)
        ├── icons.tsx               # SVGs do menu + MiniSparkline
        ├── dashboard.module.css    # Estilos compartilhados (card, botões)
        └── components/
            ├── DashboardSidebar.tsx + .module.css
            ├── DashboardHeader.tsx + .module.css
            ├── DashboardKpis.tsx + .module.css
            ├── DashboardCashflow.tsx + .module.css
            ├── DashboardQuickActions.tsx + .module.css
            ├── DashboardReceivables.tsx + .module.css
            ├── DashboardRecentActivities.tsx + .module.css
            ├── DashboardFinancialSummary.tsx + .module.css
            ├── DashboardAiInsights.tsx + .module.css
            └── DashboardHealthScore.tsx + .module.css
```

**Dependências externas usadas (não alteradas pelo dashboard):**

- `@/components/ui/Logo` — logo GuiMe na sidebar
- `@/styles/theme.css` — tokens CSS (`--primary`, `--radius-*`, etc.)
- `@/utils/currency` — `formatCurrency()` nos valores monetários

---

## Fluxo de renderização

```
1. Usuário autenticado acessa /dashboard
2. ProtectedRoute → MainLayout
3. MainLayout renderiza:
   - DashboardSidebar (fixa, 280px)
   - DashboardHeader
   - <Outlet /> → DashboardPage
4. DashboardPage monta apenas os widgets internos
```

### `MainLayout` (`src/layouts/MainLayout/index.tsx`)

- Estado local: `sidebarCollapsed`, `mobileSidebarOpen`
- Breakpoint mobile: `768px` (drawer + botão ☰ no header)
- Importa da feature: `DashboardSidebar`, `DashboardHeader`

### `DashboardPage` (`src/pages/dashboard/DashboardPage.tsx`)

Não inclui sidebar nem header — só o conteúdo central.

---

## Layout visual da página

```
┌─────────────────────────────────────────────────────────────┐
│ DashboardSidebar (280px, fixa) │ DashboardHeader           │
│                                 ├──────────────────────────┤
│                                 │ DashboardKpis (4 cards)  │
│                                 ├────────────┬─────────────┤
│                                 │ Cashflow   │ QuickActions│
│                                 │            │ Receivables │
│                                 │ Financial  │ Activities  │
│                                 │ Summary    │             │
│                                 ├────────────┴─────────────┤
│                                 │ AI Insights │ HealthScore│
└─────────────────────────────────┴──────────────────────────┘
```

Implementado em `DashboardPage.module.css`:

- `.content` — coluna principal com gap
- `.mainGrid` — 2 colunas (primária + lateral 340px)
- `.colPrimary` / `.colSecondary`
- `.bottomRow` — GuiMe AI + Saúde Financeira

---

## Componentes da feature

### Shell (usados pelo `MainLayout`)

| Componente | Arquivo | Função |
|------------|---------|--------|
| **DashboardSidebar** | `components/DashboardSidebar.tsx` | Menu lateral escuro (`#071A12`), `<Logo />`, navegação `NavLink`, card GuiMe AI |
| **DashboardHeader** | `components/DashboardHeader.tsx` | Saudação, busca, botões (+, notificações, ajuda), empresa, avatar |

### Conteúdo (usados só pelo `DashboardPage`)

| Componente | Arquivo | Função |
|------------|---------|--------|
| **DashboardKpis** | `DashboardKpis.tsx` | 4 cards: Faturamento, A Receber, A Pagar, Saldo |
| **DashboardCashflow** | `DashboardCashflow.tsx` | Gráfico SVG (Entradas / Saídas / Saldo), filtro “Mês Atual” |
| **DashboardQuickActions** | `DashboardQuickActions.tsx` | Nova venda, cobrança, pagamento, NF |
| **DashboardReceivables** | `DashboardReceivables.tsx` | Lista de contas a receber mock |
| **DashboardRecentActivities** | `DashboardRecentActivities.tsx` | Timeline de atividades recentes |
| **DashboardFinancialSummary** | `DashboardFinancialSummary.tsx` | 4 mini cards: Entradas, Saídas, Resultado, Margem |
| **DashboardAiInsights** | `DashboardAiInsights.tsx` | Banner GuiMe AI + CTA “Conversar agora” |
| **DashboardHealthScore** | `DashboardHealthScore.tsx` | Gauge SVG, score 92, status “Excelente” |

Cada par `.tsx` + `.module.css` segue **CSS Modules** e **named exports**.

---

## Dados e tipos

### `types.ts`

Define interfaces: `DashboardKpiItem`, `ReceivableItem`, `RecentActivityItem`, `QuickActionItem`, `FinancialSummaryItem`, `SidebarNavItem`.

### `data.ts`

Mocks consumidos pelos componentes:

| Export | Usado em |
|--------|----------|
| `dashboardKpiItems` | `DashboardKpis` |
| `financialSummaryItems` | `DashboardFinancialSummary` |
| `receivableItems` | `DashboardReceivables` |
| `recentActivityItems` | `DashboardRecentActivities` |
| `quickActionItems` | `DashboardQuickActions` |
| `sidebarNavItems` | `DashboardSidebar` |
| `cashflowChartData` | `DashboardCashflow` |

### `icons.tsx`

- `NavIcon` — ícones SVG inline do menu
- `MiniSparkline` — mini gráfico de linha (sem lib externa)
- `RobotIcon` — ícone do card GuiMe AI

---

## Estilos compartilhados

### `dashboard.module.css`

Classes reutilizáveis entre cards:

- `.card`, `.cardTitle`, `.cardSubtitle`
- `.changeUp`, `.changeDown`
- `.btnPrimary`, `.btnGhost`, `.btnLink`
- `.iconBtn`, `.iconBtnPrimary`

### Tokens (`src/styles/theme.css`)

Consumidos via `var(--primary)`, `var(--secondary)`, `var(--background)`, `var(--text-primary)`, `var(--radius-sm|md|lg)`, etc.

**Não editar** `theme.css` a partir do dashboard — apenas consumir.

---

## Roteamento

Arquivo: `src/routes/private.routes.tsx`

```tsx
{
  element: <ProtectedRoute />,
  children: [
    {
      element: <MainLayout />,
      children: [
        { path: '/', element: <Navigate to="/dashboard" replace /> },
        { path: '/dashboard', element: <DashboardPage /> },
        // demais módulos…
      ],
    },
  ],
}
```

Menu da sidebar (`data.ts` → `sidebarNavItems`) espelha essas rotas.

**Item ativo (verde):** `DashboardSidebar` usa `useLocation()` + `isNavItemActive()` para aplicar `navItemActive` e `aria-current="page"`.

---

## Imports recomendados

```tsx
// Componentes do dashboard (barrel)
import {
  DashboardKpis,
  DashboardCashflow,
  DashboardSidebar,
} from '@/features/dashboard'

// Página
import { DashboardPage } from '@/pages/dashboard'

// Dados mock
import { dashboardKpiItems } from '@/features/dashboard/data'
```

---

## Responsividade

| Breakpoint | Comportamento |
|------------|----------------|
| Desktop (> 768px) | Sidebar fixa 280px; conteúdo com `margin-left: 280px` |
| Tablet (≤ 1200px) | Botão recolher sidebar → 80px |
| Mobile (≤ 768px) | Sidebar em drawer; header com botão menu |

Regras em: `DashboardSidebar.module.css`, `MainLayout.module.css`, `DashboardPage.module.css`, `DashboardHeader.module.css`.

---

## O que não faz parte deste módulo

Mantidos separados e **não modificados** pelo dashboard:

- `src/pages/auth/Login/` (Login + `LoginPage.module.css`)
- `src/layouts/AuthLayout/`
- `src/components/ui/Logo/`
- `src/styles/theme.css`

Legado (não usado pelo layout atual):

- `src/components/features/dashboard/KpiCard.tsx` — versão antiga; substituída por `DashboardKpis`

---

## Como estender

1. **Novo widget no dashboard** — criar `components/DashboardNovo.tsx` + `.module.css`, exportar em `index.ts`, importar em `DashboardPage.tsx`.
2. **Dados reais** — trocar imports de `data.ts` por hooks/services (React Query + `src/services/`).
3. **Nova rota no menu** — adicionar item em `sidebarNavItems` (`data.ts`) e rota em `private.routes.tsx`.
4. **Header customizado por página** — hoje é único no `MainLayout`; para variar, seria necessário refatorar o layout.

---

## Comando útil

```bash
npm run dev
# Acesse: http://localhost:5173/dashboard (após login)
```
