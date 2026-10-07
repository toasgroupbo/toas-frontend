# Aprobación de viajes creados por cajeros

## Qué hace

Cada empresa puede activar una opción para que **los viajes que crea un cajero no se puedan vender hasta que el admin de empresa los apruebe**.

- La opción viene **desactivada** en todas las empresas. Mientras siga así, nada cambia: el viaje nace `active`, como hasta ahora.
- Con la opción activa, el viaje nace en `pending_approval`. El admin lo **aprueba**, y pasa a `active` y ya se puede vender, o lo **rechaza**, y pasa a `rejected`.
- Un viaje pendiente o rechazado **no aparece en la app** y **no se puede vender** ni en caja ni en la app. Tampoco se puede cerrar, cancelar ni asignarle personal.

```
                 opción desactivada
cajero crea ───────────────────────────────► active
     │
     │ opción activa
     ▼
pending_approval ──── admin aprueba ───────► active
     │
     └─────────────── admin rechaza ───────► rejected   (estado final)
```

Un viaje `rejected` no se puede reactivar. Si hacía falta, el cajero crea uno nuevo. El bus queda libre en ese horario apenas se rechaza.

---

## Resumen para el front

| # | Pantalla | Qué hacer |
|---|---|---|
| 1 | Panel admin: configuración de la empresa | Interruptor "Requerir aprobación de viajes" |
| 2 | Panel admin: listado de viajes | Estados nuevos, filtro "Pendientes" y quién creó el viaje |
| 3 | Panel admin: detalle del viaje | Botones **Aprobar** / **Rechazar** cuando está pendiente |
| 4 | Panel cajero: crear viaje | Mensaje si el viaje quedó pendiente |
| 5 | Panel cajero: listado de viajes | Estados nuevos, sin acciones de venta en pendientes y rechazados |
| 6 | Panel super-admin: editar empresa | Campo opcional `require_travel_approval` |

### Estados nuevos de viaje

`travel_status` puede tener dos valores más:

| Valor | Etiqueta sugerida | Color sugerido |
|---|---|---|
| `pending_approval` | Pendiente de aprobación | Amarillo / ámbar |
| `rejected` | Rechazado | Rojo / gris |

Los de antes (`active`, `closed`, `cancelled`) no cambian. Revisar los `switch` o mapas de etiquetas que tengan los estados fijos, para que los valores nuevos no se muestren vacíos.

### Permiso nuevo

El rol **COMPANY_ADMIN** recibe el permiso `APPROVE` sobre el recurso `TRAVEL`. Si el front arma menús o botones a partir de los permisos del usuario, usar `TRAVEL` + `APPROVE` para mostrar la configuración y los botones de aprobar y rechazar.

El super-admin **no** tiene ese permiso, así que no puede aprobar ni rechazar viajes. Sí puede activar la opción desde la edición de la empresa (sección 6).

---

## 1. Configuración: activar o desactivar la aprobación (admin de empresa)

### Leer el valor actual

```
GET /api/travels/settings/approval
```

Respuesta `200`:

```json
{ "require_travel_approval": false }
```

### Cambiarlo

```
PATCH /api/travels/settings/approval
```

```json
{ "enabled": true }
```

Respuesta `200`:

```json
{ "require_travel_approval": true }
```

- `enabled` es obligatorio y booleano. Si no se manda, la respuesta es `400`.
- La empresa se toma del usuario logueado. No hace falta mandar `companyId`.
- **Desactivarla no aprueba los viajes que ya estaban pendientes:** esos siguen pendientes hasta que el admin los apruebe o rechace. Conviene avisarlo en la UI, por ejemplo: "Los viajes pendientes actuales seguirán esperando tu revisión".

Sugerencia de texto para el interruptor:

> **Requerir aprobación de viajes**
> Los viajes que creen los cajeros no estarán a la venta hasta que los apruebes.

---

## 2. Listado de viajes del admin

```
GET /api/travels?status=pending_approval
```

Es el mismo endpoint de siempre. Cambios:

