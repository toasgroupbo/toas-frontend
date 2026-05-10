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

import { useUpdateCommission } from '@/hooks/useCommissions'
import { useUploadImage } from '@/hooks/useUploadImage'
import type { Commission } from '@/types/api/commissions'

interface UpdateCommissionDialogProps {
  open: boolean
  commission: Commission
  onClose: () => void
}

const UpdateCommissionDialog = ({ open, commission, onClose }: UpdateCommissionDialogProps) => {
  const [paidAmount, setPaidAmount] = useState<string>('')
  const [voucherFile, setVoucherFile] = useState<File | null>(null)
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const { mutate: updateCommission, isPending } = useUpdateCommission()
  const uploadImageMutation = useUploadImage()

  // Initialize paid amount and voucher preview
  useEffect(() => {
    if (open) {
      setPaidAmount(commission.paid === 'paid' ? commission.commission_company : '')
      setVoucherFile(null)
      setError('')

      if (commission.voucher) {
        setVoucherPreview(commission.voucher)
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

    try {
      setIsUploading(true)
      setError('')

      // Format paid amount to match backend regex: ^\d+(\.\d{1,2})?$
      const formattedAmount = parseFloat(paidAmount).toFixed(2)

      // Upload image first if there's a new file
      let voucherUrl = commission.voucher || ''

      if (voucherFile) {
        try {
          voucherUrl = await uploadImageMutation.mutateAsync(voucherFile)
        } catch (error) {
          console.error('Error al subir comprobante:', error)
          setError('Error al subir el comprobante. Por favor, intente nuevamente.')
          setIsUploading(false)

          return
        }
      }

      // Update commission with the voucher URL
      updateCommission(
        {
          id: commission.id,
          payload: {
            paid: formattedAmount,
            voucherUrl: voucherUrl
          }
        },
        {
          onSuccess: () => {
            setIsUploading(false)
            onClose()
          },
          onError: err => {
            setIsUploading(false)
            setError('Error al actualizar la comisión. Por favor intenta nuevamente.')
            console.error('Error updating commission:', err)
          }
        }
      )
    } catch (error) {
      setIsUploading(false)
      setError('Error inesperado. Por favor intenta nuevamente.')
      console.error('Unexpected error:', error)
    }
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
    return new Date(dateString).toLocaleDateString('es-PE', {
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
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant='caption' color='text.secondary'>
                  Comisión App
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {formatCurrency(commission.commission_app_total)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant='caption' color='text.secondary'>
                  Comisión Empresa
                </Typography>
                <Typography variant='body1' fontWeight={600} color='primary'>
                  {formatCurrency(commission.commission_company)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant='caption' color='text.secondary'>
                  Tasa de Comisión
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {commission.commission_rate_at_time}%
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary'>
                  Rango del Periodo
                </Typography>
                <Typography variant='body2'>
                  {formatDate(commission.period_start)} - {formatDate(commission.period_end)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary'>
                  Fecha de Pago
                </Typography>
                <Typography variant='body2'>{formatDate(commission.date_to_pay)}</Typography>
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
            <CardMedia component='img' image={voucherPreview} alt='Comprobante' sx={{ maxHeight: 400, objectFit: 'contain', p: 2 }} />
          </Card>
        )}

        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isPending || isUploading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={isPending || isUploading}
          startIcon={(isPending || isUploading) && <CircularProgress size={20} />}
        >
          {isUploading ? 'Subiendo comprobante...' : isPending ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UpdateCommissionDialog
