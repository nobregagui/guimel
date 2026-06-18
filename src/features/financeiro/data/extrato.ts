import type { ExtratoMovimento } from '@/features/financeiro/types'

export const EXTRATO_MOVIMENTOS: ExtratoMovimento[] = [
  { id: 'ex-1',  contaId: '1', data: '01/06/2026', dataIso: '2026-06-01', descricao: 'Saldo anterior',           detalhe: 'Fechamento maio',        categoria: 'Ajuste',              tipo: 'entrada', valor: 22100, saldoApos: 22100 },
  { id: 'ex-2',  contaId: '1', data: '03/06/2026', dataIso: '2026-06-03', descricao: 'Recebimento Cliente Alfa', detalhe: 'PIX — NF-e 00142',     categoria: 'Serviços prestados',  tipo: 'entrada', valor: 12000, saldoApos: 34100 },
  { id: 'ex-3',  contaId: '1', data: '05/06/2026', dataIso: '2026-06-05', descricao: 'Pagamento Fornecedor Beta',detalhe: 'Boleto #8821',         categoria: 'Compras',             tipo: 'saida',   valor:  5800, saldoApos: 28300 },
  { id: 'ex-4',  contaId: '1', data: '08/06/2026', dataIso: '2026-06-08', descricao: 'Aluguel escritório',       detalhe: 'Transferência',        categoria: 'Despesas fixas',      tipo: 'saida',   valor:  3200, saldoApos: 25100 },
  { id: 'ex-5',  contaId: '1', data: '10/06/2026', dataIso: '2026-06-10', descricao: 'Recebimento Distribuidora',detalhe: 'TED recebida',         categoria: 'Vendas',              tipo: 'entrada', valor: 11200, saldoApos: 36300 },
  { id: 'ex-6',  contaId: '1', data: '12/06/2026', dataIso: '2026-06-12', descricao: 'Pro Labore',               detalhe: 'PIX enviado',          categoria: 'Pessoal',             tipo: 'saida',   valor:  6000, saldoApos: 30300 },
  { id: 'ex-7',  contaId: '1', data: '14/06/2026', dataIso: '2026-06-14', descricao: 'Recebimento Tech Solutions',detalhe: 'Boleto compensado',   categoria: 'Assinaturas',         tipo: 'entrada', valor:  9800, saldoApos: 40100 },

  { id: 'ex-8',  contaId: '2', data: '02/06/2026', dataIso: '2026-06-02', descricao: 'Saldo anterior',           detalhe: 'Fechamento maio',        categoria: 'Ajuste',              tipo: 'entrada', valor:  8200, saldoApos:  8200 },
  { id: 'ex-9',  contaId: '2', data: '06/06/2026', dataIso: '2026-06-06', descricao: 'Recebimento Cliente Gama', detalhe: 'PIX recebido',         categoria: 'Serviços prestados',  tipo: 'entrada', valor:  8400, saldoApos: 16600 },
  { id: 'ex-10', contaId: '2', data: '09/06/2026', dataIso: '2026-06-09', descricao: 'Contabilidade Silva',      detalhe: 'Débito automático',    categoria: 'Serviços',            tipo: 'saida',   valor:  1800, saldoApos: 14800 },
  { id: 'ex-11', contaId: '2', data: '13/06/2026', dataIso: '2026-06-13', descricao: 'Energia CPFL',             detalhe: 'Boleto pago',          categoria: 'Utilidades',          tipo: 'saida',   valor:   890, saldoApos: 13910 },

  { id: 'ex-12', contaId: '3', data: '04/06/2026', dataIso: '2026-06-04', descricao: 'Saldo anterior',           detalhe: 'Fechamento maio',        categoria: 'Ajuste',              tipo: 'entrada', valor:  5100, saldoApos:  5100 },
  { id: 'ex-13', contaId: '3', data: '07/06/2026', dataIso: '2026-06-07', descricao: 'AWS Brasil',               detalhe: 'Cartão corporativo',   categoria: 'Tecnologia',          tipo: 'saida',   valor:  2340, saldoApos:  2760 },
  { id: 'ex-14', contaId: '3', data: '11/06/2026', dataIso: '2026-06-11', descricao: 'Recebimento Loja Horizonte',detalhe: 'PIX recebido',        categoria: 'Vendas',              tipo: 'entrada', valor:  3750, saldoApos:  6510 },
  { id: 'ex-15', contaId: '3', data: '15/06/2026', dataIso: '2026-06-15', descricao: 'Internet Fibra Corp.',     detalhe: 'Débito automático',    categoria: 'Utilidades',          tipo: 'saida',   valor:   420, saldoApos:  6090 },

  { id: 'ex-16', contaId: '4', data: '01/06/2026', dataIso: '2026-06-01', descricao: 'Saldo anterior',           detalhe: 'Fechamento maio',        categoria: 'Ajuste',              tipo: 'entrada', valor:   950, saldoApos:   950 },
  { id: 'ex-17', contaId: '4', data: '10/06/2026', dataIso: '2026-06-10', descricao: 'Material de escritório',   detalhe: 'Compra avulsa',        categoria: 'Despesas operacionais', tipo: 'saida',   valor:   250, saldoApos:   700 },
  { id: 'ex-18', contaId: '4', data: '14/06/2026', dataIso: '2026-06-14', descricao: 'Aporte caixinha',          detalhe: 'Transferência interna', categoria: 'Transferência',      tipo: 'entrada', valor:   500, saldoApos:  1200 },
]

export const EXTRATO_CATEGORIAS = [...new Set(EXTRATO_MOVIMENTOS.map((m) => m.categoria))].sort()

export const EXTRATO_FILTROS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'entradas' as const, label: 'Entradas' },
  { id: 'saidas' as const, label: 'Saídas' },
]
