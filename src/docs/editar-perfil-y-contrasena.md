# Editar perfil y contraseña: "Mi perfil" + confirmación con contraseña (panel web)

Dos cambios:

1. **Endpoints nuevos `/users/me`** para que **cualquier usuario del panel** (super-admin, admin de empresa, owner, cajeros) edite sus propios datos y cambie su propia contraseña.
2. **Todas las ediciones de perfil y de contraseña piden la contraseña de quien hace la acción** en el campo `currentPassword`. Esto también aplica a los endpoints que ya existían (`PATCH /users/:id`, `PUT /users/:id`, `PATCH /users/cashiers/:id`).

> Sigue valiendo la regla del 2FA: quien hace la acción tiene que tener la verificación en dos pasos **activada**. Si no la tiene, recibe `403 TWO_FACTOR_REQUIRED` (ver [2fa-obligatorio-editar-usuarios.md](2fa-obligatorio-editar-usuarios.md)). **No** se pide el código de 6 dígitos: alcanza con la contraseña.

---

## Resumen de lo que tiene que hacer el front

| # | Dónde | Qué |
|---|---|---|
| 1 | **Pantalla "Mi perfil"** (todos los usuarios) | Formulario de nombre, CI y teléfono + campo "Tu contraseña" → `PATCH /api/users/me`. El email se muestra pero **no se puede editar**. |
| 2 | **Pantalla "Cambiar mi contraseña"** (todos los usuarios) | Contraseña actual + nueva → `PATCH /api/users/me/password`. Al terminar, mandar al login. |
| 3 | **Formularios de admin que editan usuarios, cajeros o contraseñas** | Agregar el campo "Tu contraseña" y mandarlo como `currentPassword`. **Sin este campo, el backend responde `400`.** |
| 4 | **Manejo de errores** | `400` con `error: "INVALID_PASSWORD"` → marcar el campo de contraseña. **No** cerrar la sesión. |
| 5 | **Super-admin** | Para editar **su propio** perfil o contraseña, usar los endpoints `/me` en lugar de `/users/:id`. |

---

## 1. Endpoints nuevos

### `PATCH /api/users/me`: editar mi perfil

- **Quién:** cualquier usuario logueado en el panel, con 2FA activo.
- **No hace falta mandar un id:** el backend usa el usuario del token.
- **Campos editables:** `fullName`, `ci`, `phone`. Todos son opcionales: se manda solo lo que cambió.
- **No se puede cambiar:** `email`, rol, empresa ni oficina. Si se manda `email`, responde `400 "property email should not exist"`. El email solo lo cambia el super-admin con `PATCH /api/users/:id`.

Request:

```json
{
  "fullName": "Juan Pérez",
  "phone": "76565243",
  "currentPassword": "mi-contraseña"
}
```

Response `200`: el usuario actualizado, con la misma forma que `GET /api/users/:id`.

```json
{
  "id": 7,
  "email": "juan@empresa.com",
  "fullName": "Juan Pérez",
  "ci": "11726358",
  "phone": "76565243",
  "isTwoFactorEnabled": true,
  "enabled": true,
  "createdAt": "2026-09-01T14:00:00.000Z",
  "rol": { "id": 3, "name": "CASHIER", "...": "..." },
  "office": { "...": "..." },
  "company": { "...": "..." }
}
```

Después del `200`, actualizar los datos del usuario en el estado (nombre en el header, etc.).

### `PATCH /api/users/me/password`: cambiar mi contraseña

- **Quién:** cualquier usuario logueado en el panel, con 2FA activo.
- `newPassword`: entre 6 y 50 caracteres.

Request:

```json
{
  "currentPassword": "mi-contraseña",
  "newPassword": "mi-contraseña-nueva"
}
```

Response `200`:

```json
{ "message": "Password updated successfully" }
```

> ⚠️ **Se cierran todas las sesiones del usuario, incluida la actual.** El request responde `200`, pero el siguiente ya da `401`. Después del éxito, el front tiene que borrar el token y mandar al login con un mensaje tipo "Contraseña actualizada, vuelve a iniciar sesión".

---

## 2. Endpoints que ya existían: ahora piden `currentPassword`

`currentPassword` es la contraseña **del usuario logueado que hace la acción** (el admin), **no** la del usuario que se edita. Es obligatorio. El resto del body y la respuesta exitosa no cambian.

| Endpoint | Quién | Body |
|---|---|---|
| `PATCH /api/users/:id` | Super-admin | Igual que antes (`email`, `fullName`, `ci`, `phone`, `rol`, todos opcionales) **+ `currentPassword`** |
| `PUT /api/users/:id` | Super-admin | `{ "password": "...", "currentPassword": "..." }` |
| `PATCH /api/users/cashiers/:id` | Super-admin y admin de empresa | Igual que antes **+ `currentPassword`** |

Ejemplo, el super-admin le cambia la contraseña a un cajero:

```json
// PUT /api/users/15
{
  "password": "nueva-del-cajero",
  "currentPassword": "contraseña-del-super-admin"
}
```

