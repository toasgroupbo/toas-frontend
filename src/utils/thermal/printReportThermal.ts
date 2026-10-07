import type { Travel } from '@/types/api/travels'
import type { Ticket } from '@/types/api/tickets'
import type { CashierSummary } from '@/hooks/useTickets'
import { ESCPOSBuilder } from './escpos'
import { printData } from './webusb'

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)

  return date.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/La_Paz'
  })
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)

  return date.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/La_Paz'
  })
}

interface StaffMember {
  ci: string
  name: string
  phone: string
}

interface TravelReportData {
  travel: Travel
  tickets?: Ticket[]
  companyName?: string
  cashiers?: CashierSummary[]
  totals?: {
    totalCash: string
    totalQr: string
  }
}

export const buildTravelReportThermalData = ({
  travel,
  tickets = [],
  companyName,
  cashiers = [],
  totals
}: TravelReportData): Uint8Array => {
  const builder = new ESCPOSBuilder(48)

  // Get company name
  if (!companyName && (travel as any).company?.name) {
    companyName = (travel as any).company.name
  }

  if (!companyName && tickets.length > 0) {
    for (const ticket of tickets) {
      if ((ticket as any).travel?.company?.name) {
        companyName = (ticket as any).travel.company.name
        break
      }
    }
  }

  companyName = companyName || 'EMPRESA'

  const origin = travel.route?.officeOrigin?.place?.name || 'N/A'
  const destination = travel.route?.officeDestination?.place?.name || 'N/A'
  const originOffice = travel.route?.officeOrigin?.name || ''
  const destinationOffice = travel.route?.officeDestination?.name || ''
  const departureDate = travel.departure_time ? formatDate(travel.departure_time) : 'N/A'
  const departureTime = travel.departure_time ? formatTime(travel.departure_time) : 'N/A'
  const arrivalTime = travel.arrival_time ? formatTime(travel.arrival_time) : 'N/A'
  const lane = travel.lane || '-'

  const busName = travel.bus?.name || 'N/A'
  const busPlaque = travel.bus?.plaque || 'N/A'
  const totalSeats = (travel as any).totalBusSeats || 0
  const soldSeats = (travel as any).totalSoldSeats || 0
  const availableSeats = (travel as any).seatsAvailable || totalSeats - soldSeats

  const appQrAmount = parseFloat(travel.app_amount || '0')
  const totalCash = totals ? parseFloat(totals.totalCash) : parseFloat(travel.cash_amount || '0')
  const totalQr = totals ? parseFloat(totals.totalQr) : parseFloat(travel.qr_amount || '0')
  const totalGeneral = totalCash + totalQr

  const drivers: StaffMember[] = travel.drivers || []
  const assistants: StaffMember[] = travel.assistants || []

  const isClosed = travel.travel_status === 'closed'
  const isCancelled = travel.travel_status === 'cancelled'

  // Header
  builder
    .alignCenter()
    .doubleSeparator()
    .bold()
    .doubleSize()
    .line(companyName)
    .normalSize()
    .doubleSeparator()
    .bold()
    .line(`REPORTE VIAJE #${travel.id}`)
    .bold(false)

  // Status
  if (isClosed) {
    builder.line('[CERRADO]')
  } else if (isCancelled) {
    builder.line('[CANCELADO]')
  } else {
    builder.line('[ACTIVO]')
  }

  builder.emptyLine()

  // Route box
  builder.boxTop().alignCenter().bold().boxLine(`${origin} --> ${destination}`).bold(false)

  if (originOffice || destinationOffice) {
    builder.boxLine(`${originOffice} --> ${destinationOffice}`)
  }

  builder.boxMiddle()
  builder.boxLine(`FECHA: ${departureDate}`)
  builder.boxLine(`SALIDA: ${departureTime}  LLEGADA: ${arrivalTime}`)
  builder.boxLine(`CARRIL: ${lane}`)
  builder.boxBottom()

  builder.emptyLine()

  // Bus info
  builder
    .bold()
    .line('--- INFORMACION DEL BUS ---')
    .bold(false)
    .alignLeft()
    .twoColumns('Nombre:', busName)
    .twoColumns('Placa:', busPlaque)
    .twoColumns('Total Asientos:', String(totalSeats))
    .twoColumns('Vendidos:', String(soldSeats))
    .twoColumns('Disponibles:', String(availableSeats))

  builder.emptyLine()

  // Drivers
  builder.bold().line(`--- CONDUCTORES (${drivers.length}) ---`).bold(false)

  if (drivers.length > 0) {
    drivers.forEach((d, i) => {
      builder.line(`${i + 1}. ${d.name} - CI: ${d.ci}`)
    })
  } else {
    builder.line('Sin conductores asignados')
  }

  builder.emptyLine()

  // Assistants
  builder.bold().line(`--- AYUDANTES (${assistants.length}) ---`).bold(false)

  if (assistants.length > 0) {
    assistants.forEach((a, i) => {
      builder.line(`${i + 1}. ${a.name} - CI: ${a.ci}`)
    })
  } else {
    builder.line('Sin ayudantes asignados')
  }

  builder.emptyLine()

  // Passengers
  const allPassengers: { seatNumber: string; deck: number; name: string; ci: string }[] = []

  tickets
    .filter(ticket => ticket.status !== 'cancelled')
    .forEach(ticket => {
      const seats = ticket.travelSeats?.length > 0 ? ticket.travelSeats : ticket.seats

      seats?.forEach(seat => {
        const seatAny = seat as any

        allPassengers.push({
          seatNumber: seat.seatNumber,
          deck: seatAny.deck || 1,
          name:
            seatAny.passenger?.name ||
            ticket.billingSnapshot?.nombre ||
            ticket.billing?.nombre ||
            ticket.buyer?.name ||
            'N/A',
          ci: seatAny.passenger?.ci || ticket.billingSnapshot?.ci || ticket.billing?.ci || ticket.buyer?.ci || 'N/A'
        })
      })
    })

  allPassengers.sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber))

  builder
    .bold()
    .line(`--- PASAJEROS (${allPassengers.length}) ---`)
    .bold(false)
    .tableRow(['As', 'Pi', 'Nombre', 'CI'], [4, 4, 24, 14])
    .separator()

  if (allPassengers.length > 0) {
    allPassengers.forEach(p => {
      builder.tableRow([p.seatNumber, String(p.deck), p.name.substring(0, 22), p.ci.substring(0, 12)], [4, 4, 24, 14])
    })
  } else {
    builder.alignCenter().line('Sin pasajeros').alignLeft()
  }

  builder.emptyLine()

  // Sales summary
  builder.doubleSeparator().bold().alignCenter().line('RESUMEN DE VENTAS').bold(false).alignLeft().separator()

  // App sales
  builder.bold().line('App').bold(false)
  builder.twoColumns('  QR:', `Bs. ${appQrAmount.toFixed(2)}`)

  // Cashier sales
  cashiers.forEach(cashier => {
    builder.bold().line(cashier.fullName.substring(0, 46)).bold(false)
    builder.twoColumns('  Efectivo:', `Bs. ${parseFloat(cashier.cashTotal).toFixed(2)}`)
    builder.twoColumns('  QR:', `Bs. ${parseFloat(cashier.qrTotal).toFixed(2)}`)
  })

  builder.separator()

  // Totals
  builder
    .bold()
    .twoColumns('TOTAL EFECTIVO:', `Bs. ${totalCash.toFixed(2)}`)
    .twoColumns('TOTAL QR:', `Bs. ${totalQr.toFixed(2)}`)
    .bold(false)
    .doubleSeparator()
    .alignCenter()
    .bold()
    .doubleSize()
    .line(`TOTAL: Bs. ${totalGeneral.toFixed(2)}`)
    .normalSize()
    .bold(false)
    .doubleSeparator()

  // Closed info
  if (isClosed && travel.closedAt) {
    builder
      .emptyLine()
      .alignLeft()
      .twoColumns('Cerrado el:', `${formatDate(travel.closedAt)} ${formatTime(travel.closedAt)}`)
  }

  builder.emptyLine()

  // Footer
  builder
    .separator('-')
    .alignCenter()
    .line(`Impreso: ${formatDate(new Date().toISOString())} ${formatTime(new Date().toISOString())}`)

  // Cut paper
  builder.cut()

  return builder.build()
}

export const printTravelReportThermal = async (data: TravelReportData): Promise<void> => {
  const thermalData = buildTravelReportThermalData(data)

  await printData(thermalData)
}

export default printTravelReportThermal
