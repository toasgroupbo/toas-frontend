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
import type { CreateRoleDto, UpdateRoleDto, Role, ResourceType, PermissionType } from '@/types/api/roles'
import { RESOURCES, PERMISSIONS, STATIC_ROLES } from '@/types/api/roles'

interface RoleDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateRoleDto, id?: number) => void
  isLoading?: boolean
  existingRoles?: Role[]
  role?: Role | null
}

// Recursos ocultos que se envían automáticamente con COMPANY READ
const HIDDEN_COMPANY_RESOURCES: ResourceType[] = ['OFFICE', 'OWNER', 'ROUTE', 'BUS', 'TRAVEL', 'CASHIER', 'FILE']

// Permisos completos que se asignan a los recursos ocultos
const FULL_PERMISSIONS: PermissionType[] = ['CREATE', 'READ', 'UPDATE', 'DELETE']

const RoleDialog = ({ open, onClose, onSubmit, isLoading, existingRoles = [], role }: RoleDialogProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Partial<Record<ResourceType, PermissionType[]>>>({})
  const isEditMode = !!role

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
      // Modo edición
      reset({ name: role.name })

      const permissions: Partial<Record<ResourceType, PermissionType[]>> = {}

      role.permissions.forEach(permission => {
        const resourceType = permission.resourse as ResourceType

        if (!HIDDEN_COMPANY_RESOURCES.includes(resourceType)) {
          permissions[resourceType] = permission.permissions as PermissionType[]
        }
      })

      setSelectedPermissions(permissions)
    } else if (open && !role) {
      // Modo creación
      reset({ name: '' })
      setSelectedPermissions({})
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

  const isReadDisabledForCompany = (resource: ResourceType): boolean => {
    if (resource !== 'COMPANY') return false
    const companyPerms = selectedPermissions['COMPANY'] || []

    return companyPerms.some(p => ['CREATE', 'UPDATE', 'DELETE'].includes(p))
  }

  const isPermissionDisabled = (resource: ResourceType, permission: PermissionType): boolean => {
    if (resource === 'CUSTOMER' && permission !== 'READ') {
      return true
    }

    if (resource === 'COMPANY' && permission === 'READ' && isReadDisabledForCompany('COMPANY')) {
      return true
    }

    return false
  }

  const handlePermissionToggle = (resource: ResourceType, permission: PermissionType) => {
    if (isPermissionDisabled(resource, permission)) return

    setSelectedPermissions(prev => {
      const currentPermissions = prev[resource] || []

      let newPermissions: PermissionType[]

      if (currentPermissions.includes(permission)) {
        newPermissions = currentPermissions.filter(p => p !== permission)

        if (resource === 'COMPANY' && ['CREATE', 'UPDATE', 'DELETE'].includes(permission)) {
          const remainingMutations = newPermissions.filter(p => ['CREATE', 'UPDATE', 'DELETE'].includes(p))

          if (remainingMutations.length === 0) {
          }
        }
      } else {
        newPermissions = [...currentPermissions, permission]

        if (resource === 'COMPANY' && ['CREATE', 'UPDATE', 'DELETE'].includes(permission)) {
          if (!newPermissions.includes('READ')) {
            newPermissions.push('READ')
          }
        }
      }

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
    if (resource === 'CUSTOMER') {
      const hasRead = (selectedPermissions['CUSTOMER'] || []).includes('READ')

      if (hasRead) {
        const newState = { ...selectedPermissions }

        delete newState['CUSTOMER']
        setSelectedPermissions(newState)
      } else {
        setSelectedPermissions({
          ...selectedPermissions,
          CUSTOMER: ['READ']
        })
      }

      return
    }

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

    if (resource === 'CUSTOMER') {
      return permissions.includes('READ')
    }

    return permissions.length === PERMISSIONS.length
  }

  const isResourcePartiallySelected = (resource: ResourceType) => {
    const permissions = selectedPermissions[resource] || []

    if (resource === 'CUSTOMER') {
      return false
    }

    return permissions.length > 0 && permissions.length < PERMISSIONS.length
  }

  const handleFormSubmit = (data: { name: string }) => {
    const validation = validateRoleName(data.name)

    if (validation !== true) return

    let permissions = Object.entries(selectedPermissions)
      .filter(([_, perms]) => perms && perms.length > 0)
      .map(([resource, perms]) => ({
        resourse: resource,
        permissions: perms as PermissionType[]
      }))

    const companyPermissions = selectedPermissions['COMPANY'] || []

    if (companyPermissions.includes('READ')) {
      HIDDEN_COMPANY_RESOURCES.forEach(hiddenResource => {
        const existingIndex = permissions.findIndex(p => p.resourse === hiddenResource)

        if (existingIndex !== -1) {
          permissions[existingIndex].permissions = FULL_PERMISSIONS
        } else {
          permissions.push({
            resourse: hiddenResource,
            permissions: FULL_PERMISSIONS
          })
        }
      })
    } else {
      permissions = permissions.filter(p => !HIDDEN_COMPANY_RESOURCES.includes(p.resourse as ResourceType))
    }

    if (permissions.length === 0) {
      return
    }

    const formattedData: CreateRoleDto = {
      name: data.name.trim(),
      permissions
    }

    onSubmit(formattedData, role?.id)
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
            <Typography variant='h5'>{isEditMode ? 'Editar Rol' : 'Crear Nuevo Rol'}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {isEditMode ? 'Actualice la información del rol' : 'Complete la información del nuevo rol'}
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
                  Selecciona al menos un permiso para {isEditMode ? 'actualizar' : 'crear'} el rol
                </Alert>
              )}

              {/*  {selectedPermissions['COMPANY']?.includes('READ') && (
                <Alert severity='success' sx={{ mb: 2 }}>
                  Al seleccionar &quot;Leer&quot; en Empresas, se incluyen automáticamente{' '}
                  <strong>todos los permisos (Crear, Leer, Actualizar, Eliminar)</strong> para: Oficinas, Propietarios,
                  Rutas, Buses, Viajes, Cajas, Archivos y Tickets
                </Alert>
              )} */}

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
                        {PERMISSIONS.map(permission => {
                          if (resource.value === 'CUSTOMER' && permission.value !== 'READ') {
                            return <TableCell key={permission.value} align='center'></TableCell>
                          }

                          return (
                            <TableCell key={permission.value} align='center'>
                              <Checkbox
                                checked={(selectedPermissions[resource.value] || []).includes(permission.value)}
                                onChange={() => handlePermissionToggle(resource.value, permission.value)}
                                disabled={isLoading || isPermissionDisabled(resource.value, permission.value)}
                              />
                            </TableCell>
                          )
                        })}
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
            {isLoading ? (isEditMode ? 'Actualizando...' : 'Creando...') : isEditMode ? 'Actualizar Rol' : 'Crear Rol'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RoleDialog
