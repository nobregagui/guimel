import type { ContaConciliacao } from '@/features/conciliacaoBancaria/types'

export const CONTAS_CONCILIACAO: ContaConciliacao[] = [
  {
    id: 'cb-1',
    nome: 'Itaú C/C Principal',
    banco: 'itau',
    agencia: '0042',
    conta: '88421-1',
    saldo: 124_350.8,
    saldoErp: 122_800.0,
  },
  {
    id: 'cb-2',
    nome: 'Bradesco Empresas',
    banco: 'bradesco',
    agencia: '1122',
    conta: '33225-5',
    saldo: 48_920.5,
    saldoErp: 48_920.5,
  },
  {
    id: 'cb-3',
    nome: 'Nubank PJ',
    banco: 'nubank',
    agencia: '0001',
    conta: '99017-7',
    saldo: 27_640.0,
    saldoErp: 26_900.0,
  },
  {
    id: 'cb-4',
    nome: 'Caixa Econômica',
    banco: 'caixa',
    agencia: '0558',
    conta: '55012-2',
    saldo: 9_210.0,
    saldoErp: 9_210.0,
  },
  {
    id: 'cb-5',
    nome: 'Santander PJ',
    banco: 'santander',
    agencia: '3301',
    conta: '77214-4',
    saldo: 15_500.0,
    saldoErp: 15_500.0,
  },
]
