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
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

import { useAuthStore } from '@/store'
import { authService } from '@/services/auth.service'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { getFirstAccessibleRoute } from '@/utils/navigation'
import { Logo } from '@/components/ui'
import { AuthDashboardMockup } from '@/pages/auth/shared/AuthDashboardMockup'
import { AuthTrustBadges } from '@/pages/auth/shared/AuthTrustBadges'
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from '@/pages/auth/shared/authIcons'
import styles from './LoginPage.module.css'

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

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { rememberMe: false },
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
    setAuthError(null)
    try {
      const session = await authService.login({
        email: data.email,
        password: data.password,
      })
      login({ user: session.user, token: session.token })
      navigate(getFirstAccessibleRoute(session.user.permissions))
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setAuthError('E-mail ou senha inválidos')
      } else {
        setAuthError(getApiErrorMessage(error, 'Não foi possível entrar. Tente novamente.'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.leftPane}>
        <div className={styles.leftContent}>
          <div className={styles.brandTop}>
            <Logo />
          </div>

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

          <AuthDashboardMockup />

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
              <button type="button" className={styles.aiBadgeLink}>
                Saiba mais sobre a IA →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPane}>
        <div className={styles.formCard}>
          <div className={styles.formBrand}>
            <Logo />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
            {authError ? (
              <div className={styles.errorMsg} role="alert">
                {authError}
              </div>
            ) : null}

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
              {errors.email ? (
                <span className={styles.errorMsg}>{errors.email.message}</span>
              ) : null}
            </div>

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
              {errors.password ? (
                <span className={styles.errorMsg}>{errors.password.message}</span>
              ) : null}
            </div>

            <div className={styles.rememberRow}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkbox} {...register('rememberMe')} />
                <span className={styles.checkboxCustom} aria-hidden="true" />
                <span>Lembrar de mim</span>
              </label>
              <Link to="/auth/forgot-password" className={styles.forgotLink}>
                Esqueci minha senha
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className={styles.submitBtn}>
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
          <AuthTrustBadges />
        </div>
      </div>
    </div>
  )
}
