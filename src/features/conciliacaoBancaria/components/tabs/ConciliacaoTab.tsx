import { useId, useMemo, useRef, useState } from 'react'
import {
  CheckSquare,
  Eye,
  Filter,
  Link2,
  MessageSquarePlus,
  PenLine,
  Search,
  X,
  XCircle,
  Zap,
} from 'lucide-react'

import { ConciliacaoMultiplaModal } from '@/features/conciliacaoBancaria/components/ConciliacaoMultiplaModal'
import { ConfirmacaoModal } from '@/features/conciliacaoBancaria/components/ConfirmacaoModal'
import { ContextMenu } from '@/features/conciliacaoBancaria/components/ContextMenu'
import { useContextMenu } from '@/features/conciliacaoBancaria/hooks/useContextMenu'
import { ErpFilterPanel } from '@/features/conciliacaoBancaria/components/ErpFilterPanel'
import { ExtratoFilterPanel } from '@/features/conciliacaoBancaria/components/ExtratoFilterPanel'
import { ConciliacaoPagination } from '@/features/conciliacaoBancaria/components/ConciliacaoPagination'
import { SkeletonTable } from '@/features/conciliacaoBancaria/components/SkeletonTable'
import { ExtratoStatusBadge, ErpStatusBadge, ErpTipoBadge, OrigemChip } from '@/features/conciliacaoBancaria/components/ConciliacaoStatusBadge'
import { EMPTY_ERP_FILTROS, EMPTY_EXTRATO_FILTROS } from '@/features/conciliacaoBancaria/data/shared'
import { usePaginacao } from '@/features/conciliacaoBancaria/hooks/usePaginacao'
import { useKeyboardShortcuts } from '@/features/conciliacaoBancaria/hooks/useKeyboardShortcuts'
import { useConciliacaoStore } from '@/features/conciliacaoBancaria/store/useConciliacaoStore'
import type { ErpLancamento, ErpTableFiltros, ExtratoItem, ExtratoTableFiltros } from '@/features/conciliacaoBancaria/types'
import {
  countActiveErpFiltros,
  countActiveExtratoFiltros,
  filterErpLancamentos,
  filterExtratoItems,
  formatBRL,
} from '@/features/conciliacaoBancaria/utils'
import { useToast } from '@/components/ui/Toast'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

const PAGE_SIZE = 25

