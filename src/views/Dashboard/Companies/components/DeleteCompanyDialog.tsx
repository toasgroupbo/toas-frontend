'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import type { Company } from '@/types/api/company'

interface DeleteCompanyDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  company: Company | null
  isLoading?: boolean
}

const DeleteCompanyDialog = ({ open, onClose, onConfirm, company, isLoading }: DeleteCompanyDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>¿Eliminar empresa permanentemente?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {company && (
            <>
              Estás a punto de eliminar la empresa <strong>&quot;{company.name}&quot;</strong>.
              <br />
              <br />
              <Box
                sx={{
                  bgcolor: 'error.lighter',
                  border: '1px solid',
                  borderColor: 'error.main',
                  borderRadius: 1,
                  p: 2,
                  mt: 2
                }}
              >
                <Typography variant='body2' color='error.main' sx={{ fontWeight: 600 }}>
                  ⚠️ Esta acción no se puede deshacer
                </Typography>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                  Se eliminarán todos los datos relacionados con esta empresa.
                </Typography>
              </Box>
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isLoading} color='secondary'>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color='error'
          variant='contained'
          disabled={isLoading}
          startIcon={<i className='tabler-trash' />}
        >
          {isLoading ? 'Eliminando...' : 'Eliminar Empresa'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteCompanyDialog
