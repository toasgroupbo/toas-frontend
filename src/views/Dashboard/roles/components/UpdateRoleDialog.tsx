'use client'

import { useState, useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import { useForm } from 'react-hook-form'

import CustomTextField from '@core/components/mui/TextField'
import type { UpdateRoleDto, Role, ResourceType, PermissionType } from '@/types/api/roles'
import { RESOURCES, PERMISSIONS, STATIC_ROLES } from '@/types/api/roles'

interface UpdateRoleDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (id: number, data: UpdateRoleDto) => void
  isLoading?: boolean
  existingRoles?: Role[]
  role: Role | null
}

const UpdateRoleDialog = ({ open, onClose, onSubmit, isLoading, existingRoles = [], role }: UpdateRoleDialogProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Partial<Record<ResourceType, PermissionType[]>>>({})

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<{ name: string }>({
    defaultValues: {
      name: ''
    }
  })

  useEffect(() => {
    if (open && role) {
      reset({ name: role.name })

      const permissions: Partial<Record<ResourceType, PermissionType[]>> = {}

      role.permissions.forEach(permission => {
        permissions[permission.resourse as ResourceType] = permission.permissions as PermissionType[]
      })

      setSelectedPermissions(permissions)
    }
  }, [open, role, reset])

  const validateRoleName = (value: string) => {
    if (!value.trim()) return 'El nombre es requerido'

    const trimmedValue = value.trim()

    if (trimmedValue.length < 3) return 'El nombre debe tener al menos 3 caracteres'

    if (STATIC_ROLES.includes(trimmedValue.toUpperCase())) {
      return 'Este nombre está reservado para roles del sistema'
    }

    const isDuplicate = existingRoles.some(
      r => r.id !== role?.id && r.name.toLowerCase() === trimmedValue.toLowerCase()
    )

    if (isDuplicate) {
      return 'Ya existe un rol con este nombre'
    }

    return true
  }

  const handlePermissionToggle = (resource: ResourceType, permission: PermissionType) => {
    setSelectedPermissions(prev => {
      const currentPermissions = prev[resource] || []

      const newPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission]

      if (newPermissions.length === 0) {
        const newState = { ...prev }

        delete newState[resource]

        return newState
      }

      return {
        ...prev,
        [resource]: newPermissions
      }
    })
  }

  const handleResourceToggle = (resource: ResourceType) => {
    const allPermissions = PERMISSIONS.map(p => p.value)
    const currentPermissions = selectedPermissions[resource] || []
    const isFullySelected = allPermissions.every(p => currentPermissions.includes(p))

    if (isFullySelected) {
      const newState = { ...selectedPermissions }

      delete newState[resource]
      setSelectedPermissions(newState)
    } else {
      setSelectedPermissions({
        ...selectedPermissions,
        [resource]: allPermissions
      })
    }
  }

  const isResourceSelected = (resource: ResourceType) => {
    const permissions = selectedPermissions[resource] || []

    return permissions.length === PERMISSIONS.length
  }

  const isResourcePartiallySelected = (resource: ResourceType) => {
    const permissions = selectedPermissions[resource] || []

    return permissions.length > 0 && permissions.length < PERMISSIONS.length
  }

  const handleFormSubmit = (data: { name: string }) => {
    if (!role) return

    const validation = validateRoleName(data.name)

    if (validation !== true) return

    const permissions = Object.entries(selectedPermissions)
      .filter(([_, perms]) => perms && perms.length > 0)
      .map(([resource, perms]) => ({
        resourse: resource,
        permissions: perms as PermissionType[]
      }))

    if (permissions.length === 0) {
      return
    }

    const formattedData: UpdateRoleDto = {
      name: data.name.trim(),
      permissions
    }

    onSubmit(role.id, formattedData)
  }

  const handleClose = () => {
    reset()
    setSelectedPermissions({})
    onClose()
  }

  const totalSelectedPermissions = Object.values(selectedPermissions).reduce(
    (acc, perms) => acc + (perms?.length || 0),
    0
  )

  const nameError = errors.name?.message

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box>
            <Typography variant='h5'>Editar Rol</Typography>
            <Typography variant='body2' color='text.secondary'>
              Actualice la información del rol
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isLoading}>
            <i className='tabler-x' />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={4}>
            <Grid size={12}>
              <CustomTextField
                fullWidth
                label='Nombre del Rol *'
                placeholder='Ej: Administrador de Ventas'
                {...register('name', { validate: validateRoleName })}
                error={!!nameError}
                helperText={nameError || 'Ingrese un nombre único para el rol'}
                disabled={isLoading || role?.isStatic}
              />
            </Grid>

            <Grid size={12}>
              <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='h6'>Permisos por Recurso</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {totalSelectedPermissions} permisos seleccionados
                </Typography>
              </Box>

              {totalSelectedPermissions === 0 && (
                <Alert severity='info' sx={{ mb: 2 }}>
                  Selecciona al menos un permiso para el rol
                </Alert>
              )}

              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width='200px'>
                        <Typography variant='subtitle2' fontWeight={600}>
                          Recurso
                        </Typography>
                      </TableCell>
                      {PERMISSIONS.map(permission => (
                        <TableCell key={permission.value} align='center' width='100px'>
                          <Typography variant='caption' fontWeight={600}>
                            {permission.label}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {RESOURCES.map(resource => (
                      <TableRow key={resource.value} hover>
                        <TableCell>
                          <Box display='flex' alignItems='center' gap={1}>
                            <Checkbox
                              checked={isResourceSelected(resource.value)}
                              indeterminate={isResourcePartiallySelected(resource.value)}
                              onChange={() => handleResourceToggle(resource.value)}
                              disabled={isLoading}
                            />
                            <Typography variant='body2'>{resource.label}</Typography>
                          </Box>
                        </TableCell>
                        {PERMISSIONS.map(permission => (
                          <TableCell key={permission.value} align='center'>
                            <Checkbox
                              checked={(selectedPermissions[resource.value] || []).includes(permission.value)}
                              onChange={() => handlePermissionToggle(resource.value, permission.value)}
                              disabled={isLoading}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={isLoading} color='secondary'>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading || totalSelectedPermissions === 0}>
            {isLoading ? 'Actualizando...' : 'Actualizar Rol'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default UpdateRoleDialog
