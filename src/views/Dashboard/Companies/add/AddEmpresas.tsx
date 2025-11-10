'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies'
import { useSnackbar } from '@/contexts/SnackbarContext'
import type { CreateCompanyDto, UpdateCompanyDto, Company } from '@/types/api/company'
import CreateCompanyDialog from '../components/CreateCompanyDialog'
import UpdateCompanyDialog from '../components/UpdateCompanyDialog'
import DeleteCompanyDialog from '../components/DeleteCompanyDialog'

interface Props {
  empresaId?: string
}

const FormularioEmpresa: React.FC<Props> = ({ empresaId }) => {
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const { data: companies, isLoading: loadingCompanies } = useCompanies()
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()
  const deleteMutation = useDeleteCompany()
  const { showSuccess, showError } = useSnackbar()

  const isEditMode = !!empresaId

  useEffect(() => {
    if (isEditMode && companies) {
      const company = companies.find(c => c.id === empresaId)

      if (company) {
        setSelectedCompany(company)
        setUpdateDialogOpen(true)
      }
    } else if (!isEditMode) {
      setCreateDialogOpen(true)
    }
  }, [empresaId, companies, isEditMode])

  const handleCreateCompany = async (data: CreateCompanyDto) => {
    try {
      await createMutation.mutateAsync(data)
      setCreateDialogOpen(false)
      showSuccess('Empresa creada correctamente')
      router.push('/companies/list')
    } catch (error: any) {
      console.error('Error al crear empresa:', error)
      showError(error?.response?.data?.message || 'Error al crear empresa')
    }
  }

  const handleUpdateCompany = async (id: string, data: UpdateCompanyDto) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      setUpdateDialogOpen(false)
      showSuccess('Empresa actualizada correctamente')
      router.push('/companies/list')
    } catch (error: any) {
      console.error('Error al actualizar empresa:', error)
      showError(error?.response?.data?.message || 'Error al actualizar empresa')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedCompany) return

    try {
      await deleteMutation.mutateAsync(selectedCompany.id)
      setDeleteDialogOpen(false)
      showSuccess('Empresa eliminada correctamente')
      router.push('/companies/list')
    } catch (error: any) {
      console.error('Error al eliminar empresa:', error)
      showError(error?.response?.data?.message || 'Error al eliminar empresa')
    }
  }

  const handleCancel = () => {
    setCreateDialogOpen(false)
    setUpdateDialogOpen(false)
    setDeleteDialogOpen(false)
    router.push('/companies/list')
  }

  if (isEditMode && loadingCompanies) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
                <CircularProgress />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  if (isEditMode && !selectedCompany && !loadingCompanies) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Empresa no encontrada' />
            <CardContent>
              <Typography>No se encontró la empresa que intentas editar.</Typography>
              <Button variant='contained' onClick={() => router.push('/companies/list')} sx={{ mt: 2 }}>
                Volver a la lista
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      <CreateCompanyDialog
        open={createDialogOpen}
        onClose={handleCancel}
        onSubmit={handleCreateCompany}
        isLoading={createMutation.isPending}
      />

      <UpdateCompanyDialog
        open={updateDialogOpen}
        onClose={handleCancel}
        onSubmit={handleUpdateCompany}
        company={selectedCompany}
        isLoading={updateMutation.isPending}
      />

      <DeleteCompanyDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        company={selectedCompany}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}

export default FormularioEmpresa
