'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

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

import { Pagination } from '@mui/material'

import ModalAddLugar from '@/views/Dashboard/Companies/add/ModalAddLugar'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

import { useLugares } from '@/hooks/useLugares'
import type { Lugar } from '@/types/api/lugares'

import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type LugarWithActionsType = Lugar & {
  actions?: string
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

const columnHelper = createColumnHelper<LugarWithActionsType>()

const LugaresTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [lugarAEditar, setLugarAEditar] = useState<Lugar | null>(null)
  const [dialogoEliminarOpen, setDialogoEliminarOpen] = useState(false)
  const [lugarAEliminar, setLugarAEliminar] = useState<Lugar | null>(null)
  const [modalErrorOpen, setModalErrorOpen] = useState(false)
  const [mensajeError, setMensajeError] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const { lugares, total, isLoading, error, useDeleteLugar, refetchLugares } = useLugares(
    currentPage,
    pageSize,
    searchQuery
  )

  const deleteLugar = useDeleteLugar()

  const handleOpenModal = () => {
    setLugarAEditar(null)
    setModalOpen(true)
  }

  const handleOpenModalEditar = (lugar: Lugar) => {
    setLugarAEditar(lugar)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setLugarAEditar(null)
  }

  const handleLugarCreado = (lugar: any) => {
    setModalOpen(false)
    setLugarAEditar(null)
    refetchLugares()
  }

  const handleAbrirDialogoEliminar = (lugar: Lugar) => {
    setLugarAEliminar(lugar)
    setDialogoEliminarOpen(true)
  }

  const handleCerrarDialogoEliminar = () => {
    setDialogoEliminarOpen(false)
    setLugarAEliminar(null)
  }

  const handleConfirmarEliminacion = async () => {
    if (lugarAEliminar?.id) {
      try {
        await deleteLugar.mutateAsync(lugarAEliminar.id)
        handleCerrarDialogoEliminar()
      } catch (error: any) {
        console.error('Error eliminando lugar:', error)

        setMensajeError(error.message || 'Error al eliminar el lugar')
        setModalErrorOpen(true)
        handleCerrarDialogoEliminar()
      }
    }
  }

  const handleCerrarModalError = () => {
    setModalErrorOpen(false)
    setMensajeError('')
  }

  const columns = useMemo<ColumnDef<LugarWithActionsType, any>[]>(
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
        )
      },
      columnHelper.accessor('actions', {
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton
              size='small'
              onClick={() => handleOpenModalEditar(row.original)}
              sx={{
                color: 'primary.main',
                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
              }}
            >
              <i className='tabler-edit' style={{ fontSize: '18px' }} />
            </IconButton>

            <IconButton
              size='small'
              disabled={deleteLugar.isPending}
              onClick={() => handleAbrirDialogoEliminar(row.original)}
              sx={{
                color: 'error.main',
                '&:hover': { backgroundColor: 'error.light', color: 'white' }
              }}
            >
              <i className='tabler-trash' style={{ fontSize: '18px' }} />
            </IconButton>
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('nombre_es', {
        header: 'Nombre',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            <Typography className='font-medium' color='text.primary'>
              ES: {row.original.nombre_es}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              EN: {row.original.nombre_en}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('direccion', {
        header: 'Dirección',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            <Typography variant='body2' color='text.primary'>
              {row.original.direccion}
            </Typography>
            {row.original.ubicacion && (
              <Typography variant='caption' color='text.secondary'>
                📍 {row.original.ubicacion}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('descripcion_es', {
        header: 'Descripción',
        size: 400,
        cell: ({ row }) => (
          <div className='flex flex-col gap-2 w-96 min-w-96 py-2'>
            <Typography
              variant='body2'
              color='text.primary'
              className='whitespace-pre-wrap break-words leading-relaxed'
              style={{
                wordBreak: 'break-word',
                lineHeight: '1.4',
                maxWidth: '100%'
              }}
            >
              <strong>ES:</strong> {row.original.descripcion_es || 'Sin descripción'}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              className='whitespace-pre-wrap break-words leading-relaxed'
              style={{
                wordBreak: 'break-word',
                lineHeight: '1.4',
                maxWidth: '100%'
              }}
            >
              <strong>EN:</strong> {row.original.descripcion_en || 'Sin descripción'}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('imagenes', {
        header: 'Imagen',
        cell: ({ row }) => {
          const primerImagen = row.original.imagenes?.[0]

          return (
            <div className='flex items-center gap-2'>
              {primerImagen ? (
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}api/imagenes/lugares/${primerImagen}`}
                    alt={row.original.nombre_es}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={e => {
                      e.currentTarget.src = '/images/placeholder-lugar.jpg'
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    border: '2px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'action.hover'
                  }}
                >
                  <i className='tabler-photo' style={{ fontSize: '24px', color: 'var(--mui-palette-text-disabled)' }} />
                </Box>
              )}
              {row.original.imagenes && row.original.imagenes.length > 1 && (
                <Chip label={`+${row.original.imagenes.length - 1}`} size='small' variant='outlined' />
              )}
            </div>
          )
        }
      }),
      columnHelper.accessor('url_ubicacion', {
        header: 'Ubicación',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            {row.original.url_ubicacion ? (
              <IconButton
                component='a'
                href={row.original.url_ubicacion}
                target='_blank'
                rel='noopener noreferrer'
                size='small'
                sx={{
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.light' }
                }}
              >
                <i className='tabler-map-pin' style={{ fontSize: '18px' }} />
              </IconButton>
            ) : (
              <Typography variant='body2' color='text.disabled'>
                Sin ubicación
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: ({ row }) => (
          <Chip
            label={row.original.estado ? 'Activo' : 'Inactivo'}
            color={row.original.estado ? 'success' : 'error'}
            variant='tonal'
            size='small'
          />
        )
      })
    ],
    [deleteLugar.isPending]
  )

  const table = useReactTable({
    data: lugares, // Ahora completamente type-safe
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,

    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel()
  })

  if (isLoading) {
    return (
      <Card className='p-6'>
        <div className='flex justify-center items-center h-64'>
          <Typography>Cargando lugares...</Typography>
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
        <DebouncedInput
          value={searchQuery}
          onChange={value => {
            setSearchQuery(String(value))
            setCurrentPage(1)
          }}
          placeholder='Buscar lugares...'
          className='max-sm:is-full flex-1 max-w-md'
        />
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
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='15'>15</MenuItem>
            <MenuItem value='25'>25</MenuItem>
          </CustomTextField>
          <Button variant='contained' onClick={handleOpenModal} startIcon={<i className='tabler-plus' />}>
            Nuevo Lugar
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
                  <Typography>No hay lugares disponibles</Typography>
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
              {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, total)} de ${total} lugares`}
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
      <ModalAddLugar
        open={modalOpen}
        onClose={handleCloseModal}
        onLugarCreado={handleLugarCreado}
        lugarAEditar={lugarAEditar}
      />
      <Dialog
        open={dialogoEliminarOpen}
        onClose={handleCerrarDialogoEliminar}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        closeAfterTransition={false}
      >
        <DialogTitle id='alert-dialog-title'>¿Eliminar lugar permanentemente?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {lugarAEliminar && (
              <>
                Estás a punto de eliminar el lugar <strong>&quot;{lugarAEliminar.nombre_es}&quot;</strong>.
                <br />
                <br />
                Esta acción no se puede deshacer y el lugar será eliminado permanentemente del sistema.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleCerrarDialogoEliminar} color='secondary' disabled={deleteLugar.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminacion}
            color='error'
            variant='contained'
            disabled={deleteLugar.isPending}
            startIcon={deleteLugar.isPending ? <i className='tabler-loader' /> : <i className='tabler-trash' />}
          >
            {deleteLugar.isPending ? 'Eliminando...' : 'Eliminar Lugar'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal de error */}
      <Dialog
        open={modalErrorOpen}
        onClose={handleCerrarModalError}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, textAlign: 'center' } }}
      >
        <DialogTitle sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleCerrarModalError}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.500',
              '&:hover': { color: 'grey.700', backgroundColor: 'grey.100' }
            }}
          >
            <i className='tabler-x' style={{ fontSize: '20px' }} />
          </IconButton>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <i className='tabler-alert-circle' style={{ fontSize: '32px' }} />
            </Box>
            <Typography variant='h5' component='div' color='error.main' fontWeight='600'>
              No se puede eliminar
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant='body1' sx={{ mb: 2 }}>
            {mensajeError}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            El lugar tiene registros relacionados que deben ser eliminados primero.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 2, px: 3, pb: 3 }}>
          <Button
            variant='contained'
            color='primary'
            size='large'
            onClick={handleCerrarModalError}
            startIcon={<i className='tabler-check' style={{ fontSize: '18px' }} />}
            sx={{ minWidth: 120 }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default LugaresTable
