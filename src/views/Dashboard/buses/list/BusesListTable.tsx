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

import BusDetailModal from '@/views/Dashboard/buses/list/BusView'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type BusType = {
  id: number
  nro: number
  placa: string
  marca: string
  modelo: string
  tipo: 'Leito' | 'Semi-Leito' | 'Ejecutivo' | 'Cama'
  asientosPiso1: number
  asientosPiso2: number
  imagenInterior: string
  imagenExterior: string
}

type BusWithActionsType = BusType & {
  actions?: string
}

const busDataStatic: BusType[] = [
  {
    id: 1,
    nro: 1,
    placa: '2345JKF',
    marca: 'Nissan',
    modelo: 'Civilian',
    tipo: 'Leito',
    asientosPiso1: 13,
    asientosPiso2: 33,
    imagenInterior: '/images/illustrations/characters/interior.png',
    imagenExterior: '/images/illustrations/characters/exterior.png'
  },
  {
    id: 2,
    nro: 2,
    placa: '2345JKF',
    marca: 'Nissan',
    modelo: 'Civilian',
    tipo: 'Leito',
    asientosPiso1: 13,
    asientosPiso2: 33,
    imagenInterior: '/images/illustrations/characters/interior.png',
    imagenExterior: '/images/illustrations/characters/exterior.png'
  },
  {
    id: 3,
    nro: 3,
    placa: '2345JKF',
    marca: 'Nissan',
    modelo: 'Civilian',
    tipo: 'Leito',
    asientosPiso1: 13,
    asientosPiso2: 33,
    imagenInterior: '/images/illustrations/characters/interior.png',
    imagenExterior: '/images/illustrations/characters/exterior.png'
  },
  {
    id: 4,
    nro: 4,
    placa: '2345JKF',
    marca: 'Nissan',
    modelo: 'Civilian',
    tipo: 'Leito',
    asientosPiso1: 13,
    asientosPiso2: 33,
    imagenInterior: '/images/illustrations/characters/interior.png',
    imagenExterior: '/images/illustrations/characters/exterior.png'
  },
  {
    id: 5,
    nro: 5,
    placa: '8765ABC',
    marca: 'Mercedes Benz',
    modelo: 'O-500',
    tipo: 'Ejecutivo',
    asientosPiso1: 18,
    asientosPiso2: 24,
    imagenInterior: '/images/illustrations/characters/interior.png',
    imagenExterior: '/images/illustrations/characters/exterior.png'
  },
  {
    id: 6,
    nro: 6,
    placa: '1234XYZ',
    marca: 'Scania',
    modelo: 'K-360',
    tipo: 'Cama',
    asientosPiso1: 10,
    asientosPiso2: 20,
    imagenInterior: '/images/illustrations/characters/interior.png',
    imagenExterior: '/images/illustrations/characters/exterior.png'
  }
]

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