export function ConciliacaoTab() {
  const { showToast } = useToast()

  const extratoItems = useConciliacaoStore((s) => s.extratoItems)
  const erpLancamentos = useConciliacaoStore((s) => s.erpLancamentos)
  const selectedExtratoIds = useConciliacaoStore((s) => s.selectedExtratoIds)
  const selectedErpIds = useConciliacaoStore((s) => s.selectedErpIds)
  const toggleExtratoSelection = useConciliacaoStore((s) => s.toggleExtratoSelection)
  const toggleErpSelection = useConciliacaoStore((s) => s.toggleErpSelection)
  const clearSelection = useConciliacaoStore((s) => s.clearSelection)
  const conciliarManual = useConciliacaoStore((s) => s.conciliarManual)
  const desfazerConciliacao = useConciliacaoStore((s) => s.desfazerConciliacao)
  const ignorarExtrato = useConciliacaoStore((s) => s.ignorarExtrato)
  const openDrawerExtrato = useConciliacaoStore((s) => s.openDrawerExtrato)
  const openDrawerErp = useConciliacaoStore((s) => s.openDrawerErp)
  const conciliacoes = useConciliacaoStore((s) => s.conciliacoes)

  const [extratoFiltros, setExtratoFiltros] = useState<ExtratoTableFiltros>(EMPTY_EXTRATO_FILTROS)
  const [erpFiltros, setErpFiltros] = useState<ErpTableFiltros>(EMPTY_ERP_FILTROS)
  const [extratoFiltroAberto, setExtratoFiltroAberto] = useState(false)
  const [erpFiltroAberto, setErpFiltroAberto] = useState(false)
  const [multiplaModalAberto, setMultiplaModalAberto] = useState(false)
  const [confirmarIgnorarAberto, setConfirmarIgnorarAberto] = useState(false)
  const [mobilePainel, setMobilePainel] = useState<'extrato' | 'erp'>('extrato')
  const [isLoading] = useState(false)

  const extratoRegionId = useId()
  const erpRegionId = useId()
  const statusLiveRef = useRef<HTMLDivElement>(null)

  const { menu: contextMenu, openMenu, closeMenu } = useContextMenu()

  const extratoFiltrados = useMemo(
    () => filterExtratoItems(extratoItems, extratoFiltros),
    [extratoItems, extratoFiltros],
  )

  const erpFiltrados = useMemo(
    () => filterErpLancamentos(erpLancamentos, erpFiltros),
    [erpLancamentos, erpFiltros],
  )

  const extratoAtivos = countActiveExtratoFiltros(extratoFiltros)
  const erpAtivos = countActiveErpFiltros(erpFiltros)

  const extratoPaginacao = usePaginacao(extratoFiltrados, PAGE_SIZE)
  const erpPaginacao = usePaginacao(erpFiltrados, PAGE_SIZE)

  const hasSelection = selectedExtratoIds.length > 0 || selectedErpIds.length > 0
  const canConciliar = selectedExtratoIds.length > 0 && selectedErpIds.length > 0

  function handleConciliar() {
    if (!canConciliar) return
    setMultiplaModalAberto(true)
  }

  function handleConfirmarConciliacao(observacao: string) {
    conciliarManual(selectedExtratoIds, selectedErpIds)
    setMultiplaModalAberto(false)
    const tipo =
      selectedExtratoIds.length === 1 && selectedErpIds.length === 1
        ? '1:1'
        : `${selectedExtratoIds.length}:${selectedErpIds.length}`
    showToast({
      message: `Conciliação ${tipo} registrada com sucesso.${observacao ? ' Observação salva.' : ''}`,
      variant: 'success',
    })
  }

  function handleIgnorar() {
    if (selectedExtratoIds.length === 0) return
    if (selectedExtratoIds.length === 1) {
      ignorarExtrato(selectedExtratoIds[0])
      clearSelection()
      showToast({ message: 'Movimento marcado como ignorado.', variant: 'info' })
    } else {
      setConfirmarIgnorarAberto(true)
    }
  }

  function handleConfirmarIgnorar() {
    selectedExtratoIds.forEach((id) => ignorarExtrato(id))
    clearSelection()
    showToast({ message: `${selectedExtratoIds.length} movimentos ignorados.`, variant: 'info' })
  }

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'Enter', ctrlKey: true, description: 'Conciliar', handler: handleConciliar, disabled: !canConciliar },
    { key: 'Escape', description: 'Limpar seleção', handler: clearSelection, disabled: !hasSelection },
    { key: 'Delete', description: 'Ignorar extrato', handler: handleIgnorar, disabled: selectedExtratoIds.length === 0 },
  ])

  function clearExtratoFiltros() {
    setExtratoFiltros(EMPTY_EXTRATO_FILTROS)
    setExtratoFiltroAberto(false)
  }

  function clearErpFiltros() {
    setErpFiltros(EMPTY_ERP_FILTROS)
    setErpFiltroAberto(false)
  }

  function buildExtratoContextMenu(item: ExtratoItem) {
    const isDisabled = item.status === 'conciliado' || item.status === 'ignorado'
    const conciliacaoId = conciliacoes.find((c) => c.extratoIds.includes(item.id))?.id

    return [
      {
        label: 'Ver detalhes',
        icon: <Eye size={13} />,
        onClick: () => openDrawerExtrato(item.id),
      },
      { separator: true } as const,
      {
        label: 'Selecionar / desselecionar',
        icon: <CheckSquare size={13} />,
        onClick: () => toggleExtratoSelection(item.id),
        disabled: isDisabled,
      },
      {
        label: 'Ignorar este movimento',
        icon: <X size={13} />,
        onClick: () => { ignorarExtrato(item.id); clearSelection() },
        disabled: isDisabled,
        danger: true,
      },
      ...(conciliacaoId
        ? [
            { separator: true } as const,
            {
              label: 'Desfazer conciliação',
              icon: <XCircle size={13} />,
              onClick: () => desfazerConciliacao(conciliacaoId),
              danger: true,
            },
          ]
        : []),
      { separator: true } as const,
      {
        label: 'Criar regra automática',
        icon: <Zap size={13} />,
        onClick: () => showToast({ message: 'Funcionalidade em desenvolvimento.', variant: 'info' }),
      },
      {
        label: 'Adicionar observação',
        icon: <MessageSquarePlus size={13} />,
        onClick: () => openDrawerExtrato(item.id),
      },
    ]
  }

  function buildErpContextMenu(erp: ErpLancamento) {
    const isDisabled = erp.status === 'conciliado'
    const conciliacaoId = conciliacoes.find((c) => c.erpIds.includes(erp.id))?.id

    return [
      {
        label: 'Ver detalhes',
        icon: <Eye size={13} />,
        onClick: () => openDrawerErp(erp.id),
      },
      { separator: true } as const,
      {
        label: 'Selecionar / desselecionar',
        icon: <CheckSquare size={13} />,
        onClick: () => toggleErpSelection(erp.id),
        disabled: isDisabled,
      },
      {
        label: 'Editar lançamento',
        icon: <PenLine size={13} />,
        onClick: () => showToast({ message: 'Funcionalidade em desenvolvimento.', variant: 'info' }),
      },
      ...(conciliacaoId
        ? [
            { separator: true } as const,
            {
              label: 'Desfazer conciliação',
              icon: <XCircle size={13} />,
              onClick: () => desfazerConciliacao(conciliacaoId),
              danger: true,
            },
          ]
        : []),
    ]
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0 }}>
      {/* Keyboard hint */}
      {canConciliar ? (
        <div className={styles.kbdHint}>
          <span className={styles.kbdKey}>Ctrl</span>+<span className={styles.kbdKey}>Enter</span>
          <span>Conciliar ·</span>
          <span className={styles.kbdKey}>Esc</span>
          <span>Limpar ·</span>
          <span className={styles.kbdKey}>Del</span>
          <span>Ignorar · Clique direito para mais opções</span>
        </div>
      ) : (
        <div className={styles.kbdHint}>
          <span>Selecione itens nos dois painéis e clique em <strong>Conciliar</strong> · Clique direito para mais opções</span>
        </div>
      )}

      {/* Action bar */}
      {hasSelection ? (
        <div className={styles.actionBar} role="toolbar" aria-label="Ações de conciliação">
          <span className={styles.actionBarInfo} aria-live="polite" aria-atomic="true">
            <span className={styles.actionBarBold}>{selectedExtratoIds.length}</span> extrato{selectedExtratoIds.length !== 1 ? 's' : ''}
            {' + '}
            <span className={styles.actionBarBold}>{selectedErpIds.length}</span> lançamento{selectedErpIds.length !== 1 ? 's' : ''} selecionados
          </span>
          <div className={styles.actionBarDivider} />
          <button type="button" className={styles.btnGhost} onClick={clearSelection}>
            <XCircle size={14} /> Limpar (Esc)
          </button>
          {selectedExtratoIds.length > 0 ? (
            <button type="button" className={styles.btnDanger} onClick={handleIgnorar}>
              <XCircle size={13} /> Ignorar ({selectedExtratoIds.length})
            </button>
          ) : null}
          <button type="button" className={styles.btnSuccess} onClick={handleConciliar} disabled={!canConciliar}>
            <Link2 size={13} />
            {canConciliar ? `Conciliar ${selectedExtratoIds.length}:${selectedErpIds.length}` : 'Selecione os dois lados'}
          </button>
        </div>
      ) : null}

      {/* Mobile panel switcher — hidden on desktop via CSS */}
      <div className={styles.mobilePanelSwitch} role="tablist" aria-label="Selecionar painel">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePainel === 'extrato'}
          aria-controls={extratoRegionId}
          className={`${styles.mobilePanelBtn} ${mobilePainel === 'extrato' ? styles.mobilePanelBtnActive : ''}`}
          onClick={() => setMobilePainel('extrato')}
        >
          Extrato Bancário
          {selectedExtratoIds.length > 0 ? ` (${selectedExtratoIds.length})` : ''}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePainel === 'erp'}
          aria-controls={erpRegionId}
          className={`${styles.mobilePanelBtn} ${mobilePainel === 'erp' ? styles.mobilePanelBtnActive : ''}`}
          onClick={() => setMobilePainel('erp')}
        >
          Financeiro ERP
          {selectedErpIds.length > 0 ? ` (${selectedErpIds.length})` : ''}
        </button>
      </div>

      {/* ARIA live region for reconciliation status announcements */}
      <div
        ref={statusLiveRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}
      />

      {/* Split workspace */}
      <div className={styles.workspace}>
        {/* ── LEFT: Extrato bancário ── */}
        <div
          id={extratoRegionId}
          className={`${styles.workspacePanel} ${mobilePainel === 'erp' ? styles.workspacePanelMobileHidden : ''}`}
          role="region"
          aria-label="Extrato Bancário"
          aria-hidden={mobilePainel === 'erp'}
        >
          <div className={styles.workspacePanelHeader}>
            <div>
              <p className={styles.workspacePanelTitle}>Extrato Bancário</p>
              <p className={styles.workspacePanelSub}>
                {extratoFiltrados.length} movimentos
                {selectedExtratoIds.length > 0 ? ` · ${selectedExtratoIds.length} sel.` : ''}
                {extratoAtivos > 0 ? ` · ${extratoAtivos} filtro(s)` : ''}
              </p>
            </div>
            <div className={styles.workspacePanelActions}>
              <button
                type="button"
                className={`${styles.btnGhost} ${extratoFiltroAberto ? styles.btnGhostActive : ''}`}
                onClick={() => setExtratoFiltroAberto((v) => !v)}
                title="Filtros avançados"
              >
                <Filter size={13} />
                {extratoAtivos > 0 ? <span className={styles.filterBadge}>{extratoAtivos}</span> : null}
              </button>
            </div>
          </div>

          {/* Quick search */}
          <div className={styles.filtersBar}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Buscar movimentos..."
                className={styles.filterInput}
                style={{ paddingLeft: 28 }}
                value={extratoFiltros.busca}
                onChange={(e) => setExtratoFiltros((f) => ({ ...f, busca: e.target.value }))}
              />
            </div>
            <select
              className={styles.filterSelect}
              value={extratoFiltros.status}
              onChange={(e) => setExtratoFiltros((f) => ({ ...f, status: e.target.value as ExtratoTableFiltros['status'] }))}
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="sugerido">Sugerido</option>
              <option value="conciliado">Conciliado</option>
              <option value="ignorado">Ignorado</option>
            </select>
          </div>

          {/* Advanced filter panel */}
          {extratoFiltroAberto ? (
            <ExtratoFilterPanel
              filtros={extratoFiltros}
              onChange={setExtratoFiltros}
              onClose={() => setExtratoFiltroAberto(false)}
              onClear={clearExtratoFiltros}
              activeCount={extratoAtivos}
            />
          ) : null}

          <div className={styles.workspacePanelBody}>
            {isLoading ? (
              <SkeletonTable rows={8} columns={5} />
            ) : extratoPaginacao.itensPagina.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}><CheckSquare size={24} /></div>
                <p className={styles.emptyStateTitle}>
                  {extratoFiltrados.length === 0 ? 'Nenhum movimento encontrado' : 'Tudo conciliado!'}
                </p>
                <p className={styles.emptyStateText}>
                  {extratoAtivos > 0
                    ? 'Ajuste os filtros para ver mais registros.'
                    : 'Importe um extrato bancário para começar a conciliar.'}
                </p>
              </div>
            ) : (
              <table className={styles.table} aria-label="Extrato Bancário">
                <thead>
                  <tr>
                    <th scope="col" className={styles.cellCheckbox} aria-label="Seleção" />
                    <th scope="col">Descrição</th>
                    <th scope="col">Origem</th>
                    <th scope="col" className={styles.thRight}>Valor</th>
                    <th scope="col" className={styles.thCenter}>Status</th>
                    <th scope="col" className={styles.thNarrow} aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {extratoPaginacao.itensPagina.map((item) => {
                    const isSelected = selectedExtratoIds.includes(item.id)
                    const isDisabled = item.status === 'conciliado' || item.status === 'ignorado'
                    return (
                      <tr
                        key={item.id}
                        className={isSelected ? styles.tableRowSelected : undefined}
                        onClick={() => !isDisabled && toggleExtratoSelection(item.id)}
                        onContextMenu={(e) => openMenu(e, buildExtratoContextMenu(item))}
                        style={{ cursor: isDisabled ? 'default' : 'pointer' }}
                        aria-selected={isSelected}
                      >
                        <td className={styles.cellCheckbox} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={isSelected}
                            onChange={() => !isDisabled && toggleExtratoSelection(item.id)}
                            disabled={isDisabled}
                            aria-label={`Selecionar ${item.descricao}`}
                          />
                        </td>
                        <td>
                          <p className={styles.cellDescricao}>{item.descricao}</p>
                          <p className={styles.cellSubDesc}>{item.data}{item.documento ? ` · ${item.documento}` : ''}</p>
                        </td>
                        <td>
                          <OrigemChip origem={item.origem} />
                        </td>
                        <td>
                          <span className={`${item.tipo === 'credito' ? styles.cellValorPos : styles.cellValorNeg} ${styles.cellValorRight}`}>
                            {item.tipo === 'credito' ? '+' : '−'} {formatBRL(item.valor)}
                          </span>
                        </td>
                        <td className={styles.cellCenter}>
                          <ExtratoStatusBadge status={item.status} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.rowAction}
                            onClick={(e) => { e.stopPropagation(); openDrawerExtrato(item.id) }}
                            aria-label="Detalhes"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          <ConciliacaoPagination paginacao={extratoPaginacao} label="movimento" />
        </div>

        {/* ── RIGHT: ERP Lançamentos ── */}
        <div
          id={erpRegionId}
          className={`${styles.workspacePanel} ${mobilePainel === 'extrato' ? styles.workspacePanelMobileHidden : ''}`}
          role="region"
          aria-label="Financeiro ERP"
          aria-hidden={mobilePainel === 'extrato'}
        >
          <div className={styles.workspacePanelHeader}>
            <div>
              <p className={styles.workspacePanelTitle}>Financeiro ERP</p>
              <p className={styles.workspacePanelSub}>
                {erpFiltrados.length} lançamentos
                {selectedErpIds.length > 0 ? ` · ${selectedErpIds.length} sel.` : ''}
                {erpAtivos > 0 ? ` · ${erpAtivos} filtro(s)` : ''}
              </p>
            </div>
            <div className={styles.workspacePanelActions}>
              <button
                type="button"
                className={`${styles.btnGhost} ${erpFiltroAberto ? styles.btnGhostActive : ''}`}
                onClick={() => setErpFiltroAberto((v) => !v)}
                title="Filtros avançados"
              >
                <Filter size={13} />
                {erpAtivos > 0 ? <span className={styles.filterBadge}>{erpAtivos}</span> : null}
              </button>
            </div>
          </div>

          {/* Quick search + tipo */}
          <div className={styles.filtersBar}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Buscar lançamentos..."
                className={styles.filterInput}
                style={{ paddingLeft: 28 }}
                value={erpFiltros.busca}
                onChange={(e) => setErpFiltros((f) => ({ ...f, busca: e.target.value }))}
              />
            </div>
            <select
              className={styles.filterSelect}
              value={erpFiltros.status}
              onChange={(e) => setErpFiltros((f) => ({ ...f, status: e.target.value as ErpTableFiltros['status'] }))}
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="conciliado">Conciliado</option>
              <option value="pago">Pago</option>
            </select>
            <select
              className={styles.filterSelect}
              value={erpFiltros.tipo}
              onChange={(e) => setErpFiltros((f) => ({ ...f, tipo: e.target.value as ErpTableFiltros['tipo'] }))}
            >
              <option value="todos">Ambos</option>
              <option value="receber">Receber</option>
              <option value="pagar">Pagar</option>
            </select>
          </div>

          {/* Advanced filter panel */}
          {erpFiltroAberto ? (
            <ErpFilterPanel
              filtros={erpFiltros}
              onChange={setErpFiltros}
              onClose={() => setErpFiltroAberto(false)}
              onClear={clearErpFiltros}
              activeCount={erpAtivos}
            />
          ) : null}

          <div className={styles.workspacePanelBody}>
            {isLoading ? (
              <SkeletonTable rows={8} columns={5} />
            ) : erpPaginacao.itensPagina.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}><CheckSquare size={24} /></div>
                <p className={styles.emptyStateTitle}>
                  {erpFiltrados.length === 0 ? 'Nenhum lançamento encontrado' : 'Todos conciliados!'}
                </p>
                <p className={styles.emptyStateText}>
                  {erpAtivos > 0
                    ? 'Ajuste os filtros para ver mais registros.'
                    : 'Todos os lançamentos do ERP estão conciliados.'}
                </p>
              </div>
            ) : (
              <table className={styles.table} aria-label="Financeiro ERP">
                <thead>
                  <tr>
                    <th scope="col" className={styles.cellCheckbox} aria-label="Seleção" />
                    <th scope="col">Lançamento</th>
                    <th scope="col">Categoria</th>
                    <th scope="col" className={styles.thRight}>Valor</th>
                    <th scope="col" className={styles.thCenter}>Status</th>
                    <th scope="col" className={styles.thNarrow} aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {erpPaginacao.itensPagina.map((erp) => {
                    const isSelected = selectedErpIds.includes(erp.id)
                    const isDisabled = erp.status === 'conciliado'
                    return (
                      <tr
                        key={erp.id}
                        className={isSelected ? styles.tableRowSelected : undefined}
                        onClick={() => !isDisabled && toggleErpSelection(erp.id)}
                        onContextMenu={(e) => openMenu(e, buildErpContextMenu(erp))}
                        style={{ cursor: isDisabled ? 'default' : 'pointer' }}
                        aria-selected={isSelected}
                      >
                        <td className={styles.cellCheckbox} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={isSelected}
                            onChange={() => !isDisabled && toggleErpSelection(erp.id)}
                            disabled={isDisabled}
                            aria-label={`Selecionar ${erp.descricao}`}
                          />
                        </td>
                        <td>
                          <p className={styles.cellDescricao}>{erp.descricao}</p>
                          <p className={styles.cellSubDesc}>
                            {erp.cliente ?? erp.fornecedor ?? '—'} · Venc. {erp.vencimento}
                          </p>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <ErpTipoBadge tipo={erp.tipo} />
                            <span style={{ fontSize: '10px', color: '#9ca3af' }}>{erp.categoria}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`${erp.tipo === 'receber' ? styles.cellValorPos : styles.cellValorNeg} ${styles.cellValorRight}`}>
                            {formatBRL(erp.valor)}
                          </span>
                        </td>
                        <td className={styles.cellCenter}>
                          <ErpStatusBadge status={erp.status} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.rowAction}
                            onClick={(e) => { e.stopPropagation(); openDrawerErp(erp.id) }}
                            aria-label="Detalhes"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          <ConciliacaoPagination paginacao={erpPaginacao} label="lançamento" />
        </div>
      </div>

      {/* Hint */}
      {canConciliar ? (
        <div className={styles.infoRow}>
          <Link2 size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span>
            Conciliação <strong>{selectedExtratoIds.length}:{selectedErpIds.length}</strong> pronta para ser revisada.
            Pressione <strong>Ctrl+Enter</strong> ou clique em <strong>Conciliar</strong>.
          </span>
        </div>
      ) : null}

      {/* Modals */}
      <ConciliacaoMultiplaModal
        open={multiplaModalAberto}
        extratoIds={selectedExtratoIds}
        erpIds={selectedErpIds}
        onClose={() => setMultiplaModalAberto(false)}
        onConfirmar={handleConfirmarConciliacao}
      />

      <ConfirmacaoModal
        open={confirmarIgnorarAberto}
        titulo="Ignorar múltiplos movimentos?"
        descricao={`Você está prestes a marcar ${selectedExtratoIds.length} movimentos do extrato como ignorados. Eles não aparecerão como pendências, mas poderão ser desfeitos mais tarde.`}
        variante="warning"
        labelConfirmar="Sim, ignorar todos"
        onClose={() => setConfirmarIgnorarAberto(false)}
        onConfirmar={handleConfirmarIgnorar}
      />

      {/* Context menu via portal */}
      <ContextMenu menu={contextMenu} onClose={closeMenu} />
    </div>
  )
}
