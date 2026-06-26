import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { useToast } from '@/components/ui/Toast'
import { FORMA_PAGAMENTO_TABLE_FILTROS } from '@/features/financeiro/data/shared'
import { useFinanceiroStore } from '@/features/financeiro/store/useFinanceiroStore'
import type {
  ExtratoMovimentoTipo,
  FinanceiroAba,
  FormaPagamento,
  LancamentoStatus,
  LancamentoTipo,
  ModoLancamentoContaPagar,
  TipoCustoPagar,
  TransferenciaStatus,
} from '@/features/financeiro/types'
import { OPCOES_REPETICAO_CONTA_PAGAR } from '@/features/financeiro/types'
import { descreverRecorrenciaContaPagar, formatBRL } from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

const HOJE_ISO = new Date().toISOString().slice(0, 10)

interface FinanceiroFormDrawerProps {
  open: boolean
  tipo: FinanceiroAba
  onClose: () => void
}

const DRAWER_META: Record<FinanceiroAba, { title: string; subtitle: string }> = {
  'visao-geral': {
    title: 'Novo lançamento',
    subtitle: 'Registre uma receita ou despesa do fluxo de caixa.',
  },
  'a-pagar': {
    title: 'Nova conta a pagar',
    subtitle: 'Cadastre um título a pagar com vencimento e forma de pagamento.',
  },
  'a-receber': {
    title: 'Nova conta a receber',
    subtitle: 'Cadastre um título a receber de um cliente.',
  },
  extrato: {
    title: 'Conciliar extrato',
    subtitle: 'Lance uma movimentação bancária e atualize o saldo da conta.',
  },
  transferencias: {
    title: 'Nova transferência',
    subtitle: 'Movimente valores entre as contas da empresa.',
  },
}

export function FinanceiroFormDrawer({ open, tipo, onClose }: FinanceiroFormDrawerProps) {
  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const meta = DRAWER_META[tipo]

  return (
    <div className={styles.drawerRoot}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar formulário" />

      <aside className={styles.drawerPanel} role="dialog" aria-modal="true" aria-labelledby="financeiro-drawer-title">
        <header className={styles.drawerHeader}>
          <div>
            <h2 id="financeiro-drawer-title" className={styles.drawerTitle}>{meta.title}</h2>
            <p className={styles.drawerSubtitle}>{meta.subtitle}</p>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        <FormBody key={tipo} tipo={tipo} onClose={onClose} />
      </aside>
    </div>
  )
}

function FormBody({ tipo, onClose }: { tipo: FinanceiroAba; onClose: () => void }) {
  switch (tipo) {
    case 'a-pagar':
      return <ContaPagarForm onClose={onClose} />
    case 'a-receber':
      return <ContaReceberForm onClose={onClose} />
    case 'extrato':
      return <ExtratoForm onClose={onClose} />
    case 'transferencias':
      return <TransferenciaForm onClose={onClose} />
    default:
      return <LancamentoForm onClose={onClose} />
  }
}

function Footer({ label, onClose, disabled }: { label: string; onClose: () => void; disabled?: boolean }) {
  return (
    <footer className={styles.drawerFooter}>
      <button type="button" className={styles.btnSecondary} onClick={onClose}>
        Cancelar
      </button>
      <button type="submit" className={styles.btnPrimary} disabled={disabled}>
        {label}
      </button>
    </footer>
  )
}

const FORMA_PAGAMENTO_OPTIONS = FORMA_PAGAMENTO_TABLE_FILTROS
const STATUS_TITULO_OPTIONS: { id: LancamentoStatus; label: string }[] = [
  { id: 'pendente', label: 'Pendente' },
  { id: 'pago', label: 'Pago' },
  { id: 'vencido', label: 'Vencido' },
]

function parseValor(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function LancamentoForm({ onClose }: { onClose: () => void }) {
  const addLancamento = useFinanceiroStore((s) => s.addLancamento)

  const [descricao, setDescricao] = useState('')
  const [subDescricao, setSubDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [tipo, setTipo] = useState<LancamentoTipo>('receber')
  const [vencimentoIso, setVencimentoIso] = useState(HOJE_ISO)
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState<LancamentoStatus>('pendente')
  const [erro, setErro] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!descricao.trim()) return setErro('Informe a descrição do lançamento.')
    if (parseValor(valor) <= 0) return setErro('Informe um valor maior que zero.')

    addLancamento({
      descricao: descricao.trim(),
      subDescricao: subDescricao.trim(),
      categoria: categoria.trim(),
      tipo,
      vencimentoIso,
      valor: parseValor(valor),
      status,
    })
    onClose()
  }

  return (
    <form className={styles.drawerBody} onSubmit={handleSubmit}>
      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Tipo de lançamento</legend>
        <div className={styles.tipoSelector}>
          <label className={`${styles.tipoOption} ${tipo === 'receber' ? styles.tipoOptionActive : ''}`}>
            <input type="radio" name="tipo" value="receber" checked={tipo === 'receber'} onChange={() => setTipo('receber')} />
            A receber
          </label>
          <label className={`${styles.tipoOption} ${tipo === 'pagar' ? styles.tipoOptionActive : ''}`}>
            <input type="radio" name="tipo" value="pagar" checked={tipo === 'pagar'} onChange={() => setTipo('pagar')} />
            A pagar
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Dados do lançamento</legend>
        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.fieldFull}`}>
            <label htmlFor="lc-descricao">Descrição *</label>
            <input id="lc-descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="ex: Cliente Alfa Ltda." />
          </div>
          <div className={styles.formField}>
            <label htmlFor="lc-sub">Detalhe / documento</label>
            <input id="lc-sub" value={subDescricao} onChange={(e) => setSubDescricao(e.target.value)} placeholder="ex: NF-e 00142" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="lc-categoria">Categoria</label>
            <input id="lc-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="ex: Serviços prestados" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="lc-vencimento">Vencimento</label>
            <input id="lc-vencimento" type="date" value={vencimentoIso} onChange={(e) => setVencimentoIso(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label htmlFor="lc-valor">Valor (R$) *</label>
            <input id="lc-valor" type="number" min={0} step={0.01} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="lc-status">Status</label>
            <select id="lc-status" value={status} onChange={(e) => setStatus(e.target.value as LancamentoStatus)}>
              {STATUS_TITULO_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        {erro ? <span className={styles.fieldError}>{erro}</span> : null}
      </fieldset>

      <Footer label="Salvar lançamento" onClose={onClose} />
    </form>
  )
}

function ContaPagarForm({ onClose }: { onClose: () => void }) {
  const addContaPagar = useFinanceiroStore((s) => s.addContaPagar)
  const { showToast } = useToast()

  const [fornecedor, setFornecedor] = useState('')
  const [documento, setDocumento] = useState('')
  const [categoria, setCategoria] = useState('')
  const [vencimentoIso, setVencimentoIso] = useState(HOJE_ISO)
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('boleto')
  const [status, setStatus] = useState<LancamentoStatus>('pendente')
  const [modoLancamento, setModoLancamento] = useState<ModoLancamentoContaPagar>('unico')
  const [tipoCusto, setTipoCusto] = useState<TipoCustoPagar>('variavel')
  const [repeticoes, setRepeticoes] = useState(OPCOES_REPETICAO_CONTA_PAGAR[3].vezes)
  const [erro, setErro] = useState('')

  const valorNumerico = parseValor(valor)
  const isRecorrente = modoLancamento === 'recorrente'
  const repeticoesEfetivas = isRecorrente ? repeticoes : 1

  function handleModoChange(modo: ModoLancamentoContaPagar) {
    setModoLancamento(modo)
    if (modo === 'recorrente' && tipoCusto === 'variavel') {
      setTipoCusto('fixo')
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!fornecedor.trim()) return setErro('Informe o fornecedor.')
    if (valorNumerico <= 0) return setErro('Informe um valor maior que zero.')

    const quantidade = addContaPagar({
      fornecedor: fornecedor.trim(),
      documento: documento.trim(),
      categoria: categoria.trim(),
      vencimentoIso,
      valor: valorNumerico,
      formaPagamento,
      status,
      modoLancamento,
      tipoCusto,
      repeticoes: repeticoesEfetivas,
    })

    if (isRecorrente) {
      showToast({
        message: `${quantidade} títulos recorrentes gerados (${repeticoesEfetivas}× · todo mês).`,
        variant: 'success',
      })
    }

    onClose()
  }

  return (
    <form className={styles.drawerBody} onSubmit={handleSubmit}>
      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Modo do lançamento</legend>
        <div className={styles.tipoSelector}>
          <label className={`${styles.tipoOption} ${modoLancamento === 'unico' ? styles.tipoOptionActive : ''}`}>
            <input
              type="radio"
              name="cp-modo-lancamento"
              value="unico"
              checked={modoLancamento === 'unico'}
              onChange={() => handleModoChange('unico')}
            />
            Lançamento único
          </label>
          <label className={`${styles.tipoOption} ${modoLancamento === 'recorrente' ? styles.tipoOptionActive : ''}`}>
            <input
              type="radio"
              name="cp-modo-lancamento"
              value="recorrente"
              checked={modoLancamento === 'recorrente'}
              onChange={() => handleModoChange('recorrente')}
            />
            Lançamento recorrente
          </label>
        </div>
        <p className={styles.formHint}>
          {isRecorrente
            ? 'Gera vários títulos automaticamente, um por mês, com o mesmo valor e dia de vencimento.'
            : 'Registra apenas este título, sem repetir nos meses seguintes.'}
        </p>
      </fieldset>

      {isRecorrente ? (
        <fieldset className={styles.formSection}>
          <legend className={styles.formLegend}>Quantas vezes repetir?</legend>
          <div className={styles.repeticoesGrid}>
            {OPCOES_REPETICAO_CONTA_PAGAR.map((opcao) => {
              const ativa = repeticoes === opcao.vezes
              return (
                <label
                  key={opcao.vezes}
                  className={`${styles.repeticaoOption} ${ativa ? styles.repeticaoOptionActive : ''}`}
                >
                  <input
                    type="radio"
                    name="cp-repeticoes"
                    checked={ativa}
                    onChange={() => setRepeticoes(opcao.vezes)}
                  />
                  <span className={styles.repeticaoOptionLabel}>{opcao.label}</span>
                  <span className={styles.repeticaoOptionDesc}>{opcao.descricao}</span>
                </label>
              )
            })}
          </div>
          <div className={styles.recorrenciaResumo}>
            <p>{descreverRecorrenciaContaPagar(repeticoes, vencimentoIso)}</p>
            {valorNumerico > 0 ? (
              <p className={styles.recorrenciaResumoTotal}>
                Total programado: {formatBRL(valorNumerico * repeticoes)}
              </p>
            ) : null}
          </div>
        </fieldset>
      ) : null}

      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Natureza do custo</legend>
        <div className={styles.tipoSelector}>
          <label className={`${styles.tipoOption} ${tipoCusto === 'fixo' ? styles.tipoOptionActive : ''}`}>
            <input
              type="radio"
              name="cp-tipo-custo"
              value="fixo"
              checked={tipoCusto === 'fixo'}
              onChange={() => setTipoCusto('fixo')}
            />
            Custo fixo
          </label>
          <label className={`${styles.tipoOption} ${tipoCusto === 'variavel' ? styles.tipoOptionActive : ''}`}>
            <input
              type="radio"
              name="cp-tipo-custo"
              value="variavel"
              checked={tipoCusto === 'variavel'}
              onChange={() => setTipoCusto('variavel')}
            />
            Custo variável
          </label>
        </div>
        <p className={styles.formHint}>
          {tipoCusto === 'fixo'
            ? 'Valor estável todo mês (ex.: aluguel, internet, folha).'
            : 'Valor que pode mudar a cada competência (ex.: energia, compras avulsas).'}
        </p>
      </fieldset>

      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Dados do título</legend>
        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.fieldFull}`}>
            <label htmlFor="cp-fornecedor">Fornecedor *</label>
            <input id="cp-fornecedor" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} placeholder="ex: Fornecedor Beta S.A." />
          </div>
          <div className={styles.formField}>
            <label htmlFor="cp-documento">Documento</label>
            <input id="cp-documento" value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="ex: Boleto #8821" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="cp-categoria">Categoria</label>
            <input id="cp-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="ex: Compras" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="cp-vencimento">Vencimento</label>
            <input id="cp-vencimento" type="date" value={vencimentoIso} onChange={(e) => setVencimentoIso(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label htmlFor="cp-valor">Valor (R$) *</label>
            <input id="cp-valor" type="number" min={0} step={0.01} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="cp-forma">Forma de pagamento</label>
            <select id="cp-forma" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}>
              {FORMA_PAGAMENTO_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label htmlFor="cp-status">Status</label>
            <select id="cp-status" value={status} onChange={(e) => setStatus(e.target.value as LancamentoStatus)}>
              {STATUS_TITULO_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        {erro ? <span className={styles.fieldError}>{erro}</span> : null}
      </fieldset>

      <Footer
        label={
          isRecorrente
            ? `Salvar e gerar ${repeticoes} títulos`
            : 'Salvar lançamento único'
        }
        onClose={onClose}
      />
    </form>
  )
}

function ContaReceberForm({ onClose }: { onClose: () => void }) {
  const addContaReceber = useFinanceiroStore((s) => s.addContaReceber)

  const [cliente, setCliente] = useState('')
  const [documento, setDocumento] = useState('')
  const [categoria, setCategoria] = useState('')
  const [vencimentoIso, setVencimentoIso] = useState(HOJE_ISO)
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('boleto')
  const [status, setStatus] = useState<LancamentoStatus>('pendente')
  const [erro, setErro] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!cliente.trim()) return setErro('Informe o cliente.')
    if (parseValor(valor) <= 0) return setErro('Informe um valor maior que zero.')

    addContaReceber({
      cliente: cliente.trim(),
      documento: documento.trim(),
      categoria: categoria.trim(),
      vencimentoIso,
      valor: parseValor(valor),
      formaPagamento,
      status,
    })
    onClose()
  }

  return (
    <form className={styles.drawerBody} onSubmit={handleSubmit}>
      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Dados do título</legend>
        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.fieldFull}`}>
            <label htmlFor="cr-cliente">Cliente *</label>
            <input id="cr-cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="ex: Cliente Alfa Ltda." />
          </div>
          <div className={styles.formField}>
            <label htmlFor="cr-documento">Documento</label>
            <input id="cr-documento" value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="ex: NF-e 00142" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="cr-categoria">Categoria</label>
            <input id="cr-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="ex: Serviços prestados" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="cr-vencimento">Vencimento</label>
            <input id="cr-vencimento" type="date" value={vencimentoIso} onChange={(e) => setVencimentoIso(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label htmlFor="cr-valor">Valor (R$) *</label>
            <input id="cr-valor" type="number" min={0} step={0.01} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="cr-forma">Forma de recebimento</label>
            <select id="cr-forma" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}>
              {FORMA_PAGAMENTO_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label htmlFor="cr-status">Status</label>
            <select id="cr-status" value={status} onChange={(e) => setStatus(e.target.value as LancamentoStatus)}>
              {STATUS_TITULO_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        {erro ? <span className={styles.fieldError}>{erro}</span> : null}
      </fieldset>

      <Footer label="Salvar conta a receber" onClose={onClose} />
    </form>
  )
}

function ExtratoForm({ onClose }: { onClose: () => void }) {
  const addExtratoMovimento = useFinanceiroStore((s) => s.addExtratoMovimento)
  const contas = useFinanceiroStore((s) => s.contasBancarias)

  const [contaId, setContaId] = useState(contas[0]?.id ?? '')
  const [dataIso, setDataIso] = useState(HOJE_ISO)
  const [descricao, setDescricao] = useState('')
  const [detalhe, setDetalhe] = useState('')
  const [categoria, setCategoria] = useState('')
  const [tipo, setTipo] = useState<ExtratoMovimentoTipo>('entrada')
  const [valor, setValor] = useState('')
  const [erro, setErro] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!contaId) return setErro('Selecione a conta bancária.')
    if (!descricao.trim()) return setErro('Informe a descrição da movimentação.')
    if (parseValor(valor) <= 0) return setErro('Informe um valor maior que zero.')

    addExtratoMovimento({
      contaId,
      dataIso,
      descricao: descricao.trim(),
      detalhe: detalhe.trim(),
      categoria: categoria.trim(),
      tipo,
      valor: parseValor(valor),
    })
    onClose()
  }

  return (
    <form className={styles.drawerBody} onSubmit={handleSubmit}>
      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Tipo de movimentação</legend>
        <div className={styles.tipoSelector}>
          <label className={`${styles.tipoOption} ${tipo === 'entrada' ? styles.tipoOptionActive : ''}`}>
            <input type="radio" name="extrato-tipo" value="entrada" checked={tipo === 'entrada'} onChange={() => setTipo('entrada')} />
            Entrada
          </label>
          <label className={`${styles.tipoOption} ${tipo === 'saida' ? styles.tipoOptionActive : ''}`}>
            <input type="radio" name="extrato-tipo" value="saida" checked={tipo === 'saida'} onChange={() => setTipo('saida')} />
            Saída
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Dados da movimentação</legend>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="ex-conta">Conta bancária *</label>
            <select id="ex-conta" value={contaId} onChange={(e) => setContaId(e.target.value)}>
              {contas.map((conta) => (
                <option key={conta.id} value={conta.id}>{conta.nome}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label htmlFor="ex-data">Data</label>
            <input id="ex-data" type="date" value={dataIso} onChange={(e) => setDataIso(e.target.value)} />
          </div>
          <div className={`${styles.formField} ${styles.fieldFull}`}>
            <label htmlFor="ex-descricao">Descrição *</label>
            <input id="ex-descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="ex: Recebimento Cliente Alfa" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="ex-detalhe">Detalhe</label>
            <input id="ex-detalhe" value={detalhe} onChange={(e) => setDetalhe(e.target.value)} placeholder="ex: PIX — NF-e 00142" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="ex-categoria">Categoria</label>
            <input id="ex-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="ex: Serviços prestados" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="ex-valor">Valor (R$) *</label>
            <input id="ex-valor" type="number" min={0} step={0.01} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
          </div>
        </div>
        <p className={styles.formHint}>O saldo da conta será atualizado automaticamente.</p>
        {erro ? <span className={styles.fieldError}>{erro}</span> : null}
      </fieldset>

      <Footer label="Conciliar movimentação" onClose={onClose} />
    </form>
  )
}

const STATUS_TRANSFERENCIA_OPTIONS: { id: TransferenciaStatus; label: string }[] = [
  { id: 'concluida', label: 'Concluída' },
  { id: 'agendada', label: 'Agendada' },
]

function TransferenciaForm({ onClose }: { onClose: () => void }) {
  const addTransferencia = useFinanceiroStore((s) => s.addTransferencia)
  const contas = useFinanceiroStore((s) => s.contasBancarias)

  const [contaOrigemId, setContaOrigemId] = useState(contas[0]?.id ?? '')
  const [contaDestinoId, setContaDestinoId] = useState(contas[1]?.id ?? '')
  const [dataIso, setDataIso] = useState(HOJE_ISO)
  const [descricao, setDescricao] = useState('')
  const [observacao, setObservacao] = useState('')
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState<TransferenciaStatus>('concluida')
  const [erro, setErro] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!contaOrigemId || !contaDestinoId) return setErro('Selecione as contas de origem e destino.')
    if (contaOrigemId === contaDestinoId) return setErro('A conta de destino deve ser diferente da origem.')
    if (!descricao.trim()) return setErro('Informe a descrição da transferência.')
    if (parseValor(valor) <= 0) return setErro('Informe um valor maior que zero.')

    addTransferencia({
      contaOrigemId,
      contaDestinoId,
      dataIso,
      descricao: descricao.trim(),
      observacao: observacao.trim(),
      valor: parseValor(valor),
      status,
    })
    onClose()
  }

  return (
    <form className={styles.drawerBody} onSubmit={handleSubmit}>
      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Contas</legend>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="tr-origem">Conta de origem *</label>
            <select id="tr-origem" value={contaOrigemId} onChange={(e) => setContaOrigemId(e.target.value)}>
              {contas.map((conta) => (
                <option key={conta.id} value={conta.id}>{conta.nome}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label htmlFor="tr-destino">Conta de destino *</label>
            <select id="tr-destino" value={contaDestinoId} onChange={(e) => setContaDestinoId(e.target.value)}>
              {contas.map((conta) => (
                <option key={conta.id} value={conta.id}>{conta.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Dados da transferência</legend>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="tr-data">Data</label>
            <input id="tr-data" type="date" value={dataIso} onChange={(e) => setDataIso(e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label htmlFor="tr-valor">Valor (R$) *</label>
            <input id="tr-valor" type="number" min={0} step={0.01} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
          </div>
          <div className={`${styles.formField} ${styles.fieldFull}`}>
            <label htmlFor="tr-descricao">Descrição *</label>
            <input id="tr-descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="ex: Aporte para folha" />
          </div>
          <div className={`${styles.formField} ${styles.fieldFull}`}>
            <label htmlFor="tr-observacao">Observação</label>
            <input id="tr-observacao" value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="ex: TED — reserva mensal" />
          </div>
          <div className={styles.formField}>
            <label htmlFor="tr-status">Status</label>
            <select id="tr-status" value={status} onChange={(e) => setStatus(e.target.value as TransferenciaStatus)}>
              {STATUS_TRANSFERENCIA_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className={styles.formHint}>Transferências concluídas atualizam o saldo das contas envolvidas.</p>
        {erro ? <span className={styles.fieldError}>{erro}</span> : null}
      </fieldset>

      <Footer label="Salvar transferência" onClose={onClose} />
    </form>
  )
}
