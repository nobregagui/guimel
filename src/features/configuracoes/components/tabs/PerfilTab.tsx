import { useState } from 'react'

import { EnderecoFields } from '@/components/form/EnderecoFields'
import { useAuthStore } from '@/store'
import { EMPTY_ENDERECO } from '@/types/endereco'
import styles from '@/pages/configuracoes/PerfilPage.module.css'

function getIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

export function PerfilTab() {
  const user = useAuthStore((state) => state.user)
  const [endereco, setEndereco] = useState(EMPTY_ENDERECO)

  function handleEnderecoChange(field: keyof typeof endereco, value: string) {
    setEndereco((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className={styles.body}>
      <div className={styles.toolbar}>
        <p className={styles.fieldHint}>
          Atualize os dados da empresa e da conta principal do sistema.
        </p>
        <button type="button" className={styles.btnPrimary}>
          Salvar alterações
        </button>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Dados da Empresa</h2>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="nome-fantasia">Nome Fantasia</label>
              <input id="nome-fantasia" defaultValue="GuiMe Money" />
            </div>

            <div className={styles.field}>
              <label htmlFor="razao-social">Razão Social</label>
              <input id="razao-social" defaultValue="GuiMe Money LTDA" />
            </div>

            <div className={styles.field}>
              <label htmlFor="cnpj">CNPJ</label>
              <input id="cnpj" defaultValue="00.000.000/0001-00" />
            </div>

            <div className={styles.field}>
              <label htmlFor="regime">Regime Tributário</label>
              <select id="regime">
                <option>Simples Nacional</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="email-empresa">E-mail</label>
              <input id="email-empresa" defaultValue="contato@GuiMemoney.com" />
            </div>

            <div className={styles.field}>
              <label htmlFor="telefone-empresa">Telefone</label>
              <input id="telefone-empresa" defaultValue="(11) 99999-9999" />
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

          <EnderecoFields idPrefix="perfil" values={endereco} onChange={handleEnderecoChange} />
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
                <input id="nome-usuario" defaultValue={user?.name ?? ''} />
              </div>

              <div className={styles.field}>
                <label htmlFor="email-usuario">E-mail</label>
                <input id="email-usuario" defaultValue={user?.email ?? ''} />
              </div>

              <div className={styles.field}>
                <label htmlFor="cargo">Perfil de acesso</label>
                <input id="cargo" defaultValue={user?.role ?? 'admin'} readOnly />
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
              <strong>Plano Pro</strong>
            </div>

            <div className={styles.planRow}>
              <span>Usuários</span>
              <strong>1 / 5</strong>
            </div>

            <div className={styles.planRow}>
              <span>Próxima cobrança</span>
              <strong>15/07/2026</strong>
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
