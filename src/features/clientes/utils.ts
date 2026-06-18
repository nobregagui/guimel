import type {
  CidadeSummary,
  Cliente,
  ClienteFiltro,
  ClienteFormValues,
  ClienteStatus,
  RecentesCadastroFiltro,
  RecentesTableFiltros,
  SegmentoSummary,
} from '@/features/clientes/types'

const REFERENCE_DATE = new Date('2026-06-15')

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function getIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

export function filterClientes(clientes: Cliente[], filtro: ClienteFiltro, busca: string): Cliente[] {
  let result = clientes

  switch (filtro) {
    case 'ativos':
      result = result.filter((c) => c.status === 'ativo')
      break
    case 'inativos':
      result = result.filter((c) => c.status === 'inativo')
      break
    case 'pendentes':
      result = result.filter((c) => c.status === 'pendente')
      break
    default:
      break
  }

  const termo = busca.trim().toLowerCase()
  if (termo) {
    result = result.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        (c.nomeFantasia?.toLowerCase().includes(termo) ?? false) ||
        c.documento.includes(termo) ||
        c.email.toLowerCase().includes(termo) ||
        c.cidade.toLowerCase().includes(termo) ||
        c.segmento.toLowerCase().includes(termo),
    )
  }

  return [...result].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function countByStatus(clientes: Cliente[], status: ClienteStatus): number {
  return clientes.filter((c) => c.status === status).length
}

export function sumTotalVendas(clientes: Cliente[]): number {
  return clientes.reduce((acc, c) => acc + c.totalVendas, 0)
}

export function countNovosNoMes(clientes: Cliente[], mesPrefix = '2026-06'): number {
  return clientes.filter((c) => c.cadastroIso.startsWith(mesPrefix)).length
}

export function getTicketMedio(clientes: Cliente[]): number {
  const comPedidos = clientes.filter((c) => c.quantidadePedidos > 0)
  if (comPedidos.length === 0) return 0
  const totalPedidos = comPedidos.reduce((acc, c) => acc + c.quantidadePedidos, 0)
  const totalVendas = comPedidos.reduce((acc, c) => acc + c.totalVendas, 0)
  return totalVendas / totalPedidos
}

export function groupBySegmento(clientes: Cliente[]): SegmentoSummary[] {
  const map = new Map<string, { total: number; quantidade: number }>()

  for (const cliente of clientes) {
    const current = map.get(cliente.segmento) ?? { total: 0, quantidade: 0 }
    map.set(cliente.segmento, {
      total: current.total + cliente.totalVendas,
      quantidade: current.quantidade + 1,
    })
  }

  const totalGeral = clientes.reduce((acc, c) => acc + c.totalVendas, 0) || 1

  return [...map.entries()]
    .map(([segmento, data]) => ({
      segmento,
      ...data,
      percentual: Math.round((data.total / totalGeral) * 100),
    }))
    .sort((a, b) => b.total - a.total)
}

export function groupByCidade(clientes: Cliente[]): CidadeSummary[] {
  const map = new Map<string, CidadeSummary>()

  for (const cliente of clientes) {
    const key = `${cliente.cidade}-${cliente.estado}`
    const current = map.get(key) ?? {
      cidade: cliente.cidade,
      estado: cliente.estado,
      quantidade: 0,
      totalVendas: 0,
    }
    map.set(key, {
      ...current,
      quantidade: current.quantidade + 1,
      totalVendas: current.totalVendas + cliente.totalVendas,
    })
  }

  return [...map.values()].sort((a, b) => b.totalVendas - a.totalVendas)
}

export function getTopClientes(clientes: Cliente[], limit = 5): Cliente[] {
  return [...clientes].sort((a, b) => b.totalVendas - a.totalVendas).slice(0, limit)
}

export function getClientesRecentes(clientes: Cliente[], limit = 5): Cliente[] {
  return [...clientes].sort((a, b) => b.cadastroIso.localeCompare(a.cadastroIso)).slice(0, limit)
}

function matchesRecentesCadastroFiltro(cadastroIso: string, filtro: RecentesCadastroFiltro): boolean {
  switch (filtro) {
    case 'mes_atual':
      return cadastroIso.startsWith('2026-06')
    case 'ultimos_30': {
      const cadastro = new Date(`${cadastroIso}T00:00:00`)
      const limit = new Date(REFERENCE_DATE)
      limit.setDate(limit.getDate() - 30)
      return cadastro >= limit && cadastro <= REFERENCE_DATE
    }
    case 'ultimos_90': {
      const cadastro = new Date(`${cadastroIso}T00:00:00`)
      const limit = new Date(REFERENCE_DATE)
      limit.setDate(limit.getDate() - 90)
      return cadastro >= limit && cadastro <= REFERENCE_DATE
    }
    default:
      return true
  }
}

export function applyRecentesTableFiltros(
  clientes: Cliente[],
  filtros: RecentesTableFiltros,
): Cliente[] {
  return clientes.filter((cliente) => {
    if (filtros.segmento && cliente.segmento !== filtros.segmento) return false
    if (filtros.status !== 'todos' && cliente.status !== filtros.status) return false
    if (!matchesRecentesCadastroFiltro(cliente.cadastroIso, filtros.cadastro)) return false
    return true
  })
}

export function countActiveRecentesTableFiltros(filtros: RecentesTableFiltros): number {
  let count = 0
  if (filtros.segmento) count += 1
  if (filtros.status !== 'todos') count += 1
  if (filtros.cadastro !== 'todos') count += 1
  return count
}

export function hasActiveRecentesTableFiltros(filtros: RecentesTableFiltros): boolean {
  return countActiveRecentesTableFiltros(filtros) > 0
}

export function getRecentesTableClientes(
  clientes: Cliente[],
  filtros: RecentesTableFiltros,
  busca: string,
): Cliente[] {
  const base = filterClientes(clientes, 'todos', busca)
  const filtered = applyRecentesTableFiltros(base, filtros)
  const sorted = [...filtered].sort((a, b) => b.cadastroIso.localeCompare(a.cadastroIso))

  if (hasActiveRecentesTableFiltros(filtros)) {
    return sorted
  }

  return sorted.slice(0, 5)
}

export function countByTipo(clientes: Cliente[], tipo: Cliente['tipo']): number {
  return clientes.filter((c) => c.tipo === tipo).length
}

function formatIsoToDisplay(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export function buildClienteFromForm(input: ClienteFormValues, currentCount: number): Cliente {
  const hoje = REFERENCE_DATE
  const cadastroIso = hoje.toISOString().slice(0, 10)

  return {
    id: `new-${Date.now()}-${currentCount}`,
    nome: input.nome.trim(),
    nomeFantasia: input.nomeFantasia.trim() || undefined,
    tipo: input.tipo,
    documento: input.documento.trim(),
    email: input.email.trim(),
    telefone: input.telefone.trim(),
    cidade: input.cidade.trim(),
    estado: input.estado.trim(),
    segmento: input.segmento,
    formaPagamentoPreferida: input.formaPagamentoPreferida,
    status: 'pendente',
    cadastroIso,
    cadastro: formatIsoToDisplay(cadastroIso),
    ultimaCompraIso: null,
    ultimaCompra: null,
    totalVendas: 0,
    quantidadePedidos: 0,
    observacao: input.observacao.trim() || undefined,
  }
}

export function getTicketMedioCliente(cliente: Cliente): number {
  if (cliente.quantidadePedidos === 0) return 0
  return cliente.totalVendas / cliente.quantidadePedidos
}
