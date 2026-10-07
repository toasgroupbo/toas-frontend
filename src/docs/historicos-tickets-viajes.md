# Datos históricos de tickets y viajes

## El problema que se corrigió

Varias pantallas mostraban datos de tickets y viajes viejos leyendo tablas que **se pueden editar después**. Cualquier cambio posterior reescribía el historial:

| Si alguien… | …antes pasaba esto |
|---|---|
| Cambiaba el **dueño de un bus** | Los viajes viejos de ese bus pasaban al dueño nuevo (en su listado y **en los pagos pendientes**) |
| Compraba con un CI ya usado, pero con otro nombre | **Todos** los tickets anteriores con ese CI pasaban a mostrar el nombre nuevo |
| **Cancelaba** un ticket | Se perdían los nombres y CI de los pasajeros |
| Renombraba una **oficina** o una **empresa** | Los tickets viejos mostraban el nombre o la dirección nuevos |

Ahora cada ticket y cada viaje guarda una **foto** de esos datos al momento de la venta o de la creación del viaje. Las fotos no cambian nunca.

---

## Resumen de cambios para el front

| # | Dónde | Antes se usaba | Ahora usar |
|---|---|---|---|
| 1 | Viajes: dueño / a quién se le paga | `travel.bus.owner` | **`travel.owner`** |
| 2 | Tickets: nombre y CI de facturación | `ticket.billing` | **`ticket.billingSnapshot`** |
| 3 | Tickets: pasajeros | `ticket.travelSeats[].passenger` | **`ticket.seats[].passenger`** |
| 4 | Tickets: empresa, origen y destino | `ticket.travel.company`, `ticket.travel.route.officeOrigin/officeDestination` | **`ticket.travelSnapshot`** |

Todo es **aditivo**: no se quitó ningún campo de las respuestas, así que lo actual sigue funcionando mientras se migra. Pero los campos viejos siguen mostrando el dato "en vivo" con el problema de arriba.

---

## 1. Dueño del viaje: `travel.owner`

Cada viaje guarda el dueño que tenía el bus **al crear el viaje**. Si después el bus se vende, los viajes viejos siguen siendo del dueño anterior, y **a él se le paga**.

Viene en:
- `GET /api/transactions/travels`: `travel.owner`, **con `bankAccount`**;
- el listado de viajes del dueño (cajero-dueño): `travel.owner`;
- el dashboard: `travel.owner`.

```json
{
  "id": 152,
  "owner": {
    "id": 1,
    "name": "Ana Dueña",
    "bankAccount": { "...": "cuenta ACTUAL del dueño del viaje" }
  },
  "bus": {
    "owner": { "id": 2, "name": "Beto Nuevo" }
  }
}
```

En el ejemplo, el bus hoy es de Beto, pero el viaje 152 se hizo cuando era de Ana: **el viaje y su pago son de Ana**.

- Para "a quién se le va a pagar" en viajes **no pagados**: `travel.owner.bankAccount`. Antes era `travel.bus.owner.bankAccount`. Ver también [comprobantes-pago.md](comprobantes-pago.md).
- `travel.bus.owner` sigue viniendo, pero solo significa "quién es el dueño del bus **hoy**".
- `travel.owner` puede venir `null` solo en viajes viejos de buses sin dueño asignado. En ese caso, mostrar "—".

---

## 2. Facturación: `ticket.billingSnapshot`

```json
"billingSnapshot": { "nombre": "Juan Pérez", "ci": "1234567" }
```

- Es el nombre y CI de facturación **tal como se cargaron en esa venta**.
- `null` si el ticket no tiene facturación. Puede pasar en tickets de la app donde no se asignó.
- `ticket.billing` sigue viniendo, pero es la fila compartida por CI: muestra el **último** nombre que se usó con ese CI, no el de esta venta.

---

## 3. Pasajeros: `ticket.seats[].passenger`

`ticket.seats` ya existía, con número de asiento y precio. Ahora cada asiento también trae el pasajero:

```json
"seats": [
  { "id": 1, "seatNumber": "12", "price": "50.00", "passenger": { "name": "Juan Pérez", "ci": "1234567" } },
  { "id": 2, "seatNumber": "13", "price": "50.00", "passenger": null }
]
```

- **Sobrevive a la cancelación:** un ticket cancelado ya no tiene `travelSeats` (el asiento se libera), pero `seats[].passenger` sigue mostrando para quién era.
- Se actualiza solo cuando se asignan pasajeros (`assign-passenger`), así que no hay que hacer nada extra.
- `passenger: null` significa que ese asiento no tenía pasajero asignado.
- **Tickets cancelados antes de este cambio:** ya habían perdido el dato, así que vienen con `passenger: null`. Mostrar "Pasajero no registrado".
- `id` puede faltar en tickets muy viejos. No depender de él; usar `seatNumber`.

---

## 4. Empresa, origen y destino: `ticket.travelSnapshot`

```json
"travelSnapshot": {
  "companyName": "Trans Norte",
  "origin":      { "officeName": "Terminal LP",   "address": "Av. Perú 100",   "placeName": "La Paz" },
  "destination": { "officeName": "Terminal CBBA", "address": "Av. Ayacucho 5", "placeName": "Cochabamba" }
}
```

- `placeName` es la ciudad. Equivale a `office.place.name`.
- Cualquier campo puede venir `null` si la oficina no tenía ese dato. Mostrar "—".
- La **fecha y hora del viaje** se siguen leyendo de `ticket.travel.departure_time` / `arrival_time`: si se reprograma un viaje, el ticket debe mostrar el horario nuevo.

---

## Ejemplo

```ts
function ticketView(ticket: Ticket) {
  const snap = ticket.travelSnapshot;
  return {
    empresa: snap?.companyName ?? '—',
    origen: snap ? `${snap.origin.placeName ?? ''} - ${snap.origin.officeName ?? ''}` : '—',
    destino: snap ? `${snap.destination.placeName ?? ''} - ${snap.destination.officeName ?? ''}` : '—',
    facturaNombre: ticket.billingSnapshot?.nombre ?? '—',
    facturaCi: ticket.billingSnapshot?.ci ?? '—',
    pasajeros: ticket.seats.map((s) => ({
      asiento: s.seatNumber,
      nombre: s.passenger?.name ?? 'Pasajero no registrado',
      ci: s.passenger?.ci ?? '—',
    })),
    salida: ticket.travel.departure_time, // este sí, en vivo
  };
}
```

---

## Checklist de pruebas

- [ ] Cambiar el dueño de un bus → los viajes viejos siguen en el listado del dueño **anterior**, y su pago pendiente muestra la cuenta del dueño anterior.
- [ ] Un viaje nuevo de ese bus → aparece para el dueño **nuevo**.
- [ ] Vender dos tickets con el mismo CI y nombres distintos → cada ticket muestra su propio nombre.
- [ ] Cancelar un ticket vendido → sus pasajeros se siguen viendo.
- [ ] Renombrar una oficina → los tickets viejos muestran el nombre anterior y los nuevos el nombre nuevo.
- [ ] Reprogramar un viaje → los tickets muestran el horario nuevo.
