# Clientes eliminados

## Qué cambió

Los clientes ahora pueden **eliminar su propia cuenta desde la app** (Apple lo exige para publicar en el App Store). Un admin también puede eliminarlos, como antes, con `DELETE /api/customers/:id`.

En los dos casos pasa lo mismo:

- Se borran los datos personales del cliente: email, teléfono, CI, fecha de nacimiento y facturación guardada. El nombre pasa a ser **"Cliente eliminado"**.
- **Sus tickets se conservan**: son ventas de la empresa y siguen contando en reportes, cierres de viaje, comisiones y pagos a dueños.
- Si la persona vuelve a entrar a la app, se le crea una cuenta nueva, vacía.

**El cambio importante para el front:** antes, el comprador de los tickets de un cliente eliminado llegaba como `buyer: null`, y las pantallas que hacían `ticket.buyer.name` fallaban. **Ahora `buyer` siempre viene**, con los datos personales en `null`.

---

## Resumen para el front

| # | Pantalla | ¿Hay que cambiar algo? |
|---|---|---|
| 1 | Tickets (listado y detalle) | **Revisar** que `buyer.email` no se use sin chequear `null` |
| 2 | Listado y detalle de clientes | No. Los eliminados ya no aparecen |
| 3 | Eliminar cliente (admin) | No. Mismo request y misma respuesta |
| 4 | Recarga de saldo (super-admin) | No. Ya no se puede elegir un cliente eliminado |
| 5 | Cancelar viaje (cajero) | No. Los tickets de clientes eliminados se cancelan sin reembolso (ver sección 5) |
| 6 | Dashboard, reportes, cierres, comisiones, pagos | No. Los montos no cambian |

---

## 1. Tickets: `buyer` de un cliente eliminado

Aplica a todas las respuestas que traen tickets con su comprador (listado y detalle de tickets del admin, y tickets en las pantallas de caja):

```json
"buyer": {
  "id": 57,
  "name": "Cliente eliminado",
  "email": null,
  "ci": null,
  "phone": null,
  "birthDate": null,
  "billingObject": null,
  "is_verified": true,
  "provider": "google",
  "idProvider": "deleted-57",
  "createdAt": "2026-03-10T15:00:00.000Z",
  "accountDeletedAt": "2026-10-06T14:20:00.000Z"
}
```

| Campo | Qué mostrar |
|---|---|
| `name` | Viene "Cliente eliminado". Se puede mostrar tal cual, sin cambios |
| `email` | **`null`.** Mostrar "—". Ver el aviso de abajo |
| `ci`, `phone`, `birthDate`, `billingObject` | `null` → mostrar "—". Ya podían venir `null` en clientes que nunca cargaron esos datos, así que el front ya debería manejarlo |
| `accountDeletedAt` | **Campo nuevo.** `null` si la cuenta está activa; una fecha si fue eliminada. Sirve para mostrar una etiqueta "Cuenta eliminada" junto al comprador |

> ⚠️ **Revisar los usos de `buyer.email`.** Antes, todo cliente tenía email; ahora uno eliminado lo trae en `null`. Mostrarlo directo (`{buyer.email}`) no falla: solo sale vacío. Lo que **sí falla** es aplicarle funciones sin chequear antes, por ejemplo `buyer.email.toLowerCase()`, `buyer.email.split('@')` o `buyer.email.includes(...)`. Usar `buyer.email ?? '—'` o `buyer.email?.toLowerCase()`.

**Para saber a quién pertenecía el ticket**, usar los datos guardados en el propio ticket, que no se borran:
- `ticket.billingSnapshot`: nombre y CI de facturación de esa compra;
- `ticket.seats[].passenger`: nombre y CI de cada pasajero.

Ver [historicos-tickets-viajes.md](historicos-tickets-viajes.md).

```ts
function compradorView(ticket: Ticket) {
  const buyer = ticket.buyer;
  if (!buyer) return { nombre: '—' }; // ventas en oficina: no tienen comprador

  return {
    nombre: buyer.name,
    email: buyer.email ?? '—',
    telefono: buyer.phone ?? '—',
    eliminado: buyer.accountDeletedAt != null,
    // para identificar a la persona, usar ticket.billingSnapshot o ticket.seats[].passenger
  };
}
```

> `buyer` sigue viniendo `null` en los tickets vendidos en **oficina**, porque no tienen comprador de la app. Eso no cambió.

---

## 2. Clientes: listado y detalle

- `GET /api/customers`: los clientes eliminados **no aparecen**, y su saldo no suma a `totalBalance`.
- `GET /api/customers/:id` de un cliente eliminado responde `404 "Customer not found"`. Se puede llegar a esto, por ejemplo, desde un link de un ticket viejo al detalle de su comprador. En ese caso, mostrar "Este cliente eliminó su cuenta" en vez de un error genérico, o no mostrar el link cuando `buyer.accountDeletedAt` tiene valor.

---

## 3. Eliminar cliente (admin)

`DELETE /api/customers/:id`: el request y la respuesta no cambian.

```json
{ "message": "Customer deleted successfully", "deleted": { "id": 57 } }
```

Si el cliente ya estaba eliminado, porque lo hizo él mismo desde la app o porque otro admin se adelantó, responde `404 "Customer not found"`. Mostrar "Este cliente ya fue eliminado" y refrescar el listado.

---

## 4. Recarga de saldo (super-admin)

Si se intenta generar un QR de recarga para un cliente eliminado, responde `400 "Customer with ID 57 not found"`. En la práctica no debería pasar, porque los eliminados ya no aparecen en el listado de clientes desde donde se eligen.

---

## 5. Cancelar un viaje con tickets de clientes eliminados

`POST /api/travels/for-cashier/cancel/:id`: el request y la respuesta no cambian. Si el viaje tiene tickets de la app de clientes que eliminaron su cuenta:

- esos tickets **se cancelan** igual que los demás y liberan sus asientos;
- **no se reembolsan**, porque la cuenta ya no existe y nadie podría usar ese saldo. Por eso `refundedTickets` no los cuenta.

Si esa persona reclama en la oficina, se la identifica por el CI que quedó en el ticket (`billingSnapshot` o `seats[].passenger`) y se le devuelve a mano.

---

## Checklist de pruebas

- [ ] Eliminar un cliente que tiene tickets → el listado y el detalle de tickets **no fallan** y el comprador se muestra como "Cliente eliminado".
- [ ] En esos tickets, el email, el teléfono y el CI del comprador muestran "—", no "null" ni vacío roto.
- [ ] El cliente eliminado no aparece en el listado de clientes.
- [ ] Abrir el detalle de un cliente eliminado (si hay algún link que lleve ahí) → mensaje claro, no un error genérico.
- [ ] Eliminar dos veces el mismo cliente → la segunda vez se ve "ya fue eliminado".
- [ ] Los montos del dashboard y de los reportes no cambian después de eliminar un cliente.
- [ ] Cancelar un viaje con un ticket vendido de un cliente eliminado → el ticket se cancela y `refundedTickets` no lo cuenta.
