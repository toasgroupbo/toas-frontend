# Autenticación en dos pasos (2FA) con Google Authenticator (panel web)

Los usuarios del panel web (admin, owner, cajero) pueden activar un segundo paso en el login. Después de la contraseña, se les pide un código de 6 dígitos que genera la app **Google Authenticator** en su celular. También sirven Microsoft Authenticator, Authy o 1Password, porque todas usan el mismo estándar (TOTP).

> **Alcance:** solo usuarios del panel web (`POST /api/auth/login`). **No** aplica a clientes de la app (`/api/auth/login/customer`).
>
> **Es opcional:** cada usuario decide si lo activa desde su perfil. Si no lo activa, su login funciona exactamente igual que hoy.

---

## Resumen de lo que tiene que hacer el front

| # | Dónde | Qué |
|---|---|---|
| 1 | **Login** | Manejar la nueva respuesta `{ twoFactorRequired: true, tempToken }` y mostrar una pantalla para ingresar el código. |
| 2 | **Perfil del usuario** | Sección "Verificación en dos pasos" con los botones **Activar** (pide la contraseña, muestra el QR y pide un código) y **Desactivar** (pide un código). |
| 3 | **Gestión de usuarios (admin)** | Botón **"Restablecer 2FA"** para el usuario que perdió el celular. |

---

## 1. Cambios en el login

### `POST /api/auth/login` (ya existe; cambia la respuesta)

El body es el mismo de siempre. La respuesta ahora puede tener **dos formas**:

**a) Usuario sin 2FA**: igual que hoy, con un campo nuevo dentro de `user`:

```json
{
  "user": {
    "id": 12,
    "email": "cajero@mail.com",
    "fullName": "Juan Pérez",
    "isTwoFactorEnabled": false,
    "...": "resto de campos igual que antes"
  },
  "token": "eyJhbGciOi..."
}
```

**b) Usuario con 2FA activo**: **no** devuelve `user` ni `token`:

```json
{
  "twoFactorRequired": true,
  "tempToken": "eyJhbGciOi..."
}
```

- El `tempToken` **no es un token de sesión**: si se manda en `Authorization`, el backend responde `401`. Solo sirve para el siguiente paso.
- **Vence en 5 minutos.** Si vence, el usuario tiene que volver a poner su contraseña.
- Guardarlo solo en memoria (estado del componente o store), **no** en `localStorage`.

Ejemplo de manejo:

```ts
type LoginResponse =
  | { user: User; token: string }
  | { twoFactorRequired: true; tempToken: string };

const data: LoginResponse = await login(email, password);

if ('twoFactorRequired' in data) {
  // ir a la pantalla "Ingresa el código de Google Authenticator"
  // y guardar data.tempToken en memoria
} else {
  // login normal, como hoy
  saveSession(data.token, data.user);
}
```

### `POST /api/auth/login/2fa` (nuevo, público)

Segundo paso del login.

**Body**

```json
{
  "tempToken": "eyJhbGciOi...",
  "code": "482913"
}
```

| Campo | Tipo | Reglas |
|---|---|---|
| `tempToken` | string | El que devolvió `POST /api/auth/login` |
| `code` | **string** | Exactamente 6 dígitos. **Mandarlo como string**: un código puede empezar con `0` (`"052114"`) |

**Respuesta `201`**: **idéntica al login normal**. Se guarda la sesión igual que hoy.

```json
{
  "user": { "id": 12, "email": "cajero@mail.com", "isTwoFactorEnabled": true, "...": "..." },
  "token": "eyJhbGciOi..."
}
```

**Errores**

| Código | `message` | Cuándo | Qué hacer en el front |
|---|---|---|---|
| `401` | `"Invalid 2FA code"` | Código incorrecto o ya vencido | "Código incorrecto". Dejar reintentar sin volver a pedir la contraseña |
| `401` | `"Invalid or expired token"` | Pasaron más de 5 min desde el login, o el `tempToken` no es válido | "La verificación expiró" → volver a la pantalla de login |
| `429` | `"ThrottlerException: Too Many Requests"` | **Más de 5 intentos en 1 minuto** desde la misma IP | "Demasiados intentos, espera un minuto". Desactivar el botón ~60 s |
| `400` | Array de validación | `code` no tiene 6 dígitos o falta un campo | Validar en el front antes de enviar |
| `400` | `"2FA is not enabled for this user"` | Un admin le reseteó el 2FA entre el paso 1 y el 2 | Volver al login. Ahora entra sin código |

