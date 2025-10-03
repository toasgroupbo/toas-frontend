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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import type { TextFieldProps } from '@mui/material/TextField'
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'

import 'react-datepicker/dist/react-datepicker.css'
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

import DatePicker from 'react-datepicker'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

import { useActividades } from '@/hooks/useActividades'
import type { Actividad } from '@/types/api/actividades'

import tableStyles from '@core/styles/table.module.css'
import { useEventos } from '@/hooks/useEventos'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type ActividadWithActionsType = Actividad & {
  actions?: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({
    itemRank
  })

  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 900,
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

const columnHelper = createColumnHelper<ActividadWithActionsType>()

const ActividadesTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [data, setData] = useState<Actividad[]>([])
  const [dialogoEliminarOpen, setDialogoEliminarOpen] = useState(false)
  const [actividadAEliminar, setActividadAEliminar] = useState<Actividad | null>(null)
  const [eliminandoActividad, setEliminandoActividad] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { eventos } = useEventos()

  const eventoDelDia = useMemo(() => {
    if (!selectedDate) return null

    const fechaSeleccionada = selectedDate.toISOString().split('T')[0]

    return eventos.find(evento => evento.fecha.split('T')[0] === fechaSeleccionada)
  }, [selectedDate, eventos])

  const { actividades, total, isLoading, error, eliminarActividad } = useActividades(
    currentPage,
    pageSize,
    searchQuery,
    eventoDelDia?.id || null
  )

  const fechasConEventos = useMemo(() => {
    const fechas: Record<string, boolean> = {}

    eventos.forEach(evento => {
      const fecha = evento.fecha.split('T')[0]

      fechas[fecha] = true
    })

    return fechas
  }, [eventos])

  const CustomDayComponent = ({ dayOfMonth, date }: { dayOfMonth: number; date: Date }) => {
    const fechaString = date.toISOString().split('T')[0]
    const tieneEvento = fechasConEventos[fechaString]

    return (
      <div className='relative'>
        <span>{dayOfMonth}</span>
        {tieneEvento && (
          <div className='absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full' style={{ fontSize: '8px' }} />
        )}
      </div>
    )
  }

  useEffect(() => {
    if (actividades) {
      setData(actividades)
    }
  }, [actividades])

  const handleAbrirDialogoEliminar = (actividad: Actividad) => {
    setActividadAEliminar(actividad)
    setDialogoEliminarOpen(true)
  }

  const handleCerrarDialogoEliminar = () => {
    setDialogoEliminarOpen(false)
    setActividadAEliminar(null)
  }

  const handleConfirmarEliminacionActividad = async () => {
    if (actividadAEliminar?.id) {
      setEliminandoActividad(true)

      try {
        await eliminarActividad(actividadAEliminar.id)

        setData(data.filter(actividad => actividad.id !== actividadAEliminar.id))

        handleCerrarDialogoEliminar()
      } catch (error) {
        console.error('Error eliminando actividad:', error)
        alert('Error al eliminar la actividad')
      } finally {
        setEliminandoActividad(false)
      }
    }
  }

  const columns = useMemo<ColumnDef<ActividadWithActionsType, any>[]>(
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
              href={`/actividades/edit/${row.original.id}`}
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
              disabled={eliminandoActividad}
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
      columnHelper.accessor('evento_id', {
        header: 'Día de la actividad',
        cell: ({ row }) => {
          const evento = row.original.evento

          return (
            <div className='flex flex-col gap-2'>
              <Typography variant='body2' className='font-medium' color='text.primary'>
                ES: {evento?.nombre_es || 'N/A'}
              </Typography>
              <div className='flex flex-col gap-1'>
                <Typography variant='body2' color='text.secondary'>
                  EN: {evento?.nombre_en || 'N/A'}
                </Typography>
              </div>
            </div>
          )
        }
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

      columnHelper.accessor('horaInicio', {
        header: 'Hora Inicio',
        cell: ({ row }) => (
          <Typography variant='body2' className='font-medium'>
            {row.original.horaInicio}
          </Typography>
        )
      }),
      columnHelper.accessor('horaFin', {
        header: 'Hora Fin',
        cell: ({ row }) => (
          <Typography variant='body2' className='font-medium'>
            {row.original.horaFin || '--:--'}
          </Typography>
        )
      })
    ],
    [data, eliminarActividad, setData, eliminandoActividad]
  )

  const table = useReactTable({
    data: data || [],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
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
          <Typography>Cargando actividades...</Typography>
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
    <>
      <Card>
        <div className='flex flex-col gap-4 p-6'>
          <div className='flex flex-wrap justify-between gap-4'>
            <DebouncedInput
              value={searchQuery}
              onChange={value => {
                setSearchQuery(String(value))
                setCurrentPage(1)
              }}
              placeholder='Buscar actividades...'
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
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={25}>25</MenuItem>
              </CustomTextField>
              <Button
                variant='contained'
                component={Link}
                className='max-sm:is-full is-auto'
                href={'/actividades/add'}
                startIcon={<i className='tabler-plus' />}
              >
                Agregar Actividad
              </Button>
            </div>
          </div>

          {/*  - CALENDARIO: */}
          <div className='flex flex-wrap items-center gap-4 pt-2 border-t border-divider'>
            <div className='flex items-center gap-2'>
              <i className='tabler-calendar text-lg text-gray-500' />
              <Typography variant='body2' color='text.secondary' className='whitespace-nowrap'>
                Filtrar por fecha:
              </Typography>
            </div>

            <div className='flex-1 max-w-xs'>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => {
                  setSelectedDate(date)
                  setCurrentPage(1)
                }}
                placeholderText='Seleccionar fecha...'
                dateFormat='dd/MM/yyyy'
                isClearable
                renderDayContents={(dayOfMonth, date) => <CustomDayComponent dayOfMonth={dayOfMonth} date={date} />}
                customInput={
                  <CustomTextField
                    size='small'
                    className='w-full'
                    InputProps={{
                      endAdornment: <i className='tabler-calendar text-lg text-gray-400' />
                    }}
                  />
                }
              />
            </div>

            {selectedDate && (
              <Button
                variant='outlined'
                size='small'
                onClick={() => {
                  setSelectedDate(null)
                  setCurrentPage(1)
                }}
                startIcon={<i className='tabler-x' />}
                className='whitespace-nowrap'
              >
                Limpiar
              </Button>
            )}

            {selectedDate && (
              <Typography variant='body2' color='primary' className='whitespace-nowrap font-medium'>
                📅{' '}
                {selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            )}
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
                        <>
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
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {isLoading ? 'Cargando...' : 'No hay actividades disponibles'}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        <TablePagination
          component={() => (
            <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
              <Typography color='text.disabled'>
                {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, total)} de ${total} actividades`}
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
          <DialogTitle id='alert-dialog-title'>¿Eliminar actividad permanentemente?</DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              {actividadAEliminar && (
                <>
                  Estás a punto de eliminar la actividad <strong>&quot;{actividadAEliminar.nombre_es}&quot;</strong>.
                  <br />
                  <br />
                  Esta acción no se puede deshacer y la actividad será eliminada permanentemente del sistema,
                  <br />
                  <strong>¿Estás seguro de continuar?</strong>
                </>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-actions-dense'>
            <Button onClick={handleCerrarDialogoEliminar} color='secondary' disabled={eliminandoActividad}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarEliminacionActividad}
              color='error'
              variant='contained'
              disabled={eliminandoActividad}
              startIcon={eliminandoActividad ? <i className='tabler-loader' /> : <i className='tabler-trash' />}
            >
              {eliminandoActividad ? 'Eliminando...' : 'Eliminar Actividad'}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  )
}

export default ActividadesTable
