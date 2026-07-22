'use client'

import { PuckConfigProvider } from '@delmaredigital/payload-puck/client'
import { editorPuckConfig } from '../puck/config'

export function PuckAdminProvider({ children }: { children: React.ReactNode }) {
  return (
    <PuckConfigProvider config={editorPuckConfig}>
      {children}
    </PuckConfigProvider>
  )
}

export default PuckAdminProvider
