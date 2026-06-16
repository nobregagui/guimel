# GuiMe Money (erp-GuiMe)

Frontend de um ERP SaaS moderno construído com React, TypeScript e Vite.

**GuiMe Money** — Sistema ERP para gestão financeira inteligente.

## Visão geral

| Item | Valor |
|------|-------|
| **Nome do pacote** | `erp-GuiMe` |
| **Produto** | GuiMe Money — Sistema ERP |
| **Tipo** | ERP SaaS (frontend) |
| **Stack principal** | React 19 + TypeScript + Vite 8 |
| **Estado atual** | Arquitetura base + tela de login completa; dashboard com KPIs mockados; demais módulos em placeholder |

## Stack tecnológica

### Em uso

| Tecnologia | Uso |
|------------|-----|
| React 19 | Interface |
| TypeScript 6 | Tipagem |
| Vite 8 | Build e dev server |
| React Router DOM 7 | Rotas e layouts |
| Zustand | Estado global (auth + UI) |
| TanStack React Query | Cache e requisições assíncronas |
| Axios | Cliente HTTP |
| Zod | Validações (login + utils) |
| React Hook Form | Formulário de login com validação Zod |
| CSS Modules | Estilos da tela de login (`LoginPage.module.css`) |

### Instaladas (próximos passos)

| Tecnologia | Status |
|------------|--------|
| TailwindCSS 4 | Instalada; estilos atuais usam CSS variables + CSS Modules |
| Lucide React | Instalada; login usa ícones SVG inline |
| clsx | Instalada; ainda não usada |
| Shadcn UI | Não configurado |

## Pré-requisitos

- Node.js 18+
- npm

## Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd erp-GuiMe

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

### Variáveis de ambiente

```env
VITE_API_URL=http://localhost:3333/api
```

Se `VITE_API_URL` não estiver definida, o fallback é `http://localhost:3333/api`.

## Scripts

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `npm run dev` | Servidor de desenvolvimento |
| `build` | `npm run build` | Type-check + build de produção |
| `lint` | `npm run lint` | Lint do projeto |
| `preview` | `npm run preview` | Preview do build |

## Alias de imports

O projeto usa o alias `@` apontando para `src/`:

```tsx
import { Button, Logo } from '@/components/ui'
import { useAuthStore } from '@/store'
import type { User } from '@/types'
```

Configurado em `vite.config.ts` e `tsconfig.app.json`.

## Fluxo da aplicação

```
index.html
  └── main.tsx
        ├── QueryClientProvider (React Query)
        └── App.tsx
              └── RouterProvider
                    ├── Rotas públicas → AuthLayout (100dvh, sem scroll)
                    └── Rotas privadas → ProtectedRoute → MainLayout
```

**Bootstrap (`src/main.tsx`):**

1. Importa estilos globais (`@/app/index.css`, `@/styles/theme.css`)
2. Monta `QueryClientProvider` com `@/lib/react-query`
3. Renderiza `App` com `RouterProvider`

## Estrutura do projeto

```
erp-GuiMe/
├── .env.example
├── index.html                    # title: GuiMe Money
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── main.tsx
│   ├── app/                      # Shell da aplicação
│   ├── assets/
│   │   ├── logo.png              # Logo oficial GuiMe Money
│   │   ├── hero.png
│   │   └── …
│   ├── components/
│   │   ├── ui/                   # Button, Input, Card, Logo…
│   │   ├── layout/               # Sidebar, Header, Footer
│   │   └── features/             # Componentes por domínio
│   ├── hooks/
│   ├── layouts/                  # AuthLayout, MainLayout
│   ├── lib/                      # React Query
│   ├── mocks/
│   ├── pages/
│   │   └── auth/
│   │       └── Login/
│   │           ├── index.tsx
│   │           └── LoginPage.module.css
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── styles/                   # theme.css (design tokens)
│   ├── types/
│   └── utils/
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
└── package.json
```

## Branding

| Item | Detalhe |
|------|---------|
| **Marca** | GuiMe Money |
| **Subtítulo** | Sistema ERP |
| **Logo** | `src/assets/logo.png` |
| **Componente** | `@/components/ui/Logo` |

