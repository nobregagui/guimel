import { ArrowLeft, Mail, MapPin, Pencil, Phone, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ClienteAvatar } from '@/features/clientes/components/ClienteAvatar'
import { ClienteStatusBadge } from '@/features/clientes/components/ClienteStatusBadge'
import { ClienteTipoBadge } from '@/features/clientes/components/ClienteTipoBadge'
import type { Cliente } from '@/features/clientes/types'
import styles from '@/pages/clientes/ClienteDetalhePage.module.css'

interface ClienteDetalheHeaderProps {
  cliente: Cliente
  onEditar?: () => void
  onInativar?: () => void
}

export function ClienteDetalheHeader({
  cliente,
  onEditar,
  onInativar,
}: ClienteDetalheHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <Link to="/clientes" className={styles.backLink}>
          <ArrowLeft size={16} /> Voltar para clientes
        </Link>

        <div className={styles.headerActions}>
          {onInativar ? (
            <button type="button" className={styles.btnSecondary} onClick={onInativar}>
              Inativar
            </button>
          ) : null}
          <button type="button" className={styles.btnSecondary} onClick={onEditar}>
            <Pencil size={13} /> Editar
          </button>
          <button type="button" className={styles.btnPrimary}>
            <ShoppingBag size={13} /> Nova venda
          </button>
        </div>
      </div>

      <div className={styles.profileRow}>
        <ClienteAvatar nome={cliente.nome} />
        <div className={styles.profileInfo}>
          <div className={styles.profileTitleRow}>
            <h1 className={styles.pageTitle}>{cliente.nome}</h1>
            <ClienteStatusBadge status={cliente.status} />
            <ClienteTipoBadge tipo={cliente.tipo} />
          </div>
          {cliente.nomeFantasia ? (
            <p className={styles.profileSubtitle}>{cliente.nomeFantasia}</p>
          ) : null}
          <div className={styles.profileMeta}>
            <span>{cliente.documento}</span>
            <span>·</span>
            <span>{cliente.segmento}</span>
            <span>·</span>
            <span>Cliente desde {cliente.cadastro}</span>
          </div>
        </div>
      </div>

      <div className={styles.contactRow}>
        <span className={styles.contactItem}><Mail size={14} /> {cliente.email}</span>
        <span className={styles.contactItem}><Phone size={14} /> {cliente.telefone}</span>
        <span className={styles.contactItem}><MapPin size={14} /> {cliente.cidade}/{cliente.estado}</span>
      </div>
    </header>
  )
}
