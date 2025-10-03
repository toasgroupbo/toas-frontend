'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { SyntheticEvent, ReactNode } from 'react'

// MUI Imports
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export type SnackbarMessage = {
  key: number
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
}

interface SnackbarContextType {
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showWarning: (message: string) => void
  showInfo: (message: string) => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined)

interface SnackbarProviderProps {
  children: ReactNode
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [snackPack, setSnackPack] = useState<SnackbarMessage[]>([])
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined)

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setOpen(true)
      setSnackPack(prev => prev.slice(1))
      setMessageInfo({ ...snackPack[0] })
    } else if (snackPack.length && messageInfo && open) {
      setOpen(false)
    }
  }, [snackPack, messageInfo, open])

  const addSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackPack(prev => [
      ...prev,
      {
        message,
        severity,
        key: new Date().getTime()
      }
    ])
  }

  const showSuccess = (message: string) => addSnackbar(message, 'success')
  const showError = (message: string) => addSnackbar(message, 'error')
  const showWarning = (message: string) => addSnackbar(message, 'warning')
  const showInfo = (message: string) => addSnackbar(message, 'info')

  const handleClose = (event: Event | SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const handleExited = () => {
    setMessageInfo(undefined)
  }

  return (
    <SnackbarContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}

      {/* Snackbar global */}
      <Snackbar
        open={open}
        onClose={handleClose}
        autoHideDuration={4000}
        TransitionProps={{ onExited: handleExited }}
        key={messageInfo ? messageInfo.key : undefined}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          variant='filled'
          onClose={handleClose}
          className='is-full shadow-xs items-center'
          severity={messageInfo?.severity || 'success'}
        >
          {messageInfo?.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext)

  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }

  return context
}
