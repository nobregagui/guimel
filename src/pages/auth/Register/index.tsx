import { Link } from 'react-router-dom'

import { Button, Input } from '@/components/ui'

export function RegisterPage() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <h2 style={{ margin: 0 }}>Criar conta</h2>
      <Input id="name" label="Nome completo" placeholder="Seu nome" />
      <Input id="email" type="email" label="E-mail" placeholder="voce@empresa.com" />
      <Input id="password" type="password" label="Senha" placeholder="********" />
      <Button>Cadastrar</Button>
      <Link to="/auth/login" style={{ fontSize: '0.9rem' }}>
        Ja possui conta? Entrar
      </Link>
    </div>
  )
}
