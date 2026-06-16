/**
 * src/pages/auth/LoginPage.tsx
 *
 * Tela de login do GuiMe Money.
 * Stack: React 19 · TypeScript · React Hook Form · Zod · Zustand (useAuthStore)
 * Estilos: CSS variables (theme.css) + módulo CSS local (LoginPage.module.css)
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { Logo } from '@/components/ui'
import styles from './LoginPage.module.css'

// ─── Schema de validação ────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('Informe um e-mail válido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter ao menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

// ─── Ícones inline (Lucide-like, sem dependência extra) ─────────────────────

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const BankIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

// ─── Google Logo ─────────────────────────────────────────────────────────────

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

// ─── Microsoft Logo ───────────────────────────────────────────────────────────

const MicrosoftLogo = () => (
  <svg width="20" height="20" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
)

// ─── Dashboard Mockup (lado esquerdo) ────────────────────────────────────────

const DashboardMockup = () => (
  <div className={styles.mockupWrapper} aria-hidden="true">

    {/* Card principal — visão geral */}
    <div className={`${styles.mockupCard} ${styles.mockupCardMain}`}>
      <div className={styles.mockupHeader}>
        <div className={styles.mockupLogo}>
          <Logo height={0} imgHeight={56} />
        </div>
        <div className={styles.mockupSearch} />
      </div>

      <div className={styles.mockupTitle}>Visão Geral</div>

      <div className={styles.mockupKpis}>
        <div className={styles.mockupKpi}>
          <span className={styles.mockupKpiLabel}>Contas a Receber</span>
          <span className={styles.mockupKpiValue}>R$ 324.650,00</span>
          <span className={styles.mockupKpiBadgeGreen}>+12,9% este mês</span>
        </div>
        <div className={styles.mockupKpi}>
          <span className={styles.mockupKpiLabel}>Contas a Pagar</span>
          <span className={styles.mockupKpiValue}>R$ 198.420,00</span>
          <span className={styles.mockupKpiBadgeRed}>-6,3% este mês</span>
        </div>
      </div>

      <div className={styles.mockupSectionLabel}>Movimentações</div>
      <div className={styles.mockupTransactions}>
        {[
          { icon: '🔴', label: 'Foo', type: 'D' },
          { icon: '🟢', label: 'Recebimento Cliente A', type: 'C' },
          { icon: '🔵', label: 'Pagamento Fornecedor B', type: 'D' },
          { icon: '⚪', label: 'Transferência', type: 'T' },
        ].map((t, i) => (
          <div key={i} className={styles.mockupTxRow}>
            <span className={styles.mockupTxDot} />
            <span className={styles.mockupTxLabel}>{t.label}</span>
            <span className={styles.mockupTxTag}>{t.type}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Card flutuante — crescimento da receita */}
    <div className={`${styles.mockupCard} ${styles.mockupCardGrowth}`}>
      <div className={styles.mockupGrowthLabel}>Crescimento da Receita</div>
      <div className={styles.mockupGrowthValue}>+24,8%</div>
      <div className={styles.mockupGrowthSub}>vs mês anterior</div>
      <div className={styles.mockupMiniChart}>
        <svg viewBox="0 0 80 30" className={styles.mockupLine}>
          <polyline points="0,25 15,20 30,22 45,12 60,8 80,4" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>

    {/* Card flutuante — fluxo de caixa */}
    <div className={`${styles.mockupCard} ${styles.mockupCardCash}`}>
      <div className={styles.mockupCashLabel}>Fluxo de Caixa</div>
      <div className={styles.mockupCashValue}>R$ 186.430,00</div>
      <div className={styles.mockupCashSub}>Saldo atual</div>
      <div className={styles.mockupBars}>
        {[60, 80, 45, 90, 55, 70].map((h, i) => (
          <div
            key={i}
            className={styles.mockupBar}
            style={{
              height: `${h}%`,
              background: i % 2 === 0 ? '#16A34A' : '#F97316',
            }}
          />
        ))}
      </div>
    </div>

    {/* Card flutuante — saúde financeira */}
    <div className={`${styles.mockupCard} ${styles.mockupCardHealth}`}>
      <div className={styles.mockupHealthLabel}>Saúde Financeira</div>
      <div className={styles.mockupHealthGauge}>
        <svg viewBox="0 0 80 50">
          <path d="M 10 45 A 30 30 0 0 1 70 45" fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round"/>
          <path d="M 10 45 A 30 30 0 0 1 70 45" fill="none" stroke="#16A34A" strokeWidth="8" strokeLinecap="round"
            strokeDasharray="94" strokeDashoffset="18"/>
          <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="#18181B">92</text>
        </svg>
      </div>
      <div className={styles.mockupHealthTag}>Excelente</div>
    </div>

    {/* Card flutuante — Insights de IA */}
    <div className={`${styles.mockupCard} ${styles.mockupCardAI}`}>
      <div className={styles.mockupAIIcon}>✦</div>
      <div className={styles.mockupAITitle}>Insights de IA</div>
      <div className={styles.mockupAIText}>
        Identificamos uma oportunidade de economia de R$ 12.430 este mês.
      </div>
      <div className={styles.mockupAILink}>Ver insight →</div>
    </div>

  </div>
)

// ─── Componente principal ─────────────────────────────────────────────────────

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { rememberMe: false },
    // Validação manual via Zod — sem precisar de @hookform/resolvers
    // Quando instalar o pacote, troque por: resolver: zodResolver(loginSchema)
    resolver: async (values) => {
      const result = loginSchema.safeParse(values)
      if (result.success) return { values: result.data, errors: {} }
      return {
        values: {},
        errors: Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [
            k,
            { message: v?.[0] ?? 'Campo inválido', type: 'validation' },
          ]),
        ),
      }
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      // TODO: substituir pelo authService.login(data) quando o backend estiver pronto
      await new Promise((r) => setTimeout(r, 1000)) // simula latência
      // Adapte os argumentos conforme a assinatura real do seu useAuthStore.login()
      // Opção A — login(user, token):
      // login({ id: '1', name: 'Usuário', email: data.email, role: 'admin', permissions: [] }, 'mock-token-123')
      // Opção B — login({ user, token }):
      login({ user: { id: '1', name: 'Usuário', email: data.email, role: 'admin', permissions: [] }, token: 'mock-token-123' })
      navigate('/dashboard')
    } catch {
      // TODO: tratar erros da API (credenciais inválidas etc.)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.root}>
      {/* ── Lado esquerdo ── */}
      <div className={styles.leftPane}>
        <div className={styles.leftContent}>

          {/* Logo */}
          <div className={styles.brandTop}>
            <Logo />
          </div>

          {/* Headline */}
          <h1 className={styles.headline}>
            Controle financeiro
            <br />
            inteligente para
            <br />
            <span className={styles.headlineAccent}>empresas modernas.</span>
          </h1>

          <p className={styles.subheadline}>
            Centralize sua gestão financeira em um só lugar.
            Tenha visão completa do fluxo de caixa, contas a
            receber, contas a pagar, faturamento e integrações
            bancárias com inteligência artificial.
          </p>

          {/* Mockup do dashboard */}
          <DashboardMockup />

          {/* Badge IA */}
          <div className={styles.aiBadge}>
            <div className={styles.aiRobot} aria-hidden="true">🤖</div>
            <div>
              <div className={styles.aiBadgeTitle}>
                Powered by <span className={styles.aiBadgeAccent}>GuiMe Money AI</span>
              </div>
              <div className={styles.aiBadgeText}>
                Inteligência artificial trabalhando para analisar, prever e otimizar seus
                resultados financeiros automaticamente.
              </div>
              <button className={styles.aiBadgeLink}>
                Saiba mais sobre a IA →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lado direito — formulário ── */}
      <div className={styles.rightPane}>
        <div className={styles.formCard}>

          {/* Logo do card */}
          <div className={styles.formBrand}>
            <Logo />
          </div>

          <h2 className={styles.formTitle}>Bem-vindo de volta! 👋</h2>
          <p className={styles.formSubtitle}>Faça login para continuar</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>

            {/* Campo e-mail */}
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.label}>E-mail</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <span className={styles.errorMsg}>{errors.email.message}</span>
              )}
            </div>

            {/* Campo senha */}
            <div className={styles.fieldGroup}>
              <label htmlFor="password" className={styles.label}>Senha</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  className={`${styles.input} ${styles.inputPassword} ${errors.password ? styles.inputError : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.errorMsg}>{errors.password.message}</span>
              )}
            </div>

            {/* Lembrar de mim + Esqueci senha */}
            <div className={styles.rememberRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  {...register('rememberMe')}
                />
                <span className={styles.checkboxCustom} aria-hidden="true" />
                <span>Lembrar de mim</span>
              </label>
              <Link to="/auth/forgot-password" className={styles.forgotLink}>
                Esqueci minha senha
              </Link>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitBtn}
            >
              {isLoading ? (
                <span className={styles.spinner} aria-hidden="true" />
              ) : (
                <>
                  Entrar na plataforma
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>ou continue com</span>
            <span className={styles.dividerLine} />
          </div>

          {/* OAuth */}
          <div className={styles.oauthGroup}>
            <button className={styles.oauthBtn} type="button">
              <GoogleLogo />
              <span>Continuar com Google</span>
            </button>
            <button className={styles.oauthBtn} type="button">
              <MicrosoftLogo />
              <span>Continuar com Microsoft</span>
            </button>
          </div>

          {/* Criar conta */}
          <p className={styles.signupRow}>
            Ainda não tem uma conta?{' '}
            <Link to="/auth/register" className={styles.signupLink}>
              Criar conta
            </Link>
          </p>

          {/* Selos de segurança */}
          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <ShieldIcon />
              <div>
                <div className={styles.trustBadgeTitle}>SSL</div>
                <div className={styles.trustBadgeSub}>Secured</div>
              </div>
            </div>
            <div className={styles.trustBadge}>
              <CheckCircleIcon />
              <div>
                <div className={styles.trustBadgeTitle}>LGPD</div>
                <div className={styles.trustBadgeSub}>Compliant</div>
              </div>
            </div>
            <div className={styles.trustBadge}>
              <BankIcon />
              <div>
                <div className={styles.trustBadgeTitle}>Bank-grade</div>
                <div className={styles.trustBadgeSub}>Security</div>
              </div>
            </div>
            <div className={styles.trustBadge}>
              <ClockIcon />
              <div>
                <div className={styles.trustBadgeTitle}>99,9%</div>
                <div className={styles.trustBadgeSub}>Uptime</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}