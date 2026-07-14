import { useEffect, useState } from 'react'
import axios from 'axios'

import { EnderecoFields } from '@/components/form/EnderecoFields'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { MODULE_WRITE_PERMISSIONS } from '@/constants/permissions'
import { EmpresaLogoField } from '@/features/configuracoes/components/EmpresaLogoField'
import {
  useEmpresaQuery,
  useUpdateEmpresaMutation,
} from '@/features/configuracoes/hooks/useEmpresa'
import {
  REGIME_TRIBUTARIO_LABEL,
  REGIME_TRIBUTARIO_VALUES,
  type EmpresaFormState,
  type RegimeTributario,
} from '@/features/configuracoes/types/empresa'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthStore } from '@/store'
import { EMPTY_ENDERECO, type EnderecoFormValues } from '@/types/endereco'
import { getUserRoleLabel } from '@/utils/roles'
import styles from '@/pages/configuracoes/PerfilPage.module.css'

function getIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function toFormState(empresa: {
  nomeFantasia: string
  razaoSocial: string
  cnpj: string
  regimeTributario: RegimeTributario
  email: string
  telefone: string
  endereco: EnderecoFormValues | null
}): EmpresaFormState {
  return {
    nomeFantasia: empresa.nomeFantasia ?? '',
    razaoSocial: empresa.razaoSocial ?? '',
    cnpj: empresa.cnpj ?? '',
    regimeTributario: empresa.regimeTributario ?? 'simples_nacional',
    email: empresa.email ?? '',
    telefone: empresa.telefone ?? '',
    endereco: empresa.endereco ?? { ...EMPTY_ENDERECO },
  }
}

function getEmpresaSaveErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback
  const status = error.response?.status
  if (status === 404) {
    return 'Endpoint de empresa ainda não disponível no backend.'
  }
  if (typeof error.response?.data?.message === 'string') {
    return error.response.data.message
  }
  return fallback
}

export function PerfilTab() {
  const user = useAuthStore((state) => state.user)
  const { canWriteModule, isReadOnly } = usePermissions()
  const canEdit =
    canWriteModule([...MODULE_WRITE_PERMISSIONS.empresa]) && !isReadOnly

  const { showToast } = useToast()
  const empresaQuery = useEmpresaQuery()
  const updateMutation = useUpdateEmpresaMutation()

  const roleLabel = getUserRoleLabel(user?.role)
  const [form, setForm] = useState<EmpresaFormState | null>(null)

  useEffect(() => {
    if (!empresaQuery.data) return
    setForm(toFormState(empresaQuery.data))
  }, [empresaQuery.data])

  function handleEnderecoChange(field: keyof EnderecoFormValues, value: string) {
    setForm((prev) => {
      if (!prev) return prev
      return { ...prev, endereco: { ...prev.endereco, [field]: value } }
    })
  }

  async function handleSave() {
    if (!form || !canEdit) return

    try {
      await updateMutation.mutateAsync({
        nomeFantasia: form.nomeFantasia.trim(),
        razaoSocial: form.razaoSocial.trim(),
        cnpj: form.cnpj.trim(),
        regimeTributario: form.regimeTributario,
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        endereco: form.endereco,
      })
      showToast({ message: 'Dados da empresa salvos com sucesso.', variant: 'success' })
    } catch (error) {
      showToast({
        message: getEmpresaSaveErrorMessage(error, 'Não foi possível salvar as alterações.'),
        variant: 'error',
      })
    }
  }

  if (empresaQuery.isLoading && !form) {
    return (
      <div className={styles.body}>
        <Loading label="Carregando dados da empresa..." />
      </div>
    )
  }

  if (empresaQuery.isError && !form) {
    return (
      <div className={styles.body}>
        <div className={styles.infoBanner}>
          Não foi possível carregar o perfil da empresa. Confirme se o backend expõe{' '}
          <code>GET /api/empresa</code>.
          <div style={{ marginTop: 12 }}>
            <button type="button" className={styles.btnSecondary} onClick={() => void empresaQuery.refetch()}>
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  const values = form ?? {
    nomeFantasia: '',
    razaoSocial: '',
    cnpj: '',
    regimeTributario: 'simples_nacional' as const,
    email: '',
    telefone: '',
    endereco: { ...EMPTY_ENDERECO },
  }

  return (
    <div className={styles.body}>
      <div className={styles.toolbar}>
        <p className={styles.fieldHint}>
          Atualize os dados da empresa e o logo usado no sistema e nos PDFs de venda.
        </p>
        {canEdit ? (
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={updateMutation.isPending}
            onClick={() => void handleSave()}
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        ) : null}
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Identidade visual</h2>
        </div>
        <EmpresaLogoField canEdit={canEdit} />
      </section>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Dados da Empresa</h2>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="nome-fantasia">Nome Fantasia</label>
              <input
                id="nome-fantasia"
                value={values.nomeFantasia}
                disabled={!canEdit}
                onChange={(event) =>
                  setForm((prev) =>
                    prev ? { ...prev, nomeFantasia: event.target.value } : prev,
                  )
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="razao-social">Razão Social</label>
              <input
                id="razao-social"
                value={values.razaoSocial}
                disabled={!canEdit}
                onChange={(event) =>
                  setForm((prev) =>
                    prev ? { ...prev, razaoSocial: event.target.value } : prev,
                  )
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="cnpj">CNPJ</label>
              <input
                id="cnpj"
                value={values.cnpj}
                disabled={!canEdit}
                onChange={(event) =>
                  setForm((prev) => (prev ? { ...prev, cnpj: event.target.value } : prev))
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="regime">Regime Tributário</label>
              <select
                id="regime"
                value={values.regimeTributario}
                disabled={!canEdit}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? { ...prev, regimeTributario: event.target.value as RegimeTributario }
                      : prev,
                  )
                }
              >
                {REGIME_TRIBUTARIO_VALUES.map((regime) => (
                  <option key={regime} value={regime}>
                    {REGIME_TRIBUTARIO_LABEL[regime]}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="email-empresa">E-mail</label>
              <input
                id="email-empresa"
                type="email"
                value={values.email}
                disabled={!canEdit}
                onChange={(event) =>
                  setForm((prev) => (prev ? { ...prev, email: event.target.value } : prev))
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="telefone-empresa">Telefone</label>
              <input
                id="telefone-empresa"
                value={values.telefone}
                disabled={!canEdit}
                onChange={(event) =>
                  setForm((prev) =>
                    prev ? { ...prev, telefone: event.target.value } : prev,
                  )
                }
              />
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Endereço</h2>
          </div>

          <p className={styles.fieldHint}>
            Informe o CEP para preencher logradouro, bairro, cidade e estado automaticamente.
          </p>

          <EnderecoFields
            idPrefix="perfil"
            values={values.endereco}
            onChange={handleEnderecoChange}
          />
        </section>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Usuário Responsável</h2>
          </div>

          <div className={styles.userSection}>
            <div className={styles.avatar}>{getIniciais(user?.name ?? 'Usuário')}</div>

            <div className={styles.userInfo}>
              <div className={styles.field}>
                <label htmlFor="nome-usuario">Nome</label>
                <input id="nome-usuario" defaultValue={user?.name ?? ''} readOnly />
              </div>

              <div className={styles.field}>
                <label htmlFor="email-usuario">E-mail</label>
                <input id="email-usuario" defaultValue={user?.email ?? ''} readOnly />
              </div>

              <div className={styles.field}>
                <label htmlFor="cargo">Perfil de acesso</label>
                <input id="cargo" value={roleLabel} readOnly />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Plano e Assinatura</h2>
          </div>

          <div className={styles.planInfo}>
            <div className={styles.planRow}>
              <span>Plano atual</span>
              <strong>{empresaQuery.data?.planoNome ?? 'Plano Pro'}</strong>
            </div>

            <div className={styles.planRow}>
              <span>Usuários</span>
              <strong>1 / 5</strong>
            </div>

            <div className={styles.planRow}>
              <span>Próxima cobrança</span>
              <strong>—</strong>
            </div>

            <button type="button" className={styles.btnSecondary}>
              Gerenciar plano
            </button>
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Segurança</h2>
        </div>

        <div className={styles.securityGrid}>
          <button type="button" className={styles.securityCard}>
            Alterar senha
          </button>

          <button type="button" className={styles.securityCard}>
            Autenticação em 2 fatores
          </button>

          <button type="button" className={styles.securityCard}>
            Sessões ativas
          </button>
        </div>
      </section>
    </div>
  )
}
