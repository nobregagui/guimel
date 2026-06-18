import {
  STATUS_PRODUTO_LABEL,
  TIPO_PRODUTO_LABEL,
  statusEstoque,
} from '@/features/produtos/data/shared'
import type { Produto, StatusProduto, TipoProduto } from '@/features/produtos/types'
import styles from '@/pages/produtos/ProdutosPage.module.css'

export function StatusProdutoBadge({ status }: { status: StatusProduto }) {
  const cls: Record<StatusProduto, string> = {
    ativo: styles.badgeAtivo,
    inativo: styles.badgeInativo,
    rascunho: styles.badgeRascunho,
  }

  return <span className={`${styles.badge} ${cls[status]}`}>{STATUS_PRODUTO_LABEL[status]}</span>
}

export function TipoProdutoBadge({ tipo }: { tipo: TipoProduto }) {
  const cls: Record<TipoProduto, string> = {
    produto: styles.badgeProduto,
    servico: styles.badgeServico,
    kit: styles.badgeKit,
  }

  return <span className={`${styles.badge} ${cls[tipo]}`}>{TIPO_PRODUTO_LABEL[tipo]}</span>
}

export function EstoqueBadge({ produto }: { produto: Produto }) {
  const estoque = statusEstoque(produto)
  const cls: Record<typeof estoque, string> = {
    ok: styles.estoqueOk,
    baixo: styles.estoqueBaixo,
    critico: styles.estoqueCritico,
    sem_controle: styles.estoqueSemControle,
  }
  const label: Record<typeof estoque, string> = {
    ok: `${produto.estoqueAtual} ${produto.unidadeMedida}`,
    baixo: `${produto.estoqueAtual} ${produto.unidadeMedida} (baixo)`,
    critico: `${produto.estoqueAtual} ${produto.unidadeMedida} (crítico)`,
    sem_controle: 'Sem controle',
  }

  return (
    <span className={`${styles.estoqueBadge} ${cls[estoque]}`}>
      <span className={styles.estoqueDot} aria-hidden />
      {label[estoque]}
    </span>
  )
}

export function CategoriaChip({ nome, cor }: { nome: string; cor: string }) {
  return (
    <span className={styles.categoriaChip}>
      <span className={styles.categoriaChipDot} style={{ backgroundColor: cor }} aria-hidden />
      {nome}
    </span>
  )
}
