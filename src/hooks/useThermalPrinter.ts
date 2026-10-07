'use client'

import { useState, useCallback, useEffect } from 'react'

import {
  isWebUSBSupported,
  requestPrinter,
  connectToPrinter,
  disconnectPrinter,
  isConnected,
  getCurrentDevice,
  getPairedPrinters
} from '@/utils/thermal/webusb'

interface UseThermalPrinterReturn {
  isSupported: boolean
  isConnected: boolean
  deviceName: string | null
  isPrinting: boolean
  error: string | null
  connect: () => Promise<boolean>
  disconnect: () => Promise<void>
  print: (printFn: () => Promise<void>) => Promise<boolean>
}

export const useThermalPrinter = (): UseThermalPrinterReturn => {
  const [isSupported] = useState(() => isWebUSBSupported())
  const [connected, setConnected] = useState(false)
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isSupported) return

      const device = getCurrentDevice()

      if (device) {
        setConnected(true)
        setDeviceName(device.productName || 'Impresora térmica')
      } else {
        // Try to reconnect to a paired device
        const paired = await getPairedPrinters()

        if (paired.length > 0) {
          try {
            await connectToPrinter(paired[0])
            setConnected(true)
            setDeviceName(paired[0].productName || 'Impresora térmica')
          } catch {
            // Ignore - will need manual connection
          }
        }
      }
    }

    checkConnection()
  }, [isSupported])

  const connect = useCallback(async (): Promise<boolean> => {
    setError(null)

    if (!isSupported) {
      setError('WebUSB no está soportado. Use Chrome o Edge en Android.')

      return false
    }

    try {
      const device = await requestPrinter()

      if (!device) {
        setError('No se seleccionó ninguna impresora')

        return false
      }

      await connectToPrinter(device)
      setConnected(true)
      setDeviceName(device.productName || 'Impresora térmica')

      return true
    } catch (err: any) {
      setError(err.message || 'Error al conectar con la impresora')
      setConnected(false)
      setDeviceName(null)

      return false
    }
  }, [isSupported])

  const disconnect = useCallback(async (): Promise<void> => {
    await disconnectPrinter()
    setConnected(false)
    setDeviceName(null)
    setError(null)
  }, [])

  const print = useCallback(
    async (printFn: () => Promise<void>): Promise<boolean> => {
      setError(null)
      setIsPrinting(true)

      try {
        // Connect if not connected
        if (!isConnected()) {
          const success = await connect()

          if (!success) {
            setIsPrinting(false)

            return false
          }
        }

        await printFn()
        setIsPrinting(false)

        return true
      } catch (err: any) {
        setError(err.message || 'Error al imprimir')
        setIsPrinting(false)

        // If connection lost, update state
        if (err.message?.includes('Conexión perdida')) {
          setConnected(false)
          setDeviceName(null)
        }

        return false
      }
    },
    [connect]
  )

  return {
    isSupported,
    isConnected: connected,
    deviceName,
    isPrinting,
    error,
    connect,
    disconnect,
    print
  }
}

export default useThermalPrinter
