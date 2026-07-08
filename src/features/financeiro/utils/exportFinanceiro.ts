export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const content = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))].join('\n')
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportTitulosCsv(
  modulo: 'receber' | 'pagar',
  items: Array<Record<string, string | number>>,
): void {
  if (items.length === 0) return

  const headers = Object.keys(items[0])
  const rows = items.map((item) => headers.map((key) => String(item[key] ?? '')))
  const data = new Date().toISOString().slice(0, 10)
  downloadCsv(`financeiro-${modulo}-${data}.csv`, headers, rows)
}

export function exportExtratoCsv(
  items: Array<{ data: string; descricao: string; detalhe?: string; categoria: string; tipo: string; valor: number; conciliado?: boolean; contaId: string }>,
  contas: Array<{ id: string; nome: string }>,
): void {
  if (items.length === 0) return

  const contaNome = (id: string) => contas.find((c) => c.id === id)?.nome ?? id
  const headers = ['Data', 'Descrição', 'Detalhe', 'Conta', 'Categoria', 'Tipo', 'Valor', 'Conciliado']
  const rows = items.map((item) => [
    item.data,
    item.descricao,
    item.detalhe ?? '',
    contaNome(item.contaId),
    item.categoria,
    item.tipo,
    String(item.valor),
    item.conciliado ? 'Sim' : 'Não',
  ])
  const data = new Date().toISOString().slice(0, 10)
  downloadCsv(`financeiro-extrato-${data}.csv`, headers, rows)
}

export function exportTransferenciasCsv(
  items: Array<{ data: string; descricao: string; valor: number; status: string; contaOrigemId: string; contaDestinoId: string }>,
  contas: Array<{ id: string; nome: string }>,
): void {
  if (items.length === 0) return

  const contaNome = (id: string) => contas.find((c) => c.id === id)?.nome ?? id
  const headers = ['Data', 'Origem', 'Destino', 'Descrição', 'Valor', 'Status']
  const rows = items.map((item) => [
    item.data,
    contaNome(item.contaOrigemId),
    contaNome(item.contaDestinoId),
    item.descricao,
    String(item.valor),
    item.status,
  ])
  const data = new Date().toISOString().slice(0, 10)
  downloadCsv(`financeiro-transferencias-${data}.csv`, headers, rows)
}
