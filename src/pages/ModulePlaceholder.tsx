interface ModulePlaceholderProps {
  title: string
}

export function ModulePlaceholder({ title }: ModulePlaceholderProps) {
  return <h2 style={{ margin: 0 }}>{title}</h2>
}
