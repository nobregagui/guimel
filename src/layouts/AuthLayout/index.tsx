import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--background)',
      }}
    >
      <main
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}