const BusListTable = ({ busData }: { busData?: BusType[] }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<BusType[]>(busData || busDataStatic)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogoEliminarOpen, setDialogoEliminarOpen] = useState(false)
  const [busAEliminar, setBusAEliminar] = useState<BusType | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedBus, setSelectedBus] = useState<any>(null)

  const router = useRouter()

  useEffect(() => {
    if (busData) {
      setData(busData)
    }
  }, [busData])

  const handleCrearNuevo = () => {
    router.push('/buses/add')
  }

  const handleImprimir = () => {
    window.print()
  }

  const handleAbrirDialogoEliminar = (bus: BusType) => {
    setBusAEliminar(bus)
    setDialogoEliminarOpen(true)
  }

  const handleCerrarDialogoEliminar = () => {
    setDialogoEliminarOpen(false)
    setBusAEliminar(null)
  }

  const handleConfirmarEliminacion = async () => {
    if (busAEliminar?.id) {
      try {
        console.log('Eliminando bus:', busAEliminar.id)
        setData(prevData => prevData.filter(bus => bus.id !== busAEliminar.id))
        handleCerrarDialogoEliminar()
      } catch (error) {
        console.error('Error eliminando bus:', error)
        alert('Error al eliminar el bus')
      }
    }
  }

  const handleViewDetails = (bus: BusType) => {
    const busDataForModal = {
      placa: bus.placa,
      marca: bus.marca,
      modelo: bus.modelo,
      year: '2020',
      tipo: bus.tipo,
      tipoPiso: 'dos' as 'uno' | 'dos',
      cantidadFilasPiso1: '5',
      cantidadAsientosPiso1: '4',
      cantidadFilasPiso2: '8',
      cantidadAsientosPiso2: '5',
      layoutPiso1: Array(5)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map((_, i) => ({
              type: i === 1 ? ('aisle' as const) : ('seat' as const),
              seatNumber: i === 1 ? undefined : `${Math.floor(Math.random() * 40) + 1}`
            }))
        ),
      layoutPiso2: Array(8)
        .fill(null)
        .map(() =>
          Array(5)
            .fill(null)
            .map((_, i) => ({
              type: i === 2 ? ('aisle' as const) : ('seat' as const),
              seatNumber: i === 2 ? undefined : `${Math.floor(Math.random() * 40) + 1}`
            }))
        ),
      imagenInterior: bus.imagenInterior,
      imagenExterior: bus.imagenExterior,
      precioGlobal: '150'
    }

    setSelectedBus(busDataForModal)
    setDetailModalOpen(true)
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
            <IconButton onClick={() => handleViewDetails(row.original)}>
              <i className='tabler-eye' style={{ fontSize: '18px' }} />
            </IconButton>
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
            <IconButton
              size='small'
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
      columnHelper.accessor('nro', {
        header: 'NRO',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.nro}
          </Typography>
        ),
        size: 60
      }),
      columnHelper.accessor('placa', {
        header: 'PLACA',
        cell: ({ row }) => (
          <Chip label={row.original.placa} color='primary' variant='tonal' size='small' sx={{ fontWeight: 600 }} />
        )
      }),
      columnHelper.accessor('marca', {
        header: 'MARCA',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.marca}
          </Typography>
        )
      }),
      columnHelper.accessor('modelo', {
        header: 'MODELO',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.modelo}
          </Typography>
        )
      }),
      columnHelper.accessor('tipo', {
        header: 'TIPO',
        cell: ({ row }) => {
          const colorMap = {
            Leito: 'success',
            'Semi-Leito': 'info',
            Ejecutivo: 'warning',
            Cama: 'error'
          } as const

          return <Chip label={row.original.tipo} color={colorMap[row.original.tipo]} variant='tonal' size='small' />
        }
      }),
      columnHelper.accessor('asientosPiso1', {
        header: 'ASIENTOS PISO 1',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              {row.original.asientosPiso1}
            </Box>
          </div>
        ),
        size: 140
      }),
      columnHelper.accessor('asientosPiso2', {
        header: 'ASIENTOS PISO 2',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'secondary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              {row.original.asientosPiso2}
            </Box>
          </div>
        ),
        size: 140
      }),
      columnHelper.accessor('imagenInterior', {
        header: 'IMAGEN INTERIOR',
        cell: ({ row }) => (
          <Box
            sx={{
              width: 120,
              height: 70,
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid',
              borderColor: 'divider',
              backgroundColor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={row.original.imagenInterior}
              alt='Interior del bus'
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        ),
        size: 140
      }),
      columnHelper.accessor('imagenExterior', {
        header: 'IMAGEN EXTERIOR',
        cell: ({ row }) => (
          <Box
            sx={{
              width: 120,
              height: 70,
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid',
              borderColor: 'divider',
              backgroundColor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={row.original.imagenExterior}
              alt='Exterior del bus'
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        ),
        size: 140
      })
    ],
    []
  )

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const totalRecords = data.length

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-wrap gap-4 items-center'>
            <DebouncedInput
              value={searchQuery}
              onChange={value => {
                setSearchQuery(String(value))
                setCurrentPage(1)
              }}
              placeholder='Buscar Bus (Placa, Marca, Modelo)...'
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
            <Button
              variant='contained'
              color='success'
              onClick={handleImprimir}
              startIcon={<i className='tabler-printer' />}
            >
              Imprimir
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={handleCrearNuevo}
              startIcon={<i className='tabler-plus' />}
            >
              Crear Nuevo
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
                    <Typography>No hay buses disponibles</Typography>
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

        <Dialog
          open={dialogoEliminarOpen}
          onClose={handleCerrarDialogoEliminar}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>¿Eliminar bus permanentemente?</DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              {busAEliminar && (
                <>
                  Estás a punto de eliminar el bus con placa <strong>&quot;{busAEliminar.placa}&quot;</strong>.
                  <br />
                  <br />
                  Esta acción no se puede deshacer y el bus será eliminado permanentemente del sistema.
                </>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-actions-dense'>
            <Button onClick={handleCerrarDialogoEliminar} color='secondary'>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarEliminacion}
              color='error'
              variant='contained'
              startIcon={<i className='tabler-trash' />}
            >
              Eliminar Bus
            </Button>
          </DialogActions>
        </Dialog>
      </Card>

      <BusDetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} busData={selectedBus} />
    </>
  )
}

export default BusListTable
