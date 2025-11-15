'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
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
import { Pagination } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { useBuses, useDeleteBus } from '@/hooks/useBuses'
import type { Bus } from '@/types/api/buses'
import DeleteBusDialog from '../components/DeleteBusDialog'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { usePermissions } from '@/hooks/usePermissions'

type BusWithActionsType = Bus & {
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

const columnHelper = createColumnHelper<BusWithActionsType>()

const BusListTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)

  const { data: buses, isLoading, error } = useBuses()
  const deleteMutation = useDeleteBus()
  const { showSuccess, showError } = useSnackbar()
  const { canCreate, canUpdate, canDelete } = usePermissions().getCRUDPermissions('BUS')
  const router = useRouter()

  const [data, setData] = useState<Bus[]>([])

  useEffect(() => {
    if (buses) {
      setData(buses)
    }
  }, [buses])

  const handleCrearNuevo = () => {
    router.push('/buses/add')
  }

  const handleOpenDeleteDialog = (bus: Bus) => {
    setSelectedBus(bus)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedBus(null)
  }

  const handleConfirmDelete = async () => {
    if (!selectedBus) return

    try {
      await deleteMutation.mutateAsync(selectedBus.id)
      showSuccess('Bus eliminado correctamente')
      handleCloseDeleteDialog()
    } catch (error: any) {
      console.error('Error al eliminar bus:', error)
      showError(error?.response?.data?.message || 'Error al eliminar el bus')
    }
  }

  const getEquipmentIcons = (equipment: string[]) => {
    const iconMap: Record<string, { icon: string; label: string; color: string }> = {
      wifi: { icon: 'tabler-wifi', label: 'WiFi', color: 'primary.main' },
      usb_charger: { icon: 'tabler-usb', label: 'USB', color: 'success.main' },
      air_conditioning: { icon: 'tabler-air-conditioning', label: 'A/C', color: 'info.main' },
      bathroom: { icon: 'tabler-bath', label: 'Baño', color: 'warning.main' },
      tv: { icon: 'tabler-device-tv', label: 'TV', color: 'secondary.main' },
      reclining_seats: { icon: 'tabler-armchair', label: 'Reclinable', color: 'error.main' }
    }

    return equipment.map(item => iconMap[item]).filter(Boolean)
  }

  const columns = useMemo<ColumnDef<BusWithActionsType, any>[]>(
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
            <Tooltip title='Ver detalles'>
              <IconButton
                size='small'
                component={Link}
                href={`/buses/${row.original.id}`}
                sx={{
                  color: 'info.main',
                  '&:hover': { backgroundColor: 'info.light', color: 'white' }
                }}
              >
                <i className='tabler-eye' style={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
            {canUpdate && (
              <Tooltip title='Editar'>
                <IconButton
                  component={Link}
                  href={`/buses/edit/${row.original.id}`}
                  size='small'
                  sx={{
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <i className='tabler-edit' style={{ fontSize: '18px' }} />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title='Eliminar'>
                <IconButton
                  size='small'
                  onClick={() => handleOpenDeleteDialog(row.original)}
                  sx={{
                    color: 'error.main',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <i className='tabler-trash' style={{ fontSize: '18px' }} />
                </IconButton>
              </Tooltip>
            )}
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className='tabler-bus' style={{ fontSize: '20px', color: 'var(--mui-palette-primary-main)' }} />
            <Typography className='font-medium' color='text.primary'>
              {row.original.name}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('plaque', {
        header: 'Placa',
        cell: ({ row }) => (
          <Chip label={row.original.plaque} color='primary' variant='tonal' size='small' sx={{ fontWeight: 600 }} />
        )
      }),
      columnHelper.accessor('busType', {
        header: 'Tipo de Bus',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.busType.name}
          </Typography>
        )
      }),
      columnHelper.accessor('decks', {
        header: 'Pisos',
        cell: ({ row }) => (
          <Chip
            label={row.original.decks ? 'Dos Pisos' : 'Un Piso'}
            color={row.original.decks ? 'success' : 'default'}
            variant='tonal'
            size='small'
            icon={<i className={row.original.decks ? 'tabler-stack-2' : 'tabler-layers-difference'} />}
          />
        )
      }),
      {
        id: 'deckInfo',
        header: 'Información de Pisos',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            {row.original.busType.decks.map((deck, index) => (
              <Chip
                key={index}
                label={`Piso ${deck.deck}: ${deck.deckType} (${deck.seats.filter(s => s.type === 'seat').length} asientos)`}
                size='small'
                variant='outlined'
                color={index === 0 ? 'primary' : 'secondary'}
              />
            ))}
          </div>
        )
      },
      columnHelper.accessor('equipment', {
        header: 'Equipamiento',
        cell: ({ row }) => {
          const icons = getEquipmentIcons(row.original.equipment)

          return (
            <div className='flex gap-1 flex-wrap'>
              {icons.map((item, index) => (
                <Tooltip key={index} title={item.label}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      backgroundColor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <i className={item.icon} style={{ fontSize: '18px', color: `var(--mui-palette-${item.color})` }} />
                  </Box>
                </Tooltip>
              ))}
            </div>
          )
        }
      }),
      columnHelper.accessor('owner', {
        header: 'Propietario',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-1'>
              <i className='tabler-user' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
              <Typography className='font-medium' color='text.primary' variant='body2'>
                {row.original.owner.name}
              </Typography>
            </div>
            <Typography variant='caption' color='text.secondary'>
              CI: {row.original.owner.ci}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.owner.phone}
            </Typography>
          </div>
        )
      })
    ],
    [canUpdate, canDelete]
  )

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter: searchQuery
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setSearchQuery,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const totalRecords = table.getFilteredRowModel().rows.length

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>Error al cargar los buses. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Lista de Buses</Typography>
          </div>

          {canCreate && (
            <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleCrearNuevo}
                startIcon={<i className='tabler-plus' />}
              >
                Crear Nuevo
              </Button>
            </div>
          )}
        </div>

        <div className='flex flex-wrap justify-between gap-4 px-6 pb-6'>
          <div className='flex flex-wrap gap-4 items-center'>
            <DebouncedInput
              value={searchQuery}
              onChange={value => {
                setSearchQuery(String(value))
                setCurrentPage(1)
              }}
              placeholder='Buscar Bus (Nombre, Placa)...'
              className='max-sm:is-full min-w-[300px] flex-1 max-w-md'
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
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='15'>15</MenuItem>
              <MenuItem value='25'>25</MenuItem>
            </CustomTextField>
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
                    <Typography>No hay buses disponibles</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map(row => (
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
                {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} buses`}
              </Typography>
              <Pagination
                shape='rounded'
                color='primary'
                variant='tonal'
                count={Math.ceil(totalRecords / pageSize)}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                showFirstButton
                showLastButton
              />
            </div>
          )}
          count={totalRecords}
          rowsPerPage={pageSize}
          page={currentPage - 1}
          onPageChange={() => {}}
        />
      </Card>

      <DeleteBusDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        bus={selectedBus}
        isLoading={deleteMutation.isPending}
      />
    </Box>
  )
}

export default BusListTable