### Componente `Logo`

Componente reutilizável que compensa o **padding embutido na PNG** (espaço vazio ao redor do mark):

```tsx
<Logo height={65} width={200} compensation={3.2} />
```

| Prop | Descrição |
|------|-----------|
| `height` | Altura visual do container |
| `width` | Largura do container (recorte horizontal) |
| `compensation` | Fator de ampliação da imagem para remover padding da PNG (padrão: `2.15`) |

**Onde é usado:**

| Local | Configuração |
|-------|--------------|
| Login — painel esquerdo | `height={56}` |
| Login — formCard | `height={65}`, `compensation={3.2}` |
| Login — mockup dashboard | `height={22}`, `compensation={2.1}` |
| Sidebar | `height={44}` |
| Header | `height={40}` |
| Footer | `height={32}` |

## Tela de Login

Implementação completa em `src/pages/auth/Login/`:

| Aspecto | Detalhe |
|---------|---------|
| **Layout** | Split screen — painel esquerdo (marketing) + painel direito (formulário) |
| **Estilos** | CSS Modules (`LoginPage.module.css`) + tokens de `theme.css` |
| **Formulário** | React Hook Form + validação Zod (`loginSchema`) |
| **Auth** | Login mockado via `useAuthStore` (simula latência de 1s) |
| **Viewport** | Sem scroll vertical (`100dvh`, overflow hidden) |
| **OAuth UI** | Botões Google e Microsoft (visual apenas) |
| **Extras** | Mockup animado do dashboard, badge GuiMe Money AI, trust badges |

**Painel esquerdo:**
- Logo GuiMe Money
- Headline + subheadline
- Mockup interativo (KPIs, fluxo de caixa, saúde financeira, insights IA)
- Badge "Powered by GuiMe Money AI"

**Painel direito (formCard):**
- Logo centralizado (`height: 65px`)
- Campos e-mail e senha com toggle de visibilidade
- Remember me + link esqueci senha
- Login social (Google / Microsoft)
- Trust badges (SSL, LGPD, Bank-grade, Uptime)

### AuthLayout

Layout minimalista para rotas públicas:

- Ocupa `100dvh` sem scroll
- Sem header, footer ou card wrapper
- Renderiza `<Outlet />` em tela cheia (login controla seu próprio layout)

## Rotas

### Públicas (`/auth/*`) — AuthLayout

| Rota | Página |
|------|--------|
| `/auth` | Login |
| `/auth/login` | Login |
| `/auth/register` | Register |
| `/auth/forgot-password` | ForgotPassword |

### Privadas — ProtectedRoute + MainLayout

| Rota | Página |
|------|--------|
| `/` | Dashboard |
| `/dashboard` | Dashboard |
| `/clientes` | Clientes |
| `/produtos` | Produtos |
| `/financeiro` | Financeiro |
| `/vendas` | Vendas |
| `/relatorios` | Relatórios |

Rotas desconhecidas redirecionam para `/dashboard`.

A proteção de rotas usa `isAuthenticated` do Zustand. Se não autenticado, redireciona para `/auth/login`.

## Camadas

### Estado global (Zustand)

**`useAuthStore`**

| Campo / Ação | Descrição |
|--------------|-----------|
| `user` | Usuário logado |
| `token` | Token de sessão |
| `isAuthenticated` | Flag de autenticação |
| `login()` | Define user + token |
| `logout()` | Limpa sessão |

**`useAppStore`**

| Campo / Ação | Descrição |
|--------------|-----------|
| `sidebarOpen` | Controle da sidebar |
| `toggleSidebar()` | Alterna visibilidade |

> A sessão ainda não persiste em `localStorage` — o estado é perdido ao recarregar a página.

### API (Axios + Services)

Instância central em `src/services/api.ts`:

- `baseURL`: `VITE_API_URL` ou fallback local
- `timeout`: 10s
- Headers: `Content-Type` e `Accept` JSON

