'use client'

import { useState, useEffect } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Grid2 as Grid,
  Card,
  CardContent,
  CardMedia
} from '@mui/material'

import type { Commission } from '@/types/api/commissions'

interface UpdateCommissionDialogProps {
  open: boolean
  commission: Commission
  onClose: () => void
  onSubmit: (
    paidAmount: string,
    voucherFile: File | null,
    paidAt: string,
    existingVoucher: string | null
  ) => Promise<void>
  isLoading: boolean
}

const UpdateCommissionDialog = ({ open, commission, onClose, onSubmit, isLoading }: UpdateCommissionDialogProps) => {
  const [paidAmount, setPaidAmount] = useState<string>('')
  const [voucherFile, setVoucherFile] = useState<File | null>(null)
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null)
  const [paidAt, setPaidAt] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Initialize paid amount, paidAt, and voucher preview
  useEffect(() => {
    if (open) {
      // Pre-fill with the current paid amount, or use commission_company if paid is 0
      const currentPaid = parseFloat(commission.paid)

      setPaidAmount(currentPaid > 0 ? commission.paid : commission.net_to_company)
      setVoucherFile(null)
      setError('')

      // Initialize paidAt with existing value or current date/time
      if (commission.paidAt) {
        // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
        const date = new Date(commission.paidAt)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        setPaidAt(`${year}-${month}-${day}T${hours}:${minutes}`)
      } else {
        // Set to current date/time in Bolivia timezone
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')

        setPaidAt(`${year}-${month}-${day}T${hours}:${minutes}`)
      }

      // Initialize voucher preview with full URL
      if (commission.voucher) {
        const voucherUrl = commission.voucher.startsWith('http')
          ? commission.voucher
          : `${process.env.NEXT_PUBLIC_API_URL}${commission.voucher}`

        setVoucherPreview(voucherUrl)
      } else {
        setVoucherPreview(null)
      }
    }
  }, [open, commission])

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido')

        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5MB')

        return
      }

      setVoucherFile(file)
      setError('')

      // Create preview
      const reader = new FileReader()

      reader.onloadend = () => {
        setVoucherPreview(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate paid amount
    if (!paidAmount || parseFloat(paidAmount) <= 0) {
      setError('Por favor ingresa un monto válido')

      return
    }

    // Validate voucher upload for new payments
    if (commission.paid !== 'paid' && !voucherFile && !commission.voucher) {
      setError('Por favor adjunta un comprobante de pago')

      return
    }

    setError('')
    await onSubmit(paidAmount, voucherFile, paidAt, commission.voucher)
  }

  // Format currency
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value

    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(numValue)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-BO', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={2}>
          <Avatar src={commission.company.logo} alt={commission.company.name}>
            {commission.company.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant='h6'>Actualizar Comisión</Typography>
            <Typography variant='body2' color='text.secondary'>
              {commission.company.name}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Card variant='outlined' sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant='caption' color='text.secondary'>
                  Periodo
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {commission.period_key}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant='caption' color='text.secondary'>
                  Viajes Totales
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {commission.total_trips_count}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant='caption' color='text.secondary'>
                  Tickets App
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {commission.tickets_app_count_total}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        <TextField
          fullWidth
          label='Monto Pagado'
          type='number'
          value={paidAmount}
          onChange={e => setPaidAmount(e.target.value)}
          placeholder='0.00'
          slotProps={{
            input: {
              startAdornment: <Typography sx={{ mr: 1 }}>Bs.</Typography>
            }
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label='Fecha y Hora de Pago'
          type='datetime-local'
          value={paidAt}
          onChange={e => setPaidAt(e.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true
            }
          }}
          sx={{ mb: 3 }}
        />

        <Box sx={{ mb: 2 }}>
          <Typography variant='subtitle2' gutterBottom>
            Comprobante de Pago
          </Typography>
          <Button variant='outlined' component='label' startIcon={<i className='tabler-upload' />} fullWidth>
            {voucherFile ? 'Cambiar Comprobante' : commission.voucher ? 'Actualizar Comprobante' : 'Subir Comprobante'}
            <input type='file' hidden accept='image/*' onChange={handleFileChange} />
          </Button>
        </Box>

        {voucherPreview && (
          <Card variant='outlined'>
            <CardMedia
              component='img'
              image={voucherPreview}
              alt='Comprobante'
              sx={{ maxHeight: 400, objectFit: 'contain', p: 2 }}
            />
          </Card>
        )}

        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={isLoading}
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UpdateCommissionDialog
