import type { Ticket } from '@/types/api/tickets'

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

const getSaleTypeLabel = (type: string): string => {
  if (type === 'IN_OFFICE') return 'Oficina'
  if (type === 'IN_APP') return 'Aplicación'

  return type
}

const getPaymentLabel = (paymentType?: string): string => {
  if (paymentType === 'qr') return 'QR'
  if (paymentType === 'cash') return 'Efectivo'

  return 'N/A'
}

export const generateReceiptHTML = (ticket: Ticket): string => {
  const isCancelled = ticket.status === 'cancelled'
  const companyName = ticket.travel?.company?.name || 'EMPRESA'
  const origin = ticket.travel?.route?.officeOrigin?.place?.name || 'N/A'
  const destination = ticket.travel?.route?.officeDestination?.place?.name || 'N/A'
  const departureDate = ticket.travel?.departure_time ? formatDate(ticket.travel.departure_time) : 'N/A'
  const departureTime = ticket.travel?.departure_time ? formatTime(ticket.travel.departure_time) : 'N/A'
  const lane = ticket.travel?.lane || '-'

  const buyerName = ticket.billing?.nombre || ticket.buyer?.name || 'N/A'
  const buyerCi = ticket.billing?.ci || ticket.buyer?.ci || 'N/A'

  const seats = ticket.travelSeats?.length > 0 ? ticket.travelSeats : ticket.seats
  const totalPrice = parseFloat(ticket.total_price).toFixed(2)

  const seatsHTML = seats
    ?.map(seat => {
      const seatAny = seat as any
      const passengerName = seatAny.passenger?.name || null
      const deck = seatAny.deck || null

      return `
      <tr>
        <td style="text-align: center; font-weight: bold; font-size: 14px;">${seat.seatNumber}</td>
        <td style="text-align: center;">${deck || '-'}</td>
        <td style="text-align: left; font-size: 11px;">${passengerName || buyerName}</td>
        <td style="text-align: right;">Bs. ${parseFloat(seat.price).toFixed(2)}</td>
      </tr>
    `
    })
    .join('')

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
          font-size: 12px;
          width: 72mm;
          padding: 4mm;
          color: #000;
        }

        .header {
          text-align: center;
          margin-bottom: 8px;
        }

        .company {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .ticket-id {
          font-size: 14px;
          font-weight: bold;
          background: #000;
          color: #fff;
          padding: 4px 8px;
          display: inline-block;
          border-radius: 4px;
          margin: 4px 0;
        }

        .cancelled-badge {
          background: #dc3545;
          color: #fff;
          padding: 4px 12px;
          font-weight: bold;
          border-radius: 4px;
          display: inline-block;
          margin: 4px 0;
        }

        .route-box {
          border: 2px solid #000;
          border-radius: 6px;
          padding: 8px;
          margin: 8px 0;
          text-align: center;
        }

        .route-cities {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 6px;
        }

        .route-arrow {
          font-size: 16px;
          margin: 0 6px;
        }

        .departure-info {
          display: flex;
          justify-content: space-around;
          margin-top: 6px;
          border-top: 1px dashed #000;
          padding-top: 6px;
        }

        .departure-item {
          text-align: center;
        }

        .departure-label {
          font-size: 10px;
          color: #666;
        }

        .departure-value {
          font-size: 13px;
          font-weight: bold;
        }

        .section {
          margin: 8px 0;
        }

        .section-title {
          font-size: 10px;
          font-weight: bold;
          color: #666;
          border-bottom: 1px solid #ccc;
          padding-bottom: 2px;
          margin-bottom: 4px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin: 2px 0;
        }

        .info-label {
          color: #666;
        }

        .info-value {
          font-weight: bold;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 4px 0;
        }

        table th {
          font-size: 10px;
          font-weight: bold;
          border-bottom: 1px solid #000;
          padding: 4px 2px;
          text-align: center;
        }

        table td {
          font-size: 11px;
          padding: 4px 2px;
          border-bottom: 1px dashed #ccc;
        }

        .total-box {
          padding: 12px;
          margin: 10px 0;
         
          text-align: center;
          
        }

        .total-label {
          font-size: 12px;
          font-weight: bold;
          color: #000;
          margin-bottom: 4px;
        }

        .total-amount {
          font-size: 28px;
          font-weight: 900;
          color: #000;
          letter-spacing: 1px;
        }

        .footer {
          text-align: center;
          margin-top: 10px;
          font-size: 10px;
          color: #666;
        }

        .footer-msg {
          font-size: 12px;
          font-weight: bold;
          color: #000;
          margin-top: 6px;
        }

        .cut-line {
          border-top: 1px dashed #000;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company">${companyName}</div>
        <div class="ticket-id">TICKET #${ticket.id}</div>
        ${isCancelled ? '<div class="cancelled-badge">CANCELADO</div>' : ''}
      </div>

      <div class="route-box">
        <div class="route-cities">
          <span style="font-size: 10px; font-weight: bold; color: #000;">ORIGEN:</span> ${origin}
          <span class="route-arrow">→</span>
          <span style="font-size: 10px; font-weight: bold; color: #000;">DESTINO:</span> ${destination}
        </div>
        <div class="departure-info">
          <div class="departure-item">
            <div class="departure-label">FECHA</div>
            <div class="departure-value">${departureDate}</div>
          </div>
          <div class="departure-item">
            <div class="departure-label">HORA</div>
            <div class="departure-value">${departureTime}</div>
          </div>
          <div class="departure-item">
            <div class="departure-label">CARRIL</div>
            <div class="departure-value">${lane}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">COMPRADOR</div>
        <div class="info-row">
          <span class="info-label">Nombre:</span>
          <span class="info-value">${buyerName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">CI/NIT:</span>
          <span class="info-value">${buyerCi}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">ASIENTOS</div>
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Piso</th>
              <th>Pasajero</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            ${seatsHTML}
          </tbody>
        </table>
      </div>

      <div class="total-box">
        <div class="total-label">TOTAL A PAGAR</div>
        <div class="total-amount">Bs. ${totalPrice}</div>
      </div>

      <div class="section">
        <div class="info-row">
          <span class="info-label">Tipo de Venta:</span>
          <span class="info-value">${getSaleTypeLabel(ticket.type)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Método de Pago:</span>
          <span class="info-value">${getPaymentLabel(ticket.payment_type)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha Emisión:</span>
          <span class="info-value">${formatDate(ticket.createdAt)} ${formatTime(ticket.createdAt)}</span>
        </div>
        ${
          ticket.type === 'IN_OFFICE' && ticket.soldBy
            ? `
        <div class="info-row">
          <span class="info-label">Cajero:</span>
          <span class="info-value">${ticket.soldBy.fullName || ticket.soldBy.email || 'N/A'}</span>
        </div>
        `
            : ''
        }
      </div>

      ${
        isCancelled
          ? `
      <div class="section" style="background: #fee; padding: 6px; border-radius: 4px; border: 1px solid #dc3545;">
        <div style="color: #dc3545; font-weight: bold; text-align: center; margin-bottom: 4px;">TICKET CANCELADO</div>
        <div class="info-row">
          <span class="info-label">Fecha:</span>
          <span class="info-value">${ticket.cancelledAt ? formatDate(ticket.cancelledAt) + ' ' + formatTime(ticket.cancelledAt) : 'N/A'}</span>
        </div>
      </div>
      `
          : ''
      }

      <div class="cut-line"></div>

      <div class="footer">
        <div class="footer-msg">¡Gracias por su preferencia!</div>
        <div>Buen Viaje</div>
      </div>

      <div style="height: 20mm;"></div>
    </body>
    </html>
  `
}

export const printTicketReceipt = (ticket: Ticket): void => {
  const html = generateReceiptHTML(ticket)

  const width = 1200
  const height = 700
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

export const downloadTicketReceipt = (ticket: Ticket): void => {
  const html = generateReceiptHTML(ticket)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `ticket-${ticket.id}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default printTicketReceipt
