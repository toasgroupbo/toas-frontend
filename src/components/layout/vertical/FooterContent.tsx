'use client'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div className='w-full'>
      {/* Línea superior */}
      <div className='border-t border-divider' />

      <div
        className={classnames(
          verticalLayoutClasses.footerContent,
          'flex items-center justify-center flex-wrap gap-4 text-center py-4'
        )}
      >
        <div>
          <p className='text-textSecondary'>info@toasgroup.com</p>
          <p className='text-textSecondary'>Santa Cruz - Bolivia | Telf. 3260654 | Cel. 74604441</p>
          <p className='text-textSecondary'>Derechos Reservados © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}

export default FooterContent