> ⚠️ Ojo con los interceptores de `401`: si el front cierra sesión o redirige ante cualquier `401`, hay que **excluir `/auth/login/2fa`**. En esta pantalla todavía no hay sesión y un `401` solo significa "código incorrecto" o "verificación expirada".

**Recomendaciones para la pantalla del código:**
- Un input numérico de 6 dígitos (`inputmode="numeric"`, `autocomplete="one-time-code"`), con envío automático al completar los 6 dígitos.
- Texto de ayuda: "Abre Google Authenticator e ingresa el código de 6 dígitos de *Bus Express*".
- Un link "Volver al login".

---

## 2. Activar y desactivar desde el perfil

Los tres endpoints **requieren sesión**: `Authorization: Bearer <token>`. Cualquier usuario logueado puede usarlos sobre **su propia cuenta**. No hace falta ningún permiso especial.

Para saber si mostrar "Activar" o "Desactivar", usar `user.isTwoFactorEnabled`, que viene en la respuesta del login.

### Flujo de activación

```
[Activar] ──► Pedir la contraseña actual
                 │
                 ▼
          POST /api/auth/2fa/generate { password }
                 │  devuelve { qrCode, secret, otpauthUrl }
                 ▼
     Mostrar QR (+ clave manual) y pedir el primer código
                 │
                 ▼
          POST /api/auth/2fa/enable { code }
                 │
                 ▼
     ✅ Activado → actualizar isTwoFactorEnabled = true en el estado
```

#### `POST /api/auth/2fa/generate`

Pide la **contraseña actual** del usuario. Así, alguien que encuentre una sesión abierta (por ejemplo, en una PC compartida) no puede activar el 2FA con su propio celular y dejar al dueño afuera de la cuenta.

**Body**

```json
{ "password": "miClaveActual" }
```

| Campo | Tipo | Reglas |
|---|---|---|
| `password` | string | Obligatorio. La contraseña con la que el usuario inicia sesión |

En la UI: al tocar **Activar**, mostrar primero un paso "Confirma tu contraseña para continuar", y recién después el QR.

**Respuesta `201`**

```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "secret": "AAZUGRDBGEEDYMLEOUQCUODMNRLBW4QZ",
  "otpauthUrl": "otpauth://totp/Bus%20Express:cajero%40mail.com?secret=AAZU...&issuer=Bus%20Express"
}
```

| Campo | Uso en el front |
|---|---|
| `qrCode` | Imagen lista para mostrar: `<img src={qrCode} />` |
| `secret` | Clave para cargar **a mano** si no se puede escanear el QR (en la app: "Ingresar clave de configuración"). Conviene mostrarla en grupos de 4 (`AAZU GRDB GEEJ ...`) |
| `otpauthUrl` | Opcional. En celular se puede usar como link para abrir la app de autenticación directamente |

- **Todavía no activa nada.** Si el usuario cierra la pantalla sin confirmar, su login sigue igual.
- Se puede llamar de nuevo para generar otro QR mientras no se haya activado. **El QR anterior deja de servir.**
- No guardar `secret` ni `qrCode` en ningún lado: se muestran una vez y se descartan.

**Errores**

Todos los errores son `400`; a propósito **no** son `401`, para que el interceptor no cierre la sesión:

| `message` | Cuándo | Qué mostrar |
|---|---|---|
| `"Invalid password"` | La contraseña no es correcta | "Contraseña incorrecta" en el paso de confirmación |
| `"2FA is already enabled. Disable it before generating a new secret"` | El usuario ya tiene 2FA activo | Refrescar el estado (mostrar "Desactivar") |
| Array de validación | Falta `password` | Validar en el front |

#### `POST /api/auth/2fa/enable`

**Body**

```json
{ "code": "482913" }
```

**Respuesta `201`**

```json
{ "message": "2FA enabled successfully" }
```

**Errores** (todos `400`; a propósito **no** son `401`, para que el interceptor no cierre la sesión):

| `message` | Cuándo | Qué mostrar |
|---|---|---|
| `"Invalid 2FA code"` | Código incorrecto | "El código no coincide. Revisa que escaneaste el QR más reciente y que la hora del celular esté en automático" |
| `"Generate a 2FA secret first"` | No se llamó antes a `generate` | Volver a llamar a `generate` |
| `"2FA is already enabled"` | Ya estaba activo | Refrescar el estado |
| Array de validación | `code` no tiene 6 dígitos | Validar en el front |

