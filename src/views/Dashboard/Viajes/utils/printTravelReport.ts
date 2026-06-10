import type { Travel } from '@/types/api/travels'
import type { Ticket } from '@/types/api/tickets'
import type { CashierSummary } from '@/hooks/useTickets'

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

export const generateTravelReportHTML = ({ travel, tickets = [], companyName, cashiers = [], totals }: TravelReportData): string => {
  if (!companyName && (travel as any).company?.name) {
    companyName = (travel as any).company.name
  }

  if (!companyName && tickets && tickets.length > 0) {
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

  // Generate drivers HTML
  const driversHTML =
    drivers.length > 0
      ? drivers
          .map(
            (d, i) => `
        <div class="staff-item">
          <span class="staff-number">${i + 1}.</span>
          <span class="staff-name">${d.name}</span>
          <span class="staff-ci">CI: ${d.ci}</span>
        </div>
      `
          )
          .join('')
      : '<div class="empty-text">Sin conductores asignados</div>'

  // Generate assistants HTML
  const assistantsHTML =
    assistants.length > 0
      ? assistants
          .map(
            (a, i) => `
        <div class="staff-item">
          <span class="staff-number">${i + 1}.</span>
          <span class="staff-name">${a.name}</span>
          <span class="staff-ci">CI: ${a.ci}</span>
        </div>
      `
          )
          .join('')
      : '<div class="empty-text">Sin ayudantes asignados</div>'

  // Generate passengers HTML from tickets
  const allPassengers: { seatNumber: string; deck: number; name: string; ci: string }[] = []

  tickets.forEach(ticket => {
    const seats = ticket.travelSeats?.length > 0 ? ticket.travelSeats : ticket.seats

    seats?.forEach(seat => {
      const seatAny = seat as any

      allPassengers.push({
        seatNumber: seat.seatNumber,
        deck: seatAny.deck || 1,
        name: seatAny.passenger?.name || ticket.billing?.nombre || ticket.buyer?.name || 'N/A',
        ci: seatAny.passenger?.ci || ticket.billing?.ci || ticket.buyer?.ci || 'N/A'
      })
    })
  })

  // Sort passengers by seat number
  allPassengers.sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber))

  const passengersHTML =
    allPassengers.length > 0
      ? allPassengers
          .map(
            p => `
        <tr>
          <td style="text-align: center; font-weight: bold;">${p.seatNumber}</td>
          <td style="text-align: center;">${p.deck}</td>
          <td style="text-align: left; font-size: 10px;">${p.name}</td>
          <td style="text-align: center; font-size: 10px;">${p.ci}</td>
        </tr>
      `
          )
          .join('')
      : '<tr><td colspan="4" style="text-align: center; padding: 10px; color: #666;">Sin pasajeros</td></tr>'

  const statusBadge = isClosed
    ? '<div class="status-badge closed">CERRADO</div>'
    : isCancelled
      ? '<div class="status-badge cancelled">CANCELADO</div>'
      : '<div class="status-badge active">ACTIVO</div>'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Arial', sans-serif;
          font-size: 11px;
          width: 72mm;
          padding: 3mm 3mm 3mm 5mm;
          margin-left: 2mm;
          color: #000;
        }

        .header {
          text-align: center;
          margin-bottom: 6px;
          border-bottom: 2px solid #000;
          padding-bottom: 6px;
        }

        .company {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 2px;
        }

        .report-title {
          font-size: 12px;
          font-weight: bold;
          background: #000;
          color: #fff;
          padding: 3px 8px;
          display: inline-block;
          border-radius: 3px;
          margin: 3px 0;
        }

        .status-badge {
          padding: 2px 8px;
          font-size: 10px;
          font-weight: bold;
          border-radius: 3px;
          display: inline-block;
          margin-top: 3px;
        }

        .status-badge.active {
          background: #28a745;
          color: #fff;
        }

        .status-badge.closed {
          background: #6c757d;
          color: #fff;
        }

        .status-badge.cancelled {
          background: #dc3545;
          color: #fff;
        }

        .route-box {
          border: 2px solid #000;
          border-radius: 4px;
          padding: 6px;
          margin: 6px 0;
          text-align: center;
        }

        .route-cities {
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .route-arrow {
          font-size: 14px;
          margin: 0 4px;
        }

        .route-offices {
          font-size: 9px;
          color: #666;
        }

        .departure-info {
          display: flex;
          justify-content: space-around;
          margin-top: 4px;
          border-top: 1px dashed #000;
          padding-top: 4px;
        }

        .departure-item {
          text-align: center;
        }

        .departure-label {
          font-size: 8px;
          color: #666;
        }

        .departure-value {
          font-size: 11px;
          font-weight: bold;
        }

        .section {
          margin: 6px 0;
        }

        .section-title {
          font-size: 10px;
          font-weight: bold;
          background: #f0f0f0;
          padding: 2px 4px;
          margin-bottom: 3px;
          border-left: 3px solid #000;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          margin: 2px 0;
          padding: 1px 0;
        }

        .info-label {
          color: #666;
        }

        .info-value {
          font-weight: bold;
        }

        .staff-item {
          font-size: 10px;
          padding: 2px 0;
          border-bottom: 1px dashed #ddd;
        }

        .staff-number {
          font-weight: bold;
          margin-right: 4px;
        }

        .staff-name {
          font-weight: bold;
        }

        .staff-ci {
          color: #666;
          margin-left: 6px;
          font-size: 9px;
        }

        .empty-text {
          color: #999;
          font-style: italic;
          font-size: 9px;
          padding: 3px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 3px 0;
        }

        table th {
          font-size: 9px;
          font-weight: bold;
          border-bottom: 1px solid #000;
          padding: 3px 2px;
          text-align: center;
          background: #f5f5f5;
        }

        table td {
          font-size: 10px;
          padding: 2px;
          border-bottom: 1px dashed #ddd;
        }

        .totals-box {
          border: 2px solid #000;
          border-radius: 4px;
          padding: 6px;
          margin: 6px 0;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 2px 0;
        }

        .totals-row.main {
          border-top: 1px solid #000;
          margin-top: 4px;
          padding-top: 4px;
          font-size: 12px;
        }

        .totals-label {
          font-weight: bold;
        }

        .totals-value {
          font-weight: bold;
        }

        .totals-value.highlight {
          font-size: 14px;
        }

        .footer {
          text-align: center;
          margin-top: 8px;
          font-size: 9px;
          color: #666;
          border-top: 1px dashed #000;
          padding-top: 6px;
        }

        .print-date {
          font-size: 8px;
          color: #999;
        }

        .cut-line {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company">${companyName || 'EMPRESA'}</div>
        <div class="report-title">REPORTE DE VIAJE #${travel.id}</div>
        ${statusBadge}
      </div>

      <div class="route-box">
        <div class="route-cities">
          ${origin}
          <span class="route-arrow">→</span>
          ${destination}
        </div>
        <div class="route-offices">${originOffice} → ${destinationOffice}</div>
        <div class="departure-info">
          <div class="departure-item">
            <div class="departure-label">FECHA</div>
            <div class="departure-value">${departureDate}</div>
          </div>
          <div class="departure-item">
            <div class="departure-label">SALIDA</div>
            <div class="departure-value">${departureTime}</div>
          </div>
          <div class="departure-item">
            <div class="departure-label">LLEGADA</div>
            <div class="departure-value">${arrivalTime}</div>
          </div>
          <div class="departure-item">
            <div class="departure-label">CARRIL</div>
            <div class="departure-value">${lane}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">INFORMACIÓN DEL BUS</div>
        <div class="info-row">
          <span class="info-label">Nombre:</span>
          <span class="info-value">${busName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Placa:</span>
          <span class="info-value">${busPlaque}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total Asientos:</span>
          <span class="info-value">${totalSeats}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Vendidos:</span>
          <span class="info-value">${soldSeats}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Disponibles:</span>
          <span class="info-value">${availableSeats}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">CONDUCTORES (${drivers.length})</div>
        ${driversHTML}
      </div>

      <div class="section">
        <div class="section-title">AYUDANTES (${assistants.length})</div>
        ${assistantsHTML}
      </div>

      <div class="section">
        <div class="section-title">PASAJEROS (${allPassengers.length})</div>
        <table>
          <thead>
            <tr>
              <th>Asiento</th>
              <th>Piso</th>
              <th>Nombre</th>
              <th>CI</th>
            </tr>
          </thead>
          <tbody>
            ${passengersHTML}
          </tbody>
        </table>
      </div>

      <div class="totals-box">
        <div class="section-title" style="margin: 0 0 4px 0;">RESUMEN DE VENTAS</div>

        <div style="margin-bottom: 6px;">
          <div class="totals-label" style="font-size: 10px;">App</div>
          <div class="totals-row">
            <span class="totals-label">QR:</span>
            <span class="totals-value">Bs. ${appQrAmount.toFixed(2)}</span>
          </div>
        </div>

        ${cashiers.map(cashier => `
          <div style="margin-bottom: 6px;">
            <div class="totals-label" style="font-size: 10px;">${cashier.fullName}</div>
            <div class="totals-row">
              <span class="totals-label">Efectivo:</span>
              <span class="totals-value">Bs. ${parseFloat(cashier.cashTotal).toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span class="totals-label">QR:</span>
              <span class="totals-value">Bs. ${parseFloat(cashier.qrTotal).toFixed(2)}</span>
            </div>
          </div>
        `).join('')}

        <div style="border-top: 1px solid #000; padding-top: 4px; margin-top: 6px;">
          <div class="totals-row">
            <span class="totals-label">TOTAL EFECTIVO</span>
            <span class="totals-value">Bs. ${totalCash.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span class="totals-label">TOTAL QR</span>
            <span class="totals-value">Bs. ${totalQr.toFixed(2)}</span>
          </div>
          <div class="totals-row main" style="border-top: none; margin-top: 2px;">
            <span class="totals-label">TOTAL GENERAL:</span>
            <span class="totals-value highlight">Bs. ${totalGeneral.toFixed(2)}</span>
          </div>
        </div>
      </div>

      ${
        isClosed && travel.closedAt
          ? `
      <div class="section">
        <div class="info-row">
          <span class="info-label">Cerrado el:</span>
          <span class="info-value">${formatDate(travel.closedAt)} ${formatTime(travel.closedAt)}</span>
        </div>
      </div>
      `
          : ''
      }

      <div class="cut-line"></div>

      <div class="footer">
        <div class="print-date">Impreso: ${formatDate(new Date().toISOString())} ${formatTime(new Date().toISOString())}</div>
      </div>

      <div style="height: 15mm;"></div>
    </body>
    </html>
  `
}

export const printTravelReport = (data: TravelReportData): void => {
  const html = generateTravelReportHTML(data)

  const width = 1200
  const height = 800
  const left = window.screenX + 100
  const top = window.screenY + 50

  const printWindow = window.open(
    '',
    '_blank',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
  )

  if (!printWindow) {
    console.error('Could not open print window')

    return
  }

  printWindow.document.write(html)
  printWindow.document.close()

  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
}

export default printTravelReport
