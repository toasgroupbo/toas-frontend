// WebUSB utility for connecting to thermal printers

// Epson vendor ID
const EPSON_VENDOR_ID = 0x04b8

// Common Epson thermal printer product IDs
const EPSON_PRODUCT_IDS = [
  0x0202, // TM-T88 series
  0x0e15, // TM-T20II
  0x0e20, // TM-T20III
  0x0e28, // TM-T20IV
  0x0e03, // TM-m30
  0x0e06 // TM-T82
]

interface PrinterConnection {
  device: USBDevice
  interfaceNumber: number
  endpointOut: number
}

let currentConnection: PrinterConnection | null = null

export const isWebUSBSupported = (): boolean => {
  return 'usb' in navigator
}

export const requestPrinter = async (): Promise<USBDevice | null> => {
  if (!isWebUSBSupported()) {
    throw new Error('WebUSB no está soportado en este navegador. Use Chrome o Edge en Android.')
  }

  try {
    const device = await navigator.usb.requestDevice({
      filters: [
        { vendorId: EPSON_VENDOR_ID },

        // Generic thermal printer class
        { classCode: 7 } // Printer class
      ]
    })

    return device
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      return null // User cancelled
    }

    throw error
  }
}

export const connectToPrinter = async (device: USBDevice): Promise<PrinterConnection> => {
  await device.open()

  // Find the printer interface
  const configuration = device.configuration

  if (!configuration) {
    await device.selectConfiguration(1)
  }

  let interfaceNumber = -1
  let endpointOut = -1

  // Look for a bulk OUT endpoint
  for (const iface of device.configuration!.interfaces) {
    for (const alternate of iface.alternates) {
      // Look for printer class or bulk endpoints
      if (alternate.interfaceClass === 7 || alternate.endpoints.length > 0) {
        for (const endpoint of alternate.endpoints) {
          if (endpoint.direction === 'out' && endpoint.type === 'bulk') {
            interfaceNumber = iface.interfaceNumber
            endpointOut = endpoint.endpointNumber
            break
          }
        }
      }

      if (endpointOut !== -1) break
    }

    if (endpointOut !== -1) break
  }

  if (interfaceNumber === -1 || endpointOut === -1) {
    throw new Error('No se encontró un endpoint de impresión válido')
  }

  await device.claimInterface(interfaceNumber)

  currentConnection = {
    device,
    interfaceNumber,
    endpointOut
  }

  return currentConnection
}

export const disconnectPrinter = async (): Promise<void> => {
  if (currentConnection) {
    try {
      await currentConnection.device.releaseInterface(currentConnection.interfaceNumber)
      await currentConnection.device.close()
    } catch (error) {
      console.error('Error disconnecting printer:', error)
    }

    currentConnection = null
  }
}

export const sendToPrinter = async (data: Uint8Array): Promise<void> => {
  if (!currentConnection) {
    throw new Error('No hay impresora conectada')
  }

  const { device, endpointOut } = currentConnection

  // Send in chunks of 64 bytes (common USB packet size)
  const chunkSize = 64

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)

    await device.transferOut(endpointOut, chunk)
  }
}

export const printData = async (data: Uint8Array): Promise<void> => {
  // If no connection, request one
  if (!currentConnection) {
    const device = await requestPrinter()

    if (!device) {
      throw new Error('No se seleccionó ninguna impresora')
    }

    await connectToPrinter(device)
  }

  try {
    await sendToPrinter(data)
  } catch (error: any) {
    // If transfer fails, try to reconnect
    if (error.name === 'NotFoundError' || error.name === 'NetworkError') {
      currentConnection = null
      throw new Error('Conexión perdida con la impresora. Intente de nuevo.')
    }

    throw error
  }
}

export const getPairedPrinters = async (): Promise<USBDevice[]> => {
  if (!isWebUSBSupported()) {
    return []
  }

  try {
    const devices = await navigator.usb.getDevices()

    return devices.filter(
      (d: USBDevice) =>
        d.vendorId === EPSON_VENDOR_ID ||
        d.configuration?.interfaces.some((i: USBInterface) =>
          i.alternates.some((a: USBAlternateInterface) => a.interfaceClass === 7)
        )
    )
  } catch (error) {
    console.error('Error getting paired printers:', error)

    return []
  }
}

export const isConnected = (): boolean => {
  return currentConnection !== null
}

export const getCurrentDevice = (): USBDevice | null => {
  return currentConnection?.device || null
}
