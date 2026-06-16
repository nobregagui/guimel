import type { ClientePedido } from '@/features/clientes/types'

export const CLIENTE_PEDIDOS: ClientePedido[] = [
  { id: 'p-1', clienteId: '1', data: '10/06/2026', dataIso: '2026-06-10', numero: 'PED-1042', valor: 12000, status: 'concluido' },
  { id: 'p-2', clienteId: '1', data: '15/05/2026', dataIso: '2026-05-15', numero: 'PED-1018', valor: 8500, status: 'concluido' },
  { id: 'p-3', clienteId: '1', data: '02/04/2026', dataIso: '2026-04-02', numero: 'PED-0981', valor: 28000, status: 'concluido' },
  { id: 'p-4', clienteId: '2', data: '06/06/2026', dataIso: '2026-06-06', numero: 'PED-1045', valor: 8400, status: 'concluido' },
  { id: 'p-5', clienteId: '2', data: '20/05/2026', dataIso: '2026-05-20', numero: 'PED-1022', valor: 6200, status: 'concluido' },
  { id: 'p-6', clienteId: '3', data: '28/05/2026', dataIso: '2026-05-28', numero: 'PED-1031', valor: 15000, status: 'pendente' },
  { id: 'p-7', clienteId: '3', data: '10/05/2026', dataIso: '2026-05-10', numero: 'PED-1005', valor: 52800, status: 'concluido' },
  { id: 'p-8', clienteId: '4', data: '11/06/2026', dataIso: '2026-06-11', numero: 'PED-1048', valor: 11200, status: 'concluido' },
  { id: 'p-9', clienteId: '5', data: '14/06/2026', dataIso: '2026-06-14', numero: 'PED-1051', valor: 9800, status: 'concluido' },
  { id: 'p-10', clienteId: '5', data: '01/06/2026', dataIso: '2026-06-01', numero: 'PED-1038', valor: 42000, status: 'concluido' },
  { id: 'p-11', clienteId: '6', data: '08/06/2026', dataIso: '2026-06-08', numero: 'PED-1046', valor: 4200, status: 'concluido' },
  { id: 'p-12', clienteId: '7', data: '11/06/2026', dataIso: '2026-06-11', numero: 'PED-1049', valor: 3750, status: 'concluido' },
  { id: 'p-13', clienteId: '9', data: '05/06/2026', dataIso: '2026-06-05', numero: 'PED-1044', valor: 5800, status: 'concluido' },
  { id: 'p-14', clienteId: '11', data: '03/06/2026', dataIso: '2026-06-03', numero: 'PED-1043', valor: 9200, status: 'concluido' },
]
