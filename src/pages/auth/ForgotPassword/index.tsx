import { Link } from 'react-router-dom'

import { Button, Input } from '@/components/ui'

export function ForgotPasswordPage() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <h2 style={{ margin: 0 }}>Recuperar senha</h2>
      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
        Informe seu e-mail para receber o link de redefinicao.
      </p>
      <Input id="email" type="email" label="E-mail" placeholder="voce@empresa.com" />
      <Button>Enviar link</Button>
      <Link to="/auth/login" style={{ fontSize: '0.9rem' }}>
        Voltar para login
      </Link>
    </div>
  )
}