| Service | Endpoints preparados |
|---------|---------------------|
| `authService` | `POST /auth/login`, `POST /auth/register` |
| `clienteService` | `GET /clientes`, `POST /clientes` |
| `produtoService` | `GET /produtos`, `POST /produtos` |
| `financeiroService` | `GET /financeiro` |

### React Query

Configurado em `src/lib/react-query.ts`:

- `staleTime`: 60s
- `retry` (queries): 1
- `refetchOnWindowFocus`: false

Provider ativo em `main.tsx`. Queries/mutations nas páginas ainda serão implementadas.

### Tipagens (`src/types/`)

| Arquivo | Conteúdo |
|---------|----------|
| `auth.ts` | `User`, `LoginPayload`, `RegisterPayload`, `AuthSession` |
| `cliente.ts` | `Cliente`, `CreateClientePayload` |
| `produto.ts` | `Produto`, `CreateProdutoPayload` |
| `financeiro.ts` | `LancamentoFinanceiro`, `LancamentoTipo` |
| `common.ts` | `ApiResponse`, `PaginatedResponse`, `PaginationMeta` |

### Utilitários (`src/utils/`)

| Arquivo | Funções |
|---------|---------|
| `currency.ts` | `formatCurrency()` |
| `date.ts` | `formatDate()` |
| `masks.ts` | `cpfMask()`, `cnpjMask()`, `phoneMask()` |
| `validations.ts` | Schemas Zod reutilizáveis |

### Hooks (`src/hooks/`)

| Hook | Responsabilidade |
|------|------------------|
| `useAuth()` | Wrapper sobre `useAuthStore` |
| `useDebounce()` | Debounce genérico |
| `usePagination()` | Controle de paginação |
| `usePermissions()` | `can()`, `canSome()` por permissão |

## Design system

Tokens em `src/styles/theme.css`:

| Token | Valor |
|-------|-------|
| `--primary` | `#16A34A` |
| `--primary-dark` | `#15803D` |
| `--secondary` | `#F97316` |
| `--background` | `#F8FAFC` |
| `--text-primary` | `#18181B` |
| `--text-secondary` | `#71717A` |
| `--radius-sm/md/lg` | `12px / 20px / 28px` |

Estilos globais base em `src/app/index.css` (`html`, `body`, `#root` com `height: 100%`).

## Status dos módulos

| Módulo | Status |
|--------|--------|
| **Auth (Login)** | Implementado — split layout, RHF + Zod, login mockado, CSS Modules |
| Auth (Register / Forgot) | UI básica; sem lógica de submit |
| Dashboard | KPIs mockados (`src/mocks/dashboard.ts`) |
| Clientes | Placeholder |
| Produtos | Placeholder |
| Financeiro | Placeholder |
| Vendas | Placeholder |
| Relatórios | Placeholder |
| Branding / Logo | Implementado em toda a aplicação |
| Services HTTP | Tipados; aguardando backend |
| React Query | Infra pronta; sem queries nas páginas |

## Convenções

- Imports com alias `@/`
- Componentes funcionais com TypeScript estrito
- Páginas exportam funções nomeadas (`LoginPage`, `DashboardPage`…)
- Páginas complexas usam CSS Modules co-localizados (`LoginPage.module.css`)
- Barrel exports em `index.ts` (`components/ui`, `hooks`, `types`, etc.)
- Rotas separadas em `public.routes.tsx` e `private.routes.tsx`
- Layouts usam `<Outlet />` do React Router

## Roadmap

- [ ] Persistir sessão com `zustand/persist`
- [ ] Conectar login ao `authService` (substituir mock)
- [ ] Instalar `@hookform/resolvers` e usar `zodResolver` no login
- [ ] Replicar layout do login em Register e ForgotPassword
- [ ] Configurar TailwindCSS + Shadcn UI
- [ ] Criar hooks de query por domínio (`useClientes`, `useProdutos`…)
- [ ] Interceptor Axios para injetar token de autenticação
- [ ] Evoluir páginas placeholder para CRUD completo
- [ ] Guards de permissão com `usePermissions()` nas rotas

## Licença

Projeto privado.