**Texto sugerido para la pantalla de activación:**
> 1. Instala **Google Authenticator** (o Microsoft Authenticator) en tu celular.
> 2. Toca **"+"** → **"Escanear código QR"** y escanea este código.
>    ¿No puedes escanearlo? Elige "Ingresar clave de configuración" y escribe: `AAZU GRDB ...`
> 3. Escribe el código de 6 dígitos que aparece en la app.

#### `POST /api/auth/2fa/disable`

Pide el código actual, no solo la sesión. Así nadie puede desactivarlo desde una sesión que el usuario dejó abierta en otra computadora.

**Body**

```json
{ "code": "482913" }
```

**Respuesta `201`**

```json
{ "message": "2FA disabled successfully" }
```

**Errores** (todos `400`):

| `message` | Cuándo |
|---|---|
| `"Invalid 2FA code"` | Código incorrecto |
| `"2FA is not enabled"` | No estaba activo |

Después de desactivarlo, el usuario puede borrar la cuenta "Bus Express" de su app de autenticación, porque ya no sirve. Si lo vuelve a activar, se genera un QR nuevo.

---

## 3. Restablecer 2FA (admin), para quien perdió el celular

Si un usuario pierde el celular o borra la app, no puede generar códigos y no puede entrar. Un administrador le desactiva el 2FA y el usuario lo vuelve a configurar después.

### `PATCH /api/users/:id/2fa/reset`

- Requiere sesión y el permiso **`UPDATE` sobre el recurso `USER`** (el mismo que se usa para editar usuarios).
- Sin body.

**Respuesta `200`**

```json
{ "message": "2FA reset successfully" }
```

**Errores**

| Código | Cuándo |
|---|---|
| `403` | El admin no tiene permiso `UPDATE` sobre usuarios |
| `404` | El usuario no existe |

**Sugerencia de UI:** en la tabla o el detalle de usuarios, mostrar el botón solo si `isTwoFactorEnabled` es `true`, con una confirmación del tipo: "¿Desactivar la verificación en dos pasos de Juan Pérez? Podrá entrar solo con su contraseña hasta que la vuelva a activar".

---

## Relación con "Olvidé mi contraseña"

Recuperar la contraseña **no** desactiva el 2FA. Después del reseteo, el usuario entra con la contraseña nueva **y** su código de Google Authenticator. Si además perdió el celular, necesita que un admin le restablezca el 2FA (sección 3).

---

## Datos útiles

| Dato | Valor |
|---|---|
| Largo del código | 6 dígitos (enviar como string) |
| Cada código cambia cada | 30 segundos |
| Tolerancia de reloj | ±30 s (acepta el código anterior y el siguiente) |
| Vida del `tempToken` | 5 minutos |
| Límite en `login/2fa` | 5 intentos por minuto por IP (`429` al pasarse) |
| Nombre que aparece en la app | **Bus Express** (cajero@mail.com) |

---

## Checklist de pruebas (front + back)

**Activación**
- [ ] Usuario sin 2FA → el login funciona igual que antes y `user.isTwoFactorEnabled` es `false`.
- [ ] Perfil → Activar → pide la contraseña. Con una contraseña incorrecta → "Contraseña incorrecta" **sin** cerrar la sesión.
- [ ] Con la contraseña correcta → se ve el QR y la clave manual. Escanear con Google Authenticator → aparece "Bus Express".
- [ ] Ingresar un código incorrecto → mensaje de error **sin** cerrar la sesión.
- [ ] Ingresar el código correcto → queda activado y el perfil muestra "Desactivar".
- [ ] Generar el QR dos veces y escanear el **primero** → `enable` falla. Con el segundo funciona.

**Login con 2FA**
- [ ] Login con contraseña → aparece la pantalla del código (no entra directo).
- [ ] Código correcto → entra normalmente.
- [ ] Código incorrecto → "Código incorrecto" y deja reintentar.
- [ ] 6 intentos fallidos seguidos → el sexto da `429` y se muestra el mensaje de espera.
- [ ] Esperar más de 5 min en la pantalla del código → "La verificación expiró" y vuelve al login.
- [ ] Un código que empieza con `0` funciona (se manda como string).

**Desactivar / reset**
- [ ] Perfil → Desactivar con el código correcto → el próximo login ya no pide código.
- [ ] Admin → "Restablecer 2FA" sobre un usuario → ese usuario entra solo con la contraseña.
- [ ] "Olvidé mi contraseña" sobre un usuario con 2FA → después del reseteo, el login sigue pidiendo el código.
