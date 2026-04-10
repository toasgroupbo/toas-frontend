'use client'

import { useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material'

interface RechargeModalProps {
  open: boolean
  onClose: () => void
  selectedCustomers: any[]
  onRecharge: (customerIds: number[], amount: number) => void
  isRecharging: boolean
}

const RechargeModal = ({ open, onClose, selectedCustomers, onRecharge, isRecharging }: RechargeModalProps) => {
  const [amount, setAmount] = useState<number>(0)
  const [error, setError] = useState<string>('')

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)

    if (value < 0) {
      setError('El monto no puede ser negativo')
    } else {
      setError('')
    }

    setAmount(value || 0)
  }

  const handleSubmit = () => {
    if (amount <= 0) {
      setError('El monto debe ser mayor a 0')

      return
    }

    const customerIds = selectedCustomers.map(c => parseInt(c.id))

    onRecharge(customerIds, amount)
  }

  const totalAmount = amount * selectedCustomers.length

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Recargar Crédito</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            Clientes seleccionados: {selectedCustomers.length}
          </Typography>

          <Box sx={{ my: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              Clientes:
            </Typography>
            {selectedCustomers.slice(0, 5).map(customer => (
              <Typography key={customer.id} variant='body2'>
                • {customer.name} ({customer.email})
              </Typography>
            ))}
            {selectedCustomers.length > 5 && (
              <Typography variant='body2' color='text.secondary'>
                ... y {selectedCustomers.length - 5} más
              </Typography>
            )}
          </Box>

          <TextField
            autoFocus
            label='Monto por cliente'
            type='number'
            fullWidth
            value={amount}
            onChange={handleAmountChange}
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />

          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant='subtitle2' color='white'>
              Resumen:
            </Typography>
            <Typography variant='body2' color='white'>
              Monto por cliente: ${amount}
            </Typography>
            <Typography variant='body2' color='white'>
              Total a recargar: ${totalAmount}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isRecharging}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          color='primary'
          disabled={amount <= 0 || isRecharging || !!error}
        >
          {isRecharging ? <CircularProgress size={24} /> : 'Recargar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RechargeModal