- **Sin `status`**, el listado incluye también los pendientes y los rechazados. Se recomienda un filtro o pestaña **"Pendientes"** que mande `status=pending_approval`, y opcionalmente un contador.
- `status` acepta los valores nuevos `pending_approval` y `rejected`.
- Cada viaje trae campos nuevos (los mismos que en el detalle, sección 3): `createdBy`, `reviewedBy`, `reviewedAt` y `rejection_reason`.
- Los montos (`cash_amount`, `qr_amount`, `app_amount`) de un viaje pendiente o rechazado siempre son `0`, porque no se pudo vender nada.

```json
{
  "id": 210,
  "departure_time": "2026-10-10T12:00:00.000Z",
  "arrival_time": "2026-10-10T20:00:00.000Z",
  "travel_status": "pending_approval",
  "reviewedAt": null,
  "rejection_reason": null,
  "createdBy": { "id": 14, "fullName": "Carla Cajera", "email": "carla@empresa.com", "ci": "7654321", "phone": "70000000", "...": "..." },
  "reviewedBy": null,
  "bus": { "...": "..." },
  "route": { "officeOrigin": { "...": "..." }, "officeDestination": { "...": "..." } },
  "totalSoldSeats": 0
}
```

Columna sugerida: **"Creado por"** con `createdBy.fullName`. Puede venir `null` en viajes muy viejos; en ese caso, mostrar "—".

---

## 3. Detalle del viaje: aprobar o rechazar (admin de empresa)

```
GET /api/travels/:id
```

El detalle también trae `createdBy`, `reviewedBy`, `reviewedAt` y `rejection_reason`.

| Campo | Significado |
|---|---|
| `createdBy` | Cajero que creó el viaje |
| `reviewedBy` | Admin que lo aprobó o rechazó. `null` mientras esté pendiente, y también en viajes que nunca requirieron aprobación |
| `reviewedAt` | Fecha de la aprobación o el rechazo |
| `rejection_reason` | Motivo del rechazo. `null` si no se indicó o si no fue rechazado |

Mostrar los botones **Aprobar** y **Rechazar** solo cuando `travel_status === 'pending_approval'`.

### Aprobar

```
PATCH /api/travels/:id/approve
```

Sin body. Respuesta `200`:

```json
{
  "message": "Travel approved successfully",
  "travelId": 210,
  "travel_status": "active"
}
```

Desde ese momento el viaje aparece en la app y los cajeros pueden vender.

### Rechazar

```
PATCH /api/travels/:id/reject
```

```json
{ "rejection_reason": "El bus está en mantenimiento ese día" }
```

- `rejection_reason` es **opcional**, con un máximo de 500 caracteres. Se puede mandar el body vacío `{}`.
- Se recomienda pedir el motivo en un modal, porque el cajero lo va a ver en su listado.

Respuesta `200`:

```json
{
  "message": "Travel rejected successfully",
  "travelId": 210,
  "travel_status": "rejected",
  "rejection_reason": "El bus está en mantenimiento ese día"
}
```

Pedir confirmación antes de rechazar: **un rechazo no se puede deshacer**.

### Errores posibles (aprobar y rechazar)

| Código | `message` | Cuándo | Qué mostrar |
|---|---|---|---|
| `404` | `Travel not found` | El viaje no existe o es de otra empresa | "Viaje no encontrado" |
| `400` | `The travel is not pending approval (current status: active)` | Ya fue aprobado o rechazado, por ejemplo por otro admin al mismo tiempo | "Este viaje ya fue revisado" y recargar el detalle |
| `400` | `Cannot approve a travel whose departure time has already passed` | Solo al aprobar: la hora de salida ya pasó | "La hora de salida ya pasó; solo se puede rechazar" |
| `403` | — | El usuario no tiene el permiso `TRAVEL` + `APPROVE` | "No tienes permiso" |

**Pendientes vencidos:** si un viaje sigue pendiente y su `departure_time` ya pasó, ya no se puede aprobar. Se sugiere mostrar una etiqueta "Vencido" y dejar solo el botón **Rechazar**, para que no quede pendiente para siempre.

---

## 4. Cajero: crear viaje

```
POST /api/travels/for-cashier
```

