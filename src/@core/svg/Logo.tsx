// React Imports
import type { ImgHTMLAttributes } from 'react'

import { useTheme } from '@mui/material/styles'

interface LogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  lightSrc?: string
  darkSrc?: string
}

const Logo = ({
  lightSrc = '/images/illustrations/auth/logoipsum.png',
  darkSrc = '/images/illustrations/auth/logoipsum.png',
  ...props
}: LogoProps) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'

  return (
    <img
      src={isDarkMode ? darkSrc : lightSrc}
      width={50}
      height={34}
      alt='Logo'
      style={{
        objectFit: 'contain',
        ...props.style
      }}
      {...props}
    />
  )
}

export default Logo
