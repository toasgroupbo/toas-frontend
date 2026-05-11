'use client'

import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import TablePagination from '@mui/material/TablePagination'
import Pagination from '@mui/material/Pagination'
import Avatar from '@mui/material/Avatar'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel
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
      columnHelper.accessor('logo', {
        header: 'Logo',
        cell: ({ row }) => (
          <Box display='flex' alignItems='center'>
            <Avatar
              src={row.original.logo.startsWith('http') ? row.original.logo : `${process.env.NEXT_PUBLIC_API_URL}${row.original.logo}`}
              alt={row.original.name}
              sx={{ width: 40, height: 40, mr: 2 }}
            />
          </Box>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('name', {
        header: 'Empresa',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={500}>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('commission', {
        header: 'Comisión',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {row.original.commission}%
          </Typography>
        )
      }),
      columnHelper.accessor('hours_before_closing', {
        header: 'Horas antes de cierre',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {row.original.hours_before_closing}h
          </Typography>
        )
      }),
      columnHelper.accessor('bankAccount.titularName', {
        header: 'Titular',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {row.original.bankAccount?.titularName || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('bankAccount.account', {
        header: 'Cuenta',
        cell: ({ row }) => (
          <Typography variant='body2' fontFamily='monospace'>
            {row.original.bankAccount?.account || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <Box display='flex' gap={1}>
            <Button
              variant='contained'
              size='small'
              onClick={() => handleOpenModal(row.original)}
            >
              Ver Viajes
            </Button>
          </Box>
        ),
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data: companies || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize
      }
    }
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
                              asc: ' 🔼',
                              desc: ' 🔽'
                            }[header.column.getIsSorted() as string] ?? null}
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

          <Box display='flex' justifyContent='space-between' alignItems='center' mt={3}>
            <TablePagination
              component='div'
              count={table.getFilteredRowModel().rows.length}
              page={currentPage - 1}
              onPageChange={(_, page) => setCurrentPage(page + 1)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={e => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage='Filas por página:'
            />
            <Pagination
              count={Math.ceil(table.getFilteredRowModel().rows.length / pageSize)}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color='primary'
              variant='outlined'
              shape='rounded'
            />
          </Box>
        </Box>
      </Card>

      {selectedCompany && (
        <TravelsModal
          open={modalOpen}
          onClose={handleCloseModal}
          company={selectedCompany}
        />
      )}
    </>
  )
}

export default DepositosTable