- Si falta `currentPassword` → `400` de validación, con `message` como array: `["currentPassword should not be empty", "currentPassword must be a string"]`.
- `PUT /api/users/:id` sigue cerrando todas las sesiones del usuario editado.
- **No cambian:** `PATCH /api/users/:id/2fa/reset`, `PUT /api/cashiers/office/:id`, "Olvidé mi contraseña" (`POST /api/auth/forgot-password` y `POST /api/auth/reset-password`) ni el login.

---

## 3. Errores

### Contraseña incorrecta: `400 INVALID_PASSWORD`

```json
{
  "statusCode": 400,
  "error": "INVALID_PASSWORD",
  "message": "Current password is incorrect"
}
```

- **Identificarlo por `error === "INVALID_PASSWORD"`**, no por el texto de `message`.
- **No es un error de sesión:** el token sigue siendo válido. **No** cerrar la sesión ni mandar al login.
- No se guardó nada: el usuario puede corregir la contraseña y volver a enviar el mismo formulario.

### Resto de errores

| Status | `error` | Cuándo |
|---|---|---|
| `400` | `Bad Request` | Falta `currentPassword`, `newPassword` tiene menos de 6 caracteres, o se mandó un campo no permitido (por ejemplo, `email` en `/me`). `message` es un array. |
| `403` | `TWO_FACTOR_REQUIRED` | Quien hace la acción no tiene el 2FA activo. Se revisa **antes** de la contraseña. |
| `403` | `Forbidden` | Sin permiso para editar usuarios o cajeros (solo en los endpoints de admin). |
| `404` | `Not Found` | El usuario o cajero a editar no existe o está deshabilitado. |
| `409` | `Conflict` | El email ya lo usa otro usuario, o no se puede asignar ese rol (sin cambios respecto a antes). |

Ejemplo de manejo:

```ts
try {
  await api.patch('/users/me', { ...form, currentPassword });
} catch (err) {
  const data = err.response?.data;

  if (err.response?.status === 400 && data?.error === 'INVALID_PASSWORD') {
    setFieldError('currentPassword', 'La contraseña no es correcta');
    return;
  }

  if (err.response?.status === 403 && data?.error === 'TWO_FACTOR_REQUIRED') {
    // ver 2fa-obligatorio-editar-usuarios.md
    return;
  }

  throw err;
}
```

---

## 4. Sugerencias de UI

- **Campo "Tu contraseña"** al final de cada formulario de edición, justo antes del botón Guardar. En los formularios de admin, aclarar que es **su** contraseña, por ejemplo: "Ingresa tu contraseña para confirmar los cambios". Si no, el admin puede creer que tiene que poner la del usuario que está editando.
- Otra opción: un modal de confirmación que pida la contraseña al apretar Guardar. El body es el mismo.
- **Limpiar el campo** después de cada envío, tanto si salió bien como si falló.
- **"Mi perfil"**: mostrar el email como solo lectura, con un texto tipo "Para cambiar el email, contacta a un administrador".
- **"Cambiar mi contraseña"**: pedir la nueva contraseña dos veces y comparar en el front. El backend solo recibe `newPassword`.
- Si `user.isTwoFactorEnabled` es `false`, deshabilitar los formularios y mostrar un enlace para activar el 2FA, como ya se hace en las pantallas de admin.

---

## Checklist de pruebas (front + back)

**Mi perfil**

- [ ] Cajero con 2FA → `PATCH /api/users/me` con su contraseña correcta → `200`, cambian nombre/CI/teléfono.
- [ ] Mismo request con la contraseña incorrecta → `400 INVALID_PASSWORD`; no cambia nada y **no** se cierra la sesión.
- [ ] Sin `currentPassword` → `400` de validación.
- [ ] Mandando `email` → `400 "property email should not exist"`.
- [ ] Usuario **sin** 2FA → `403 TWO_FACTOR_REQUIRED`.
- [ ] Admin de empresa y super-admin también pueden usar `/me`.

**Mi contraseña**

- [ ] `PATCH /api/users/me/password` con la contraseña actual correcta → `200`; el siguiente request da `401` y el front manda al login.
- [ ] Entrar con la contraseña nueva funciona; con la vieja, no.
- [ ] Con la contraseña actual incorrecta → `400 INVALID_PASSWORD`; la contraseña no cambia.
- [ ] `newPassword` de menos de 6 caracteres → `400` de validación.

**Endpoints de admin**

- [ ] Super-admin → `PATCH /api/users/:id` con **su** contraseña → `200` (también puede cambiar el email).
- [ ] Super-admin → `PATCH /api/users/:id` con la contraseña **del usuario editado** → `400 INVALID_PASSWORD`.
- [ ] Super-admin → `PUT /api/users/:id` con `password` + `currentPassword` → `200`; el usuario editado pierde la sesión.
- [ ] Admin de empresa → `PATCH /api/users/cashiers/:id` con su contraseña → `200`; incorrecta → `400 INVALID_PASSWORD`.
- [ ] Cualquiera de los 3 sin `currentPassword` → `400`.
- [ ] "Olvidé mi contraseña" sigue funcionando sin pedir contraseña actual.
