export interface Cliente {
  id: string
  nome: string
  documento: string
  email: string
  telefone: string
  ativo: boolean
}

export interface CreateClientePayload {
  nome: string
  documento: string
  email: string
  telefone: string
}
