import { useEffect } from 'react'

import { validateStoredSession } from '@/services/authSession'

export function AuthSessionBootstrap() {
  useEffect(() => {
    void validateStoredSession()
  }, [])

  return null
}
