'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import { useRouter } from 'next/navigation'

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

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

import { useTuristico } from '@/hooks/useTuristico'
import type { LugarTuristico, LugarTuristicoWithActionsType } from '@/types/api/turistico'

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

const columnHelper = createColumnHelper<LugarTuristicoWithActionsType>()

const TuristicoTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [lugarAEditar, setLugarAEditar] = useState<LugarTuristico | null>(null)
  const [dialogoEliminarOpen, setDialogoEliminarOpen] = useState(false)
  const [lugarAEliminar, setLugarAEliminar] = useState<LugarTuristico | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    lugares,
    total,
    isLoading,
    error,
    useGetSubcategoriasTuristico,
    useDeleteTuristico,
    refetchLugaresTuristico
  } = useTuristico(currentPage, pageSize, searchQuery, subcategoriaSeleccionada)

  const router = useRouter()
  const { data: subcategorias = [] } = useGetSubcategoriasTuristico()
  const deleteTuristico = useDeleteTuristico()

  const handleCrearNuevo = () => {
    router.push('/turistico/add')
  }

  const handleOpenModal = () => {
    setLugarAEditar(null)
    setModalOpen(true)
  }

  const handleOpenModalEditar = (lugar: LugarTuristico) => {
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
    refetchLugaresTuristico()
  }

  const handleAbrirDialogoEliminar = (lugar: LugarTuristico) => {
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
        await deleteTuristico.mutateAsync(lugarAEliminar.id)
        handleCerrarDialogoEliminar()
      } catch (error) {
        console.error('Error eliminando lugar turístico:', error)
        alert('Error al eliminar el lugar turístico')
      }
    }
  }

  const columns = useMemo<ColumnDef<LugarTuristicoWithActionsType, any>[]>(
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
              component={Link}
              href={`/turistico/edit/${row.original.id}`} // 👈 CAMBIO: navegar a página
              size='small'
              sx={{
                color: 'primary.main',
                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
              }}
            >
              <i className='tabler-edit' style={{ fontSize: '18px' }} />
            </IconButton>

            <IconButton
              size='small'
              disabled={deleteTuristico.isPending}
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
        header: 'Nombre del Lugar',
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
                      e.currentTarget.src = '/images/placeholder-turistico.jpg'
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
                  <i
                    className='tabler-camera-star'
                    style={{ fontSize: '24px', color: 'var(--mui-palette-text-disabled)' }}
                  />
                </Box>
              )}
              {row.original.imagenes && row.original.imagenes.length > 1 && (
                <Chip label={`+${row.original.imagenes.length - 1}`} size='small' variant='outlined' />
              )}
            </div>
          )
        }
      }),
      columnHelper.accessor('l_turistico', {
        header: 'Reseña',
        cell: ({ row }) => {
          const turistico = row.original.l_turistico

          return (
            <div className='flex flex-col gap-1 max-w-md'>
              <Typography variant='body2' color='text.primary' className='line-clamp-3' title={turistico?.resenia_es}>
                <strong>ES:</strong> {turistico?.resenia_es || 'Sin reseña'}
              </Typography>
              <Typography variant='body2' color='text.secondary' className='line-clamp-3' title={turistico?.resenia_en}>
                <strong>EN:</strong> {turistico?.resenia_en || 'No review'}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('l_turistico.telefono', {
        header: 'Información Adicional',
        cell: ({ row }) => {
          const turistico = row.original.l_turistico

          return (
            <div className='flex flex-col gap-1 max-w-md'>
              <Typography variant='body2' color={turistico?.telefono ? 'text.primary' : 'text.disabled'}>
                📞 {turistico?.telefono || 'Sin teléfono'}
              </Typography>
              <Typography variant='body2' color={turistico?.celular ? 'text.primary' : 'text.disabled'}>
                📱 {turistico?.celular || 'Sin celular'}
              </Typography>
            </div>
          )
        }
      }),

      columnHelper.accessor('l_turistico.horarios_es', {
        header: 'Horarios & Precios',
        cell: ({ row }) => {
          const turistico = row.original.l_turistico

          return (
            <div className='flex flex-col gap-1 max-w-md'>
              <Typography
                variant='body2'
                color={turistico?.horarios_es ? 'text.primary' : 'text.disabled'}
                className='line-clamp-3'
              >
                🕒 {turistico?.horarios_es || 'Sin horarios'}
              </Typography>
              <Typography
                variant='body2'
                color={turistico?.precios_es ? 'text.primary' : 'text.disabled'}
                className='line-clamp-3'
              >
                💰 {turistico?.precios_es || 'Sin precios'}
              </Typography>
            </div>
          )
        }
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
    [deleteTuristico.isPending]
  )

  const table = useReactTable({
    data: lugares,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection
    },

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel()
  })

  if (isLoading) {
    return (
      <Card className='p-6'>
        <div className='flex justify-center items-center h-64'>
          <Typography>Cargando lugares turísticos...</Typography>
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
            placeholder='Buscar lugares turísticos...'
            className='max-sm:is-full min-w-[250px] flex-1 max-w-md'
          />

          <CustomTextField
            select
            value={subcategoriaSeleccionada || ''}
            onChange={e => {
              setSubcategoriaSeleccionada(Number(e.target.value) || null)
              setCurrentPage(1)
            }}
            placeholder='Todas las subcategorías'
            className='min-w-[200px] max-sm:is-full'
            label='Subcategoría'
          >
            <MenuItem value=''>Todas las subcategorías</MenuItem>
            {subcategorias.map(sub => (
              <MenuItem key={sub.id} value={sub.id}>
                {sub.nombre_es}
              </MenuItem>
            ))}
          </CustomTextField>
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
            startIcon={<i className='tabler-plus' />}
            className='max-sm:is-full is-auto'
          >
            Nuevo Lugar Turístico
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
                  <Typography>No hay lugares turísticos disponibles</Typography>
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
              {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, total)} de ${total} lugares turísticos`}
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
        <DialogTitle id='alert-dialog-title'>¿Eliminar lugar turístico permanentemente?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {lugarAEliminar && (
              <>
                Estás a punto de eliminar el lugar turístico <strong>&quot;{lugarAEliminar.nombre_es}&quot;</strong>.
                <br />
                <br />
                Esta acción no se puede deshacer y el lugar será eliminado permanentemente del sistema.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleCerrarDialogoEliminar} color='secondary' disabled={deleteTuristico.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminacion}
            color='error'
            variant='contained'
            disabled={deleteTuristico.isPending}
            startIcon={deleteTuristico.isPending ? <i className='tabler-loader' /> : <i className='tabler-trash' />}
          >
            {deleteTuristico.isPending ? 'Eliminando...' : 'Eliminar Lugar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default TuristicoTable