El request no cambia. La respuesta es el viaje creado, como antes, pero con la opción activa viene `travel_status: "pending_approval"`:

```json
{ "id": 210, "travel_status": "pending_approval", "...": "..." }
```

Si `travel_status === 'pending_approval'`, mostrar un mensaje como:

> Viaje creado. **Queda pendiente de aprobación** del administrador; no se podrá vender hasta que lo apruebe.

Si viene `active`, el mensaje de siempre.

**Bus ocupado:** un viaje pendiente también ocupa el bus en ese horario. Si el cajero intenta crear otro viaje con el mismo bus y horarios que se superponen, recibe el mismo `409` de siempre (`The bus already has a travel scheduled that overlaps...`), aunque el viaje anterior todavía no esté aprobado.

---

## 5. Cajero: listado de viajes

```
GET /api/travels/for-cashier/all
```

- **Sin `status`**, ahora incluye los viajes `pending_approval` y `rejected` de la oficina, además de `active` y `closed`. Así el cajero ve el estado de lo que creó.
- `status` acepta también `pending_approval` y `rejected`.
- Los viajes rechazados traen `rejection_reason`. Mostrarlo, por ejemplo con un tooltip "Rechazado: El bus está en mantenimiento ese día".

En viajes `pending_approval` o `rejected`, **ocultar o deshabilitar** las acciones de vender, cerrar, cancelar y asignar personal. Si igual se llaman, el backend responde con error:

| Acción | Respuesta del backend |
|---|---|
| Vender ticket | `400 Travel 210 is not active` |
| Cerrar viaje | `404 Active travel not found` |
| Cancelar viaje | `400 The Travel is not active` |
| Asignar personal | `404 Active travel not found` |

El listado del **cajero-dueño** (`GET /api/travels/for-cashier/owner/all`) no cambia: sin `status` no muestra pendientes ni rechazados.

---

## 6. Super-admin: editar empresa

`PATCH /api/company/:id` (y también `POST /api/company`) acepta un campo opcional:

```json
{ "require_travel_approval": true }
```

Es el mismo valor que cambia el admin de empresa desde la sección 1. `GET /api/company/:id` y el listado de empresas ahora lo devuelven. Si no se manda al crear la empresa, queda en `false`.

---

## Qué no cambia

- **App móvil:** no hay cambios. Solo lista viajes `active`, así que los pendientes y rechazados no aparecen.
- **Dashboard, reportes y pagos a dueños:** solo cuentan viajes `active` y `closed`, así que los pendientes y rechazados no suman nada.
- **Eliminar bus, ruta u oficina, o deshabilitar un cajero:** un viaje `pending_approval` cuenta como "salida sin cerrar" y bloquea la eliminación, igual que un viaje activo. Uno `rejected` **no** bloquea.

---

## Checklist de pruebas

- [ ] Con la opción **desactivada** (por defecto): el cajero crea un viaje → nace `active` y se puede vender. Nada cambia.
- [ ] El admin activa la opción → `GET /api/travels/settings/approval` devuelve `true`.
- [ ] El cajero crea un viaje → nace `pending_approval` y aparece el mensaje de "pendiente".
- [ ] El viaje pendiente **no aparece en la app** y no se puede vender en caja.
- [ ] El admin lo ve en "Pendientes", con el nombre del cajero que lo creó.
- [ ] El admin aprueba → pasa a `active`, aparece en la app y se puede vender. `reviewedBy` muestra al admin.
- [ ] Otro viaje: el admin lo rechaza con motivo → pasa a `rejected` y el cajero ve el motivo en su listado.
- [ ] Aprobar o rechazar un viaje ya revisado → `400` con el mensaje "ya fue revisado".
- [ ] Un viaje pendiente cuya hora de salida ya pasó → aprobar da `400` y rechazar funciona.
- [ ] El cajero intenta crear otro viaje con el mismo bus y horario que un pendiente → `409`.
- [ ] El admin desactiva la opción → los pendientes existentes siguen pendientes y los nuevos nacen `active`.
- [ ] Rechazar un viaje → luego se puede eliminar el bus o la ruta, si no tiene otras salidas abiertas.
