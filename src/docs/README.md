# Documentación para el frontend

Cambios de la API que el front tiene que implementar o tener en cuenta.

| Funcionalidad | Estado backend | Documento |
|---|---|---|
| Recuperación de contraseña por correo (panel web) | ✅ Listo | [recuperar-contrasena.md](recuperar-contrasena.md) |
| Autenticación en dos pasos con Google Authenticator (panel web) | ✅ Listo | [2fa-google-authenticator.md](2fa-google-authenticator.md) |
| Comprobantes de pago con los datos del beneficiario al momento del pago (fix) | ✅ Listo | [comprobantes-pago.md](comprobantes-pago.md) |
| Datos históricos de tickets y viajes: dueño, facturación, pasajeros, oficinas (fix) | ✅ Listo | [historicos-tickets-viajes.md](historicos-tickets-viajes.md) |
| Aprobación de viajes creados por cajeros (opcional por empresa, panel admin) | ✅ Listo | [aprobacion-viajes.md](aprobacion-viajes.md) |

## ⚠️ Cambios en endpoints que ya existían

Estos endpoints ya los usa el front y **cambiaron su comportamiento**. Revisar antes de desplegar.

### 1. `POST /api/auth/login`: nueva respuesta para usuarios con 2FA

Para usuarios con 2FA activo, la respuesta ya no trae `{ user, token }` sino `{ twoFactorRequired: true, tempToken }`. Ver la sección 1 de [2fa-google-authenticator.md](2fa-google-authenticator.md). Para los demás usuarios el login no cambia; solo se agrega `user.isTwoFactorEnabled`.

### 2. `PUT /api/users/:id` (admin cambia la contraseña de un usuario)

El body sigue igual (`{ "password": "..." }`). Cambian dos cosas:

**a) La respuesta ya no devuelve el usuario.** Antes devolvía el objeto del usuario, incluido el hash de la contraseña, que nunca debió exponerse. Ahora devuelve solo:

```json
{ "message": "Password updated successfully" }
```

Si la pantalla usaba algún dato de esa respuesta (por ejemplo, para refrescar el usuario en la tabla), tiene que dejar de hacerlo. Si necesita los datos actualizados, que los pida con `GET /api/users/:id`.

**b) Se cierran todas las sesiones del usuario al que se le cambió la contraseña.** Si estaba logueado en algún navegador o dispositivo, su próximo request recibe `401 "Session expired. You are logged in on another device."` y tiene que volver a entrar con la contraseña nueva.

> ⚠️ Si un admin usa este endpoint para cambiar **su propia** contraseña, también se cierra **su** sesión: el request responde `200`, pero el siguiente ya da `401`. El front debería, después del éxito, mandarlo al login con un mensaje tipo "Contraseña actualizada, vuelve a iniciar sesión".

### 3. `GET /api/transactions/travels`: comprobantes de viajes pagados

La respuesta agrega `travel.transaction.beneficiarySnapshot` y `travel.owner` (con `bankAccount`), y no quita nada. Ninguna pantalla debe usar más `travel.bus.owner.bankAccount`:
- el comprobante de un viaje **pagado** usa `beneficiarySnapshot`;
- un viaje **no pagado** (a quién se le va a pagar) usa `travel.owner.bankAccount`.

Ver [comprobantes-pago.md](comprobantes-pago.md).

### 4. Tickets y viajes: campos nuevos con datos históricos

Todas las respuestas que devuelven tickets agregan `billingSnapshot`, `travelSnapshot` y `passenger` dentro de cada `seats[]`. Las que devuelven viajes agregan `owner`. No se quita nada. Ver [historicos-tickets-viajes.md](historicos-tickets-viajes.md).

### 5. `DELETE /api/customers/:id`: anonimiza al cliente

- **La respuesta cambió:** antes devolvía el cliente completo en `deleted`; ahora devuelve solo `{ "message": "Customer deleted successfully", "deleted": { "id": 12 } }`.
- Al borrar, se eliminan los datos personales del cliente (email, teléfono, CI, nombre → "Cliente eliminado"). Si esa persona vuelve a entrar con Google o Apple, se le crea una **cuenta nueva**, sin su historial ni su saldo anterior. Antes, ese segundo ingreso fallaba con un error 500.
- Sus tickets siguen existiendo, pero ya no tienen comprador asociado (`buyer: null`). Para mostrar a quién pertenecían, usar `billingSnapshot` y `seats[].passenger`.

### 6. `POST /api/mails`: eliminado

Era un endpoint de prueba, público, que mandaba un correo con datos fijos. Si alguna pantalla lo llamaba, ahora recibe `404`. Los correos reales (confirmación de pago, recuperación de contraseña) no cambian.

### 7. Viajes: estados nuevos `pending_approval` y `rejected`

`travel_status` puede venir con dos valores nuevos. Solo aparecen si la empresa activa la aprobación de viajes, que viene desactivada por defecto. Afecta a:
- `GET /api/travels` (admin): sin `status`, incluye pendientes y rechazados. Cada viaje agrega `createdBy`, `reviewedBy`, `reviewedAt` y `rejection_reason`.
- `GET /api/travels/for-cashier/all` (cajero): sin `status`, ahora incluye pendientes y rechazados de la oficina, en los que no se puede vender.
- `POST /api/travels/for-cashier`: el viaje creado puede volver con `travel_status: "pending_approval"`.

Revisar los mapas de etiquetas y colores de estado. Ver [aprobacion-viajes.md](aprobacion-viajes.md).

## Convenciones generales de la API

- Todas las rutas llevan el prefijo **`/api`** (ej. `POST /api/auth/login`).
- La documentación interactiva (Swagger) está en el mismo servidor del backend.
- Los errores siguen el formato estándar de NestJS: `{ statusCode, message, error }`, donde `message` es un string, o un array de strings si es un error de validación.
- El backend **rechaza campos extra** en el body (`400 "property X should not exist"`): manden solo los campos documentados.
