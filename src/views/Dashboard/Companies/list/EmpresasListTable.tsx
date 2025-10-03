'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
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

// Third-party Imports
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

// Component Imports
import { Pagination } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type EmpresaType = {
  id: number
  logo: string
  empresa: string
  fechaCreacion: string
  nroRutas: number
  nroBuses: number
  nroDuenos: number
  cantCajeros: number
  nombreBanco: string
  nroCuenta: string
  horasCancelar: number
  comision: number
  nombreRepresentante: string
  ci: string
  nroCelular: string
}

type EmpresaWithActionsType = EmpresaType & {
  actions?: string
}

// Datos estáticos de ejemplo
const empresaDataStatic: EmpresaType[] = [
  {
    id: 1,
    logo: '/images/illustrations/auth/logoipsum.png',
    empresa: 'TRANS SAIPINA',
    fechaCreacion: '1/1/2025',
    nroRutas: 3,
    nroBuses: 5,
    nroDuenos: 4,
    cantCajeros: 3,
    nombreBanco: '',
    nroCuenta: '',
    horasCancelar: 2,
    comision: 1,
    nombreRepresentante: 'JOAQUIN CARDENAS',
    ci: '8546231',
    nroCelular: '72458963'
  },
  {
    id: 2,
    logo: '/images/illustrations/auth/logoipsum.png',
    empresa: 'TRANS SAIPINA',
    fechaCreacion: '5/5/2025',
    nroRutas: 3,
    nroBuses: 5,
    nroDuenos: 4,
    cantCajeros: 3,
    nombreBanco: 'BANCO UNION',
    nroCuenta: '100000123457',
    horasCancelar: 5,
    comision: 2,
    nombreRepresentante: 'JOAQUIN CARDENAS',
    ci: '8546231',
    nroCelular: '72458963'
  },
  {
    id: 3,
    logo: '/images/illustrations/auth/logoipsum.png',
    empresa: 'TRANS SAIPINA',
    fechaCreacion: '4/4/2025',
    nroRutas: 3,
    nroBuses: 5,
    nroDuenos: 4,
    cantCajeros: 3,
    nombreBanco: '',
    nroCuenta: '',
    horasCancelar: 3,
    comision: 1,
    nombreRepresentante: 'JOAQUIN CARDENAS',
    ci: '8546231',
    nroCelular: '72458963'
  },
  {
    id: 4,
    logo: '/images/illustrations/auth/logoipsum.png',
    empresa: 'TRANS SAIPINA',
    fechaCreacion: '10/10/2024',
    nroRutas: 3,
    nroBuses: 5,
    nroDuenos: 4,
    cantCajeros: 3,
    nombreBanco: '',
    nroCuenta: '',
    horasCancelar: 2,
    comision: 1,
    nombreRepresentante: 'JOAQUIN CARDENAS',
    ci: '8546231',
    nroCelular: '72458963'
  },
  {
    id: 5,
    logo: '/images/illustrations/auth/logoipsum.png',
    empresa: 'TRANS SAIPINA',
    fechaCreacion: '12/10/2024',
    nroRutas: 3,
    nroBuses: 5,
    nroDuenos: 4,
    cantCajeros: 3,
    nombreBanco: '',
    nroCuenta: '',
    horasCancelar: 4,
    comision: 1,
    nombreRepresentante: 'JOAQUIN CARDENAS',
    ci: '8546231',
    nroCelular: '72458963'
  },
  {
    id: 6,
    logo: '/images/illustrations/auth/logoipsum.png',
    empresa: 'TRANS SAIPINA',
    fechaCreacion: '10/12/2023',
    nroRutas: 3,
    nroBuses: 5,
    nroDuenos: 4,
    cantCajeros: 3,
    nombreBanco: '',
    nroCuenta: '',
    horasCancelar: 1,
    comision: 1,
    nombreRepresentante: 'JOAQUIN CARDENAS',
    ci: '8546231',
    nroCelular: '72458963'
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

const columnHelper = createColumnHelper<EmpresaWithActionsType>()

const EmpresaListTable = ({ empresaData }: { empresaData?: EmpresaType[] }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<EmpresaType[]>(empresaData || empresaDataStatic)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogoEliminarOpen, setDialogoEliminarOpen] = useState(false)
  const [empresaAEliminar, setEmpresaAEliminar] = useState<EmpresaType | null>(null)

  const router = useRouter()

  useEffect(() => {
    if (empresaData) {
      setData(empresaData)
    }
  }, [empresaData])

  const handleCrearNuevo = () => {
    router.push('/companies/add')
  }

  const handleAbrirDialogoEliminar = (empresa: EmpresaType) => {
    setEmpresaAEliminar(empresa)
    setDialogoEliminarOpen(true)
  }

  const handleCerrarDialogoEliminar = () => {
    setDialogoEliminarOpen(false)
    setEmpresaAEliminar(null)
  }

  const handleConfirmarEliminacion = async () => {
    if (empresaAEliminar?.id) {
      try {
        // Aquí iría la llamada a tu API para eliminar
        console.log('Eliminando empresa:', empresaAEliminar.id)
        handleCerrarDialogoEliminar()
      } catch (error) {
        console.error('Error eliminando empresa:', error)
        alert('Error al eliminar la empresa')
      }
    }
  }

  const columns = useMemo<ColumnDef<EmpresaWithActionsType, any>[]>(
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
              href={`/empresa/view/${row.original.id}`}
              size='small'
              sx={{
                color: 'info.main',
                '&:hover': { backgroundColor: 'info.light', color: 'white' }
              }}
            >
              <i className='tabler-eye' style={{ fontSize: '18px' }} />
            </IconButton>
            <IconButton
              component={Link}
              href={`/empresa/edit/${row.original.id}`}
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
      columnHelper.accessor('id', {
        header: 'Nro',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.id}
          </Typography>
        ),
        size: 50
      }),
      columnHelper.accessor('logo', {
        header: 'Logo',
        cell: ({ row }) => (
          <Box
            sx={{
              width: 60,
              height: 40,
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <img
              src={row.original.logo}
              alt={row.original.empresa}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={e => {
                e.currentTarget.src = '/images/placeholder-empresa.jpg'
              }}
            />
          </Box>
        ),
        size: 80
      }),
      columnHelper.accessor('empresa', {
        header: 'Empresa',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.empresa}
          </Typography>
        )
      }),
      columnHelper.accessor('fechaCreacion', {
        header: 'Fecha Creación',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i className='tabler-calendar' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
            <Typography variant='body2'>{row.original.fechaCreacion}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('nroRutas', {
        header: 'Nro. Rutas',
        cell: ({ row }) => <Chip label={row.original.nroRutas} color='primary' variant='tonal' size='small' />,
        size: 80
      }),
      columnHelper.accessor('nroBuses', {
        header: 'Nro. Buses',
        cell: ({ row }) => <Chip label={row.original.nroBuses} color='primary' variant='tonal' size='small' />,
        size: 80
      }),
      columnHelper.accessor('nroDuenos', {
        header: 'Nro. Dueños',
        cell: ({ row }) => <Chip label={row.original.nroDuenos} color='primary' variant='tonal' size='small' />,
        size: 80
      }),
      columnHelper.accessor('cantCajeros', {
        header: 'Cant. Cajeros',
        cell: ({ row }) => <Chip label={row.original.cantCajeros} color='primary' variant='tonal' size='small' />,
        size: 100
      }),
      columnHelper.accessor('nombreBanco', {
        header: 'Nombre de Banco',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            {row.original.nombreBanco ? (
              <>
                <div className='flex items-center gap-1'>
                  <i
                    className='tabler-building-bank'
                    style={{ fontSize: '16px', color: 'var(--mui-palette-primary-main)' }}
                  />
                  <Typography variant='body2' color='text.primary'>
                    {row.original.nombreBanco}
                  </Typography>
                </div>
                {row.original.nroCuenta && (
                  <Typography variant='caption' color='text.secondary'>
                    Cta: {row.original.nroCuenta}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant='body2' color='text.disabled'>
                Sin banco
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('horasCancelar', {
        header: 'Horas Cancelar',
        cell: ({ row }) => (
          <Chip
            label={`${row.original.horasCancelar}h`}
            color='error'
            variant='tonal'
            size='small'
            icon={<i className='tabler-clock' style={{ fontSize: '14px' }} />}
          />
        ),
        size: 100
      }),
      columnHelper.accessor('comision', {
        header: 'Comisión',
        cell: ({ row }) => <Chip label={`${row.original.comision}%`} color='success' variant='tonal' size='small' />,
        size: 80
      }),
      columnHelper.accessor('nombreRepresentante', {
        header: 'Representante',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-1'>
              <i className='tabler-user' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
              <Typography className='font-medium' color='text.primary' variant='body2'>
                {row.original.nombreRepresentante}
              </Typography>
            </div>
            <Typography variant='caption' color='text.secondary'>
              CI: {row.original.ci}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('nroCelular', {
        header: 'Nro. Celular',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i className='tabler-phone' style={{ fontSize: '16px', color: 'var(--mui-palette-success-main)' }} />
            <Typography variant='body2'>{row.original.nroCelular}</Typography>
          </div>
        )
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
    <Card>
      <div className='flex flex-wrap justify-between gap-4 p-6'>
        <div className='flex flex-wrap gap-4 items-center'>
          <DebouncedInput
            value={searchQuery}
            onChange={value => {
              setSearchQuery(String(value))
              setCurrentPage(1)
            }}
            placeholder='Buscar Empresa...'
            className='max-sm:is-full min-w-[250px] flex-1 max-w-md'
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
            color='primary'
            onClick={handleCrearNuevo}
            startIcon={<i className='tabler-plus' />}
          >
            Nueva Empresa
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
                  <Typography>No hay empresas disponibles</Typography>
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
              {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} empresas`}
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
        <DialogTitle id='alert-dialog-title'>¿Eliminar empresa permanentemente?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {empresaAEliminar && (
              <>
                Estás a punto de eliminar la empresa <strong>&quot;{empresaAEliminar.empresa}&quot;</strong>.
                <br />
                <br />
                Esta acción no se puede deshacer y la empresa será eliminada permanentemente del sistema.
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
            Eliminar Empresa
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default EmpresaListTable
