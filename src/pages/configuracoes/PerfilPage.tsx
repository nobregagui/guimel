import styles from './PerfilPage.module.css'

export function PerfilPage() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Perfil da Empresa</h1>
          <p className={styles.pageDescription}>
            Gerencie as informações da sua empresa e da conta principal.
          </p>
        </div>

        <button type="button" className={styles.btnPrimary}>
          Salvar alterações
        </button>
      </header>

      <div className={styles.body}>
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

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="cep">CEP</label>
                <input id="cep" />
              </div>

              <div className={styles.field}>
                <label htmlFor="rua">Rua</label>
                <input id="rua" />
              </div>

              <div className={styles.field}>
                <label htmlFor="numero">Número</label>
                <input id="numero" />
              </div>

              <div className={styles.field}>
                <label htmlFor="bairro">Bairro</label>
                <input id="bairro" />
              </div>

              <div className={styles.field}>
                <label htmlFor="cidade">Cidade</label>
                <input id="cidade" />
              </div>

              <div className={styles.field}>
                <label htmlFor="estado">Estado</label>
                <input id="estado" />
              </div>
            </div>
          </section>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Usuário Responsável</h2>
            </div>

            <div className={styles.userSection}>
              <div className={styles.avatar}>AM</div>

              <div className={styles.userInfo}>
                <div className={styles.field}>
                  <label htmlFor="nome-usuario">Nome</label>
                  <input id="nome-usuario" defaultValue="Alexandre Martins" />
                </div>

                <div className={styles.field}>
                  <label htmlFor="email-usuario">E-mail</label>
                  <input id="email-usuario" defaultValue="alexandre@email.com" />
                </div>

                <div className={styles.field}>
                  <label htmlFor="cargo">Cargo</label>
                  <input id="cargo" defaultValue="Administrador" />
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
    </div>
  )
}
