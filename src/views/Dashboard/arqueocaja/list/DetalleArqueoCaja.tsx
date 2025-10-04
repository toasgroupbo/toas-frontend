'use client'

import { useParams, useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

interface DetalleVenta {
  nro: number
  salida: string
  destino: string
  totalAsientos: number
  asientosVacios: number
  asientosVendidosCaja: number
  totalVendidoCaja: number
}

interface ArqueoCajaDetalle {
  id: number
  nombreCajero: string
  fechaArqueo: string
  horaArqueo: string
  ventas: DetalleVenta[]
  totalCierreCaja: number
}

const datosDetalleEstatico: ArqueoCajaDetalle = {
  id: 3,
  nombreCajero: 'JUAN RAMOS',
  fechaArqueo: '25 DE JUNIO DE 2025',
  horaArqueo: '10:35 a. m.',
  ventas: [
    {
      nro: 1,
      salida: 'SANTA CRUZ',
      destino: 'COMARAPA',
      totalAsientos: 200,
      asientosVacios: 150,
      asientosVendidosCaja: 45,
      totalVendidoCaja: 300.0
    },
    {
      nro: 2,
      salida: 'SANTA CRUZ',
      destino: 'SAIPINA',
      totalAsientos: 300,
      asientosVacios: 200,
      asientosVendidosCaja: 90,
      totalVendidoCaja: 350.0
    },
    {
      nro: 3,
      salida: 'SANTA CRUZ',
      destino: 'VALLEGRANDE',
      totalAsientos: 400,
      asientosVacios: 300,
      asientosVendidosCaja: 85,
      totalVendidoCaja: 200.0
    }
  ],
  totalCierreCaja: 850.0
}

const DetalleArqueoCaja = () => {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const detalle = datosDetalleEstatico

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(valor)
  }

  const handleVolver = () => {
    router.push('/arqueo-caja')
  }

  const handleImprimir = () => {
    window.print()
  }

  return (
    <Box className='space-y-6'>
      <Card className='p-6'>
        <Box className='flex justify-between items-start mb-6'>
          <Box>
            <Typography variant='h4' className='font-bold mb-4'>
              ARQUEO DE CAJA
            </Typography>
            <Box className='space-y-2'>
              <Box className='flex gap-4'>
                <Typography className='font-semibold' sx={{ minWidth: 180 }}>
                  NOMBRE CAJERO:
                </Typography>
                <Typography>{detalle.nombreCajero}</Typography>
              </Box>
              <Box className='flex gap-4'>
                <Typography className='font-semibold' sx={{ minWidth: 180 }}>
                  FECHA DE ARQUEO:
                </Typography>
                <Typography>{detalle.fechaArqueo}</Typography>
              </Box>
              <Box className='flex gap-4'>
                <Typography className='font-semibold' sx={{ minWidth: 180 }}>
                  HORA DE ARQUEO:
                </Typography>
                <Typography>{detalle.horaArqueo}</Typography>
              </Box>
            </Box>
          </Box>

          <Box className='text-right print:hidden'>
            <img
              src='/images/logo.png'
              alt='Logo Empresa'
              style={{ maxHeight: 80 }}
              onError={e => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </Box>
        </Box>

        <Divider className='my-6' />

        <TableContainer component={Paper} variant='outlined'>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell align='center' className='font-bold'>
                  NRO
                </TableCell>
                <TableCell align='center' className='font-bold'>
                  SALIDA
                </TableCell>
                <TableCell align='center' className='font-bold'>
                  DESTINO
                </TableCell>
                <TableCell align='center' className='font-bold'>
                  TOTAL ASIENTOS
                </TableCell>
                <TableCell align='center' className='font-bold'>
                  ASIENTOS VACIOS
                </TableCell>
                <TableCell align='center' className='font-bold'>
                  ASIENTOS VENDIDO CAJA
                </TableCell>
                <TableCell align='center' className='font-bold'>
                  TOTAL VENDIDO $$
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detalle.ventas.map(venta => (
                <TableRow key={venta.nro} hover>
                  <TableCell align='center'>{venta.nro}</TableCell>
                  <TableCell align='center'>{venta.salida}</TableCell>
                  <TableCell align='center'>{venta.destino}</TableCell>
                  <TableCell align='center'>{venta.totalAsientos}</TableCell>
                  <TableCell align='center'>{venta.asientosVacios}</TableCell>
                  <TableCell align='center'>{venta.asientosVendidosCaja}</TableCell>
                  <TableCell align='right' className='font-medium'>
                    {formatearMoneda(venta.totalVendidoCaja)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={6} align='right' className='font-bold' sx={{ fontSize: '1rem' }}>
                  TOTAL CIERRE DE CAJA:
                </TableCell>
                <TableCell
                  align='right'
                  className='font-bold'
                  sx={{
                    backgroundColor: 'warning.light',
                    color: 'error.main',
                    fontSize: '1.1rem'
                  }}
                >
                  {formatearMoneda(detalle.totalCierreCaja)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box className='flex justify-end gap-4 mt-6 print:hidden'>
          <Button variant='outlined' onClick={handleVolver} startIcon={<i className='tabler-arrow-left' />}>
            Volver
          </Button>
          <Button variant='contained' onClick={handleImprimir} startIcon={<i className='tabler-printer' />}>
            Imprimir
          </Button>
        </Box>
      </Card>
    </Box>
  )
}

export default DetalleArqueoCaja
