'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography
} from '@mui/material'

interface ViewVoucherModalProps {
  open: boolean
  onClose: () => void
  voucherUrl: string
  companyName: string
}

const ViewVoucherModal = ({ open, onClose, voucherUrl, companyName }: ViewVoucherModalProps) => {
  // Build full URL if it's a relative path
  const fullVoucherUrl = voucherUrl.startsWith('http')
    ? voucherUrl
    : `${process.env.NEXT_PUBLIC_API_URL}${voucherUrl}`

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center' gap={2}>
            <i className='tabler-receipt' style={{ fontSize: '24px' }} />
            <Box>
              <Typography variant='h6'>Comprobante de Pago</Typography>
              <Typography variant='body2' color='text.secondary'>
                {companyName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            bgcolor: 'action.hover',
            borderRadius: 2,
            p: 2
          }}
        >
          <img
            src={fullVoucherUrl}
            alt='Comprobante de pago'
            style={{
              maxWidth: '100%',
              maxHeight: '500px',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          variant='outlined'
          startIcon={<i className='tabler-download' />}
          onClick={() => window.open(fullVoucherUrl, '_blank')}
        >
          Descargar
        </Button>
        <Button onClick={onClose} variant='contained'>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewVoucherModal
