// Next Imports
import { Suspense } from 'react'

import type { Metadata } from 'next'

// Component Imports
import ResetPassword from '@views/ResetPassword'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
  description: 'Restablece tu contraseña'
}

const ResetPasswordPage = async () => {
  const mode = await getServerMode()

  return (
    <Suspense>
      <ResetPassword mode={mode} />
    </Suspense>
  )
}

export default ResetPasswordPage
