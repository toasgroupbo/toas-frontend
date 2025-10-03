'use client'

import { useState, useMemo, useEffect } from 'react'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import TablePagination from '@mui/material/TablePagination'
import Pagination from '@mui/material/Pagination'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import type { TextFieldProps } from '@mui/material/TextField'

import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import CustomTextField from '@core/components/mui/TextField'
import { useUsuarios } from '@/hooks/useUsuarios'
import { useSnackbar } from '@/contexts/SnackbarContext'
import type { Usuario, UsuarioWithActionsType, Roles } from '@/types/api/usuarios'

import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper<UsuarioWithActionsType>()

// Función para obtener el color del rol
const getRolColor = (rol: Roles): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (rol) {
    case 'Super_Admin':
      return 'error'
    case 'Admin':
      return 'primary'
    case 'Operador':
      return 'info'
    case 'Admin_Negocio':
      return 'success'
    case 'Operador_Negocio':
      return 'secondary'
    default:
      return 'secondary'
  }
}

// Función para obtener el texto del rol
const getRolLabel = (rol: Roles): string => {
  switch (rol) {
    case 'Super_Admin':
      return 'Super Admin'
    case 'Admin':
      return 'Admin'
    case 'Operador':
      return 'Operador'
    case 'Admin_Negocio':
      return 'Admin Negocio'
    case 'Operador_Negocio':
      return 'Op. Negocio'
    default:
      return rol
  }
}

