'use client'

import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Pagination from '@mui/material/Pagination'
import Avatar from '@mui/material/Avatar'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'

import { useCompanies } from '@/hooks/useCompanies'
import type { Company } from '@/types/api/company'
import tableStyles from '@core/styles/table.module.css'
import TravelsModal from '@/views/Dashboard/depositos/components/TravelsModal'

const columnHelper = createColumnHelper<Company>()

const DepositosTable = () => {
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: companies, isLoading, error } = useCompanies()

  const paginatedData = useMemo(() => {
    return (companies || []).slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [companies, currentPage, pageSize])

  const totalRecords = companies?.length || 0
  const totalPages = Math.ceil(totalRecords / pageSize)

  const handleOpenModal = (company: Company) => {
    setSelectedCompany(company)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedCompany(null)
  }

  const columns = useMemo<any[]>(
    () => [
      {
        accessorKey: 'logo',
        header: 'Logo',
        cell: ({ row }: any) => (
          <Box display='flex' alignItems='center'>
            <Avatar
              src={
                row.original.logo.startsWith('http')
                  ? row.original.logo
                  : `${process.env.NEXT_PUBLIC_API_URL}${row.original.logo}`
              }
              alt={row.original.name}
              sx={{ width: 40, height: 40, mr: 2 }}
            />
          </Box>
        ),
        enableSorting: false
      },
      {
        accessorKey: 'name',
        header: 'Empresa',
        cell: ({ row }: any) => (
          <Typography variant='body2' fontWeight={500}>
            {row.original.name}
          </Typography>
        )
      },
      {
        accessorKey: 'commission',
        header: 'Comisión',
        cell: ({ row }: any) => <Typography variant='body2'>{row.original.commission}%</Typography>
      },
      {
        accessorKey: 'hours_before_closing',
        header: 'Horas antes de cierre',
        cell: ({ row }: any) => <Typography variant='body2'>{row.original.hours_before_closing}h</Typography>
      },
      {
        accessorKey: 'bankAccount.titularName',
        header: 'Titular',
        cell: ({ row }: any) => (
          <Typography variant='body2'>{row.original.bankAccount?.titularName || 'N/A'}</Typography>
        )
      },
      {
        accessorKey: 'bankAccount.account',
        header: 'Cuenta',
        cell: ({ row }: any) => (
          <Typography variant='body2' fontFamily='monospace'>
            {row.original.bankAccount?.account || 'N/A'}
          </Typography>
        )
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: any) => (
          <Box display='flex' gap={1}>
            <Button variant='contained' size='small' onClick={() => handleOpenModal(row.original)}>
              Ver Viajes
            </Button>
          </Box>
        ),
        enableSorting: false
      }
    ],
    []
  )

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mt: 2 }}>
        Error al cargar las empresas: {error instanceof Error ? error.message : 'Error desconocido'}
      </Alert>
    )
  }

  return (
    <>
      <Card>
        <Box p={3}>
          <Box display='flex' alignItems='center' justifyContent='space-between' mb={3}>
            <Typography variant='h5' fontWeight={600}>
              Reporte de Depósitos
            </Typography>
          </Box>

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
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className='text-center'>
                      <Typography variant='body2' color='text.secondary' py={4}>
                        No hay empresas registradas
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className='flex justify-between items-center flex-wrap mt-3 gap-2'>
            <Typography color='text.disabled'>
              {totalRecords > 0
                ? `Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} empresas`
                : 'Sin datos'}
            </Typography>
            {totalPages > 1 && (
              <Pagination
                shape='rounded'
                color='primary'
                variant='tonal'
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                showFirstButton
                showLastButton
              />
            )}
          </div>
        </Box>
      </Card>

      {selectedCompany && <TravelsModal open={modalOpen} onClose={handleCloseModal} company={selectedCompany} />}
    </>
  )
}

export default DepositosTable
