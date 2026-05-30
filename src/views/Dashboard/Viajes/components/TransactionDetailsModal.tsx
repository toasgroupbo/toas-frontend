'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'

interface PaymentDetail {
  TitularName?: string
  AccountNumber?: string
  DocumentNumber?: string
  DocumentExtension?: string
  BankDescription?: string | null
  BranchOfficeDescription?: string | null
  Amount?: number
  PaymentType?: string
  GlossPayment?: string
  FirstDetail?: string
  OperationNumberDebitHost?: string
  OperationStatusDescription?: string
}

interface BatchDetailResponse {
  Amount?: number
  Currency?: string
  FundSource?: string
  FundDestination?: string
  Description?: string
  StatusOperation?: string
  SourceAccount?: string
  TypeOperation?: string
  ProcessBatchId?: number
  DateProcess?: string
  Spreadsheet?: {
    FormAchPayments?: PaymentDetail[]
    FormProvidersPayments?: PaymentDetail[]
    FormOddPayments?: PaymentDetail[]
    FormYapePayments?: PaymentDetail[]
  }
  UserInvolveds?: Array<{
    UserName?: string
    DateAction?: string
    UserDescription?: string
  }>
}

interface Transaction {
  id: number
  transactionId: string
  status: string
  batchDetailResponse?: BatchDetailResponse
  totalAmount: string
  createdAt: string
  authorizedAt: string | null
  completedAt: string | null
}

interface TravelData {
  id: number
  departure_time: string
  bus: {
    name: string
    plaque: string
  }
  route: {
    officeOrigin: {
      place: {
        name: string
      }
    }
    officeDestination: {
      place: {
        name: string
      }
    }
  }
  transaction?: Transaction
}

interface TransactionDetailsModalProps {
  open: boolean
  onClose: () => void
  travel: TravelData | null
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '-'
  const date = new Date(dateString)

  return date.toLocaleString('es-BO', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  return `Bs. ${numAmount.toFixed(2)}`
}

const TransactionDetailsModal = ({ open, onClose, travel }: TransactionDetailsModalProps) => {
  if (!travel || !travel.transaction) return null

  const transaction = travel.transaction
  const batchDetail = transaction.batchDetailResponse

  // Get payment detail from either FormAchPayments or FormProvidersPayments
  const paymentDetail =
    batchDetail?.Spreadsheet?.FormAchPayments?.[0] || batchDetail?.Spreadsheet?.FormProvidersPayments?.[0]

  const isAchPayment = (batchDetail?.Spreadsheet?.FormAchPayments?.length || 0) > 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center' gap={2}>
            <i className='tabler-receipt-2' style={{ fontSize: '24px', color: 'var(--mui-palette-success-main)' }} />
            <Box>
              <Typography variant='h6'>Comprobante de Pago</Typography>
              <Typography variant='body2' color='text.secondary'>
                Transacción #{transaction.transactionId}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'success.lighter', borderRadius: 2, textAlign: 'center' }}>
          <Chip label='COMPLETADO' color='success' size='small' sx={{ mb: 1 }} />
          <Typography variant='h4' color='success.dark' fontWeight='bold'>
            {formatCurrency(transaction.totalAmount)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant='subtitle2' color='text.secondary' gutterBottom>
          Información del Viaje
        </Typography>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant='caption' color='text.secondary'>
                Bus
              </Typography>
              <Typography variant='body2' fontWeight={500}>
                {travel.bus.name} - {travel.bus.plaque}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant='caption' color='text.secondary'>
                Ruta
              </Typography>
              <Typography variant='body2' fontWeight={500}>
                {travel.route.officeOrigin.place.name} → {travel.route.officeDestination.place.name}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant='caption' color='text.secondary'>
                Salida
              </Typography>
              <Typography variant='body2'>{formatDateTime(travel.departure_time)}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant='caption' color='text.secondary'>
                Fecha de Pago
              </Typography>
              <Typography variant='body2'>{formatDateTime(transaction.completedAt)}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant='subtitle2' color='text.secondary' gutterBottom>
          Datos de la Transferencia
        </Typography>
        {paymentDetail ? (
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary'>
                  Titular de la Cuenta
                </Typography>
                <Typography variant='body1' fontWeight={600} color='primary.main'>
                  {paymentDetail.TitularName || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant='caption' color='text.secondary'>
                  Número de Cuenta
                </Typography>
                <Typography variant='body2' fontFamily='monospace' fontWeight={500}>
                  {paymentDetail.AccountNumber || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant='caption' color='text.secondary'>
                  CI/NIT
                </Typography>
                <Typography variant='body2' fontFamily='monospace'>
                  {paymentDetail.DocumentNumber || '-'}
                  {paymentDetail.DocumentExtension && ` (${paymentDetail.DocumentExtension.trim()})`}
                </Typography>
              </Grid>
              {isAchPayment && paymentDetail.BankDescription && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Banco
                  </Typography>
                  <Typography variant='body2' fontWeight={500}>
                    {paymentDetail.BankDescription}
                    {paymentDetail.BranchOfficeDescription && ` - ${paymentDetail.BranchOfficeDescription}`}
                  </Typography>
                </Grid>
              )}
              <Grid size={{ xs: 6 }}>
                <Typography variant='caption' color='text.secondary'>
                  Nro. Operación
                </Typography>
                <Typography variant='body2' fontFamily='monospace' fontWeight={500} color='success.main'>
                  {paymentDetail.OperationNumberDebitHost || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant='caption' color='text.secondary'>
                  Estado
                </Typography>
                <Typography variant='body2' fontWeight={500}>
                  {paymentDetail.OperationStatusDescription || batchDetail?.StatusOperation || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary'>
                  Concepto
                </Typography>
                <Typography variant='body2' color='text.secondary' fontStyle='italic'>
                  {batchDetail?.FundDestination || paymentDetail.GlossPayment || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography color='text.secondary'>No hay detalles de transferencia disponibles</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant='contained' color='primary'>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TransactionDetailsModal