const UsuariosTable = () => {
  const router = useRouter()
  const { showSuccess, showError } = useSnackbar()

  // Estados locales
  const [rowSelection, setRowSelection] = useState({})
  const [dialogoEliminarOpen, setDialogoEliminarOpen] = useState(false)
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalContraseniaOpen, setModalContraseniaOpen] = useState(false)
  const [usuarioContraseniaId, setUsuarioContraseniaId] = useState<number | null>(null)
  const [nuevaContrasenia, setNuevaContrasenia] = useState('')
  const [repetirContrasenia, setRepetirContrasenia] = useState('')
  const [errorContrasenia, setErrorContrasenia] = useState('')

  // Datos de usuarios
  const { usuarios, total, isLoading, error, useDeleteUsuario, refetchUsuarios } = useUsuarios(
    currentPage,
    pageSize,
    searchQuery
  )

  // Mutaciones
  const deleteUsuario = useDeleteUsuario()
  const cambiarContrasenia = useUsuarios().useCambiarContrasenia()

  // Handlers
  const handleCrearNuevo = () => {
    router.push('/usuarios/add')
  }

  const handleAbrirDialogoEliminar = (usuario: Usuario) => {
    setUsuarioAEliminar(usuario)
    setDialogoEliminarOpen(true)
  }

  const handleCerrarDialogoEliminar = () => {
    setDialogoEliminarOpen(false)
    setUsuarioAEliminar(null)
  }

  const handleConfirmarEliminacion = async () => {
    if (usuarioAEliminar?.id) {
      try {
        await deleteUsuario.mutateAsync(usuarioAEliminar.id)
        showSuccess('Usuario eliminado correctamente')
        handleCerrarDialogoEliminar()
      } catch (error: any) {
        console.error('Error eliminando usuario:', error)
        showError('Error al eliminar el usuario')
      }
    }
  }

  const handleAbrirModalContrasenia = (usuarioId: number) => {
    setUsuarioContraseniaId(usuarioId)
    setModalContraseniaOpen(true)
    setNuevaContrasenia('')
    setRepetirContrasenia('')
    setErrorContrasenia('')
  }

  const handleCerrarModalContrasenia = () => {
    setModalContraseniaOpen(false)
    setUsuarioContraseniaId(null)
    setNuevaContrasenia('')
    setRepetirContrasenia('')
    setErrorContrasenia('')
  }

  const handleCambiarContrasenia = async () => {
    if (!nuevaContrasenia.trim()) {
      setErrorContrasenia('La contraseña es requerida')

      return
    }

    if (nuevaContrasenia.length < 6) {
      setErrorContrasenia('La contraseña debe tener al menos 6 caracteres')

      return
    }

    if (nuevaContrasenia !== repetirContrasenia) {
      setErrorContrasenia('Las contraseñas no coinciden')

      return
    }

    if (usuarioContraseniaId) {
      try {
        await cambiarContrasenia.mutateAsync({
          id: usuarioContraseniaId,
          contraseña: nuevaContrasenia
        })
        showSuccess('Contraseña cambiada correctamente')
        handleCerrarModalContrasenia()
      } catch (error: any) {
        console.error('Error cambiando contraseña:', error)
        showError('Error al cambiar la contraseña')
      }
    }
  }

  const columns = useMemo<ColumnDef<UsuarioWithActionsType, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        ),
        enableSorting: false
      },
      columnHelper.accessor('actions', {
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Tooltip title='Editar usuario'>
              <IconButton
                component={Link}
                href={`/usuarios/edit/${row.original.id}`}
                size='small'
                sx={{
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                <i className='tabler-edit' style={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip>

            <Tooltip title='Cambiar contraseña'>
              <IconButton
                size='small'
                disabled={cambiarContrasenia.isPending}
                onClick={() => handleAbrirModalContrasenia(row.original.id)}
                sx={{
                  color: 'warning.main',
                  '&:hover': { backgroundColor: 'warning.light', color: 'white' }
                }}
              >
                <i className='tabler-key' style={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip>

            {/*  <Tooltip title='Eliminar usuario'>
              <IconButton
                size='small'
                disabled={deleteUsuario.isPending}
                onClick={() => handleAbrirDialogoEliminar(row.original)}
                sx={{
                  color: 'error.main',
                  '&:hover': { backgroundColor: 'error.light', color: 'white' }
                }}
              >
                <i className='tabler-trash' style={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip> */}
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('usuario', {
        header: 'Usuario',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: getRolColor(row.original.roles),
                fontSize: '14px'
              }}
            >
              {row.original.usuario.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Typography variant='body2' className='font-medium' color='text.primary'>
                {row.original.usuario}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('correo', {
        header: 'Correo',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.correo}
          </Typography>
        )
      }),
      columnHelper.accessor('roles', {
        header: 'Rol',
        cell: ({ row }) => (
          <Chip
            label={getRolLabel(row.original.roles)}
            color={getRolColor(row.original.roles)}
            variant='tonal'
            size='small'
            sx={{ fontWeight: 'medium' }}
          />
        )
      }),
      columnHelper.accessor('perfil_negocio', {
        header: 'Perfil de Negocio',
        cell: ({ row }) => {
          const negocio = row.original.perfil_negocio

          return (
            <div className='flex flex-col gap-1 max-w-sm'>
              <Typography variant='body2' className='font-medium' color='text.primary'>
                {negocio?.nombre_publicador}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                <i className='tabler-map-pin' style={{ fontSize: '12px', marginRight: '4px' }} />
                {negocio?.lugar?.nombre_es}
              </Typography>
            </div>
          )
        }
      }),

      /*  columnHelper.accessor('verificado', {
        header: 'Verificación',
        cell: ({ row }) => (
          <Chip
            label={row.original.verificado ? 'Verificado' : 'No verificado'}
            color={row.original.verificado ? 'success' : 'warning'}
            variant='tonal'
            size='small'
          />
        )
      }), */
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: ({ row }) => (
          <Chip
            label={row.original.estado ? 'Activo' : 'No activo'}
            color={row.original.estado ? 'success' : 'error'}
            variant='tonal'
            size='small'
          />
        )
      })
    ],
    [deleteUsuario.isPending, cambiarContrasenia.isPending]
  )

  const table = useReactTable({
    data: usuarios,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter: searchQuery
    },
    onGlobalFilterChange: setSearchQuery,
    globalFilterFn: fuzzyFilter,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (isLoading) {
    return (
      <Card className='p-6'>
        <div className='flex justify-center items-center h-64'>
          <Typography>Cargando usuarios...</Typography>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className='p-6'>
        <div className='flex justify-center items-center h-64'>
          <Typography color='error'>Error: {error.message}</Typography>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className='flex flex-wrap justify-between gap-4 p-6'>
        <div className='flex flex-wrap gap-4 items-center'>
          <DebouncedInput
            value={searchQuery}
            onChange={value => {
              setSearchQuery(String(value))
              setCurrentPage(1)
            }}
            placeholder='Buscar usuarios...'
            className='max-sm:is-full min-w-[250px] flex-1 max-w-md'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='tabler-search' style={{ fontSize: '20px' }} />
                </InputAdornment>
              )
            }}
          />
        </div>

        <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
          <CustomTextField
            select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className='flex-auto max-sm:is-full sm:is-[70px]'
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value={25}>25</MenuItem>
          </CustomTextField>

          <Button
            variant='contained'
            onClick={handleCrearNuevo}
            startIcon={<i className='tabler-user-plus' />}
            className='max-sm:is-full is-auto'
          >
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className='tabler-chevron-up text-xl' />,
                          desc: <i className='tabler-chevron-down text-xl' />
                        }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                  <Typography>No hay usuarios disponibles</Typography>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <TablePagination
        component={() => (
          <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
            <Typography color='text.disabled'>
              {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, total)} de ${total} usuarios`}
            </Typography>
            <Pagination
              shape='rounded'
              color='primary'
              variant='tonal'
              count={Math.ceil(total / pageSize)}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              showFirstButton
              showLastButton
            />
          </div>
        )}
        count={total}
        rowsPerPage={pageSize}
        page={currentPage - 1}
        onPageChange={() => {}}
      />

      <Dialog
        open={dialogoEliminarOpen}
        onClose={handleCerrarDialogoEliminar}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        closeAfterTransition={false}
      >
        <DialogTitle id='alert-dialog-title'>¿Eliminar usuario permanentemente?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {usuarioAEliminar && (
              <>
                Estás a punto de eliminar el usuario <strong>&quot;{usuarioAEliminar.usuario}&quot;</strong>(
                {usuarioAEliminar.correo}).
                <br />
                <br />
                Esta acción no se puede deshacer y el usuario será eliminado permanentemente del sistema.
                <br />
                <br />
                <strong>Rol:</strong> {usuarioAEliminar.roles}
                <br />
                <strong>Negocio:</strong> {usuarioAEliminar.perfil_negocio?.nombre_publicador}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleCerrarDialogoEliminar} color='secondary' disabled={deleteUsuario.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminacion}
            color='error'
            variant='contained'
            disabled={deleteUsuario.isPending}
            startIcon={deleteUsuario.isPending ? <i className='tabler-loader' /> : <i className='tabler-trash' />}
          >
            {deleteUsuario.isPending ? 'Eliminando...' : 'Eliminar Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={modalContraseniaOpen}
        onClose={handleCerrarModalContrasenia}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <i className='tabler-key' style={{ fontSize: '24px', color: 'var(--mui-palette-warning-main)' }} />
          Cambiar Contraseña
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <div className='space-y-4'>
            <CustomTextField
              fullWidth
              type='password'
              label='Nueva Contraseña'
              placeholder='Mínimo 6 caracteres'
              value={nuevaContrasenia}
              onChange={e => {
                setNuevaContrasenia(e.target.value)
                setErrorContrasenia('')
              }}
              error={!!errorContrasenia && errorContrasenia.includes('contraseña')}
              disabled={cambiarContrasenia.isPending}
            />

            <CustomTextField
              fullWidth
              type='password'
              label='Repetir Contraseña'
              placeholder='Confirmar nueva contraseña'
              value={repetirContrasenia}
              onChange={e => {
                setRepetirContrasenia(e.target.value)
                setErrorContrasenia('')
              }}
              error={!!errorContrasenia && errorContrasenia.includes('coinciden')}
              disabled={cambiarContrasenia.isPending}
            />

            {errorContrasenia && (
              <Typography variant='caption' color='error'>
                {errorContrasenia}
              </Typography>
            )}
          </div>
        </DialogContent>

        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleCerrarModalContrasenia} color='secondary' disabled={cambiarContrasenia.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleCambiarContrasenia}
            color='warning'
            variant='contained'
            disabled={cambiarContrasenia.isPending}
            startIcon={cambiarContrasenia.isPending ? <i className='tabler-loader' /> : <i className='tabler-key' />}
          >
            {cambiarContrasenia.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default UsuariosTable
