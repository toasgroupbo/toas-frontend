# Recuperación de contraseña por correo (panel web)

Permite que un usuario del panel web (admin, owner, cajero) restablezca su contraseña si la olvidó. El backend le manda un correo con un link. Ese link abre una página del panel donde el usuario escribe la contraseña nueva.

> **Alcance:** solo usuarios del panel web, los que entran por `POST /api/auth/login`. **No** aplica a clientes de la app (`/api/auth/login/customer`).

---

## Resumen de lo que tiene que hacer el front

1. Agregar un link **"¿Olvidaste tu contraseña?"** en la pantalla de login, que lleve a una pantalla para pedir el correo.
2. **Pantalla "Olvidé mi contraseña":** formulario con el email que llama a `POST /api/auth/forgot-password`.
3. **Pantalla "Restablecer contraseña"** en la ruta **`/reset-password`**: lee `token` y `email` de la URL, pide la contraseña nueva y llama a `POST /api/auth/reset-password`.

> ⚠️ La ruta tiene que ser exactamente **`/reset-password`**: el backend arma el link del correo con esa ruta. Si necesitan otra, avisen al backend.

---

## Flujo completo

```
┌─ Login ─────────────┐
│ "¿Olvidaste tu      │
│  contraseña?"  ─────┼──► Pantalla "Olvidé mi contraseña"
└─────────────────────┘        │  POST /api/auth/forgot-password { email }
                               ▼
                     Mensaje: "Si el correo está registrado, te enviamos un link"
                               │
                     (el usuario abre su correo y toca el botón)
                               ▼
        https://<panel>/reset-password?token=abc123...&email=user%40gmail.com
                               │
                     Pantalla "Restablecer contraseña"
                               │  POST /api/auth/reset-password { email, token, newPassword }
                               ▼
                     Éxito → redirigir al login con mensaje "Contraseña actualizada"
```

---

## Endpoints

Base: todas las rutas llevan el prefijo **`/api`**. Ninguno de los dos endpoints necesita token (no se manda `Authorization`).

### 1. `POST /api/auth/forgot-password`

Pide el correo de recuperación.

**Body**

```json
{
  "email": "user@gmail.com"
}
```

| Campo | Tipo | Reglas |
|---|---|---|
| `email` | string | Obligatorio, formato de email válido |

**Respuesta `201`** (exista o no el email)

```json
{
  "message": "If that email exists, a reset link has been sent"
}
```

**Importante:**
- La respuesta es **siempre la misma**, exista o no el correo. Es a propósito: así nadie puede averiguar qué correos están registrados. El front **no** debe mostrar "correo no encontrado". Debe mostrar un mensaje neutro, por ejemplo:
  > "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa también la carpeta de spam."
- La respuesta llega antes de que salga el correo (el envío ocurre en segundo plano). Puede tardar unos segundos en llegar a la bandeja.
- Si el usuario pide el correo **varias veces**, **solo sirve el último link**: cada pedido invalida los anteriores. Conviene decirlo en la pantalla, o desactivar el botón unos segundos después de enviar, para evitar confusiones.

**Errores**

| Código | Cuándo |
|---|---|
| `400` | Email vacío o con formato inválido, o campos extra en el body (ver [Formato de errores](#formato-de-errores)) |

---

### 2. `POST /api/auth/reset-password`

Cambia la contraseña usando el token del link.

**Body**

```json
{
  "email": "user@gmail.com",
  "token": "3f9a1c...e07b",
  "newPassword": "nuevaClave123"
}
```

| Campo | Tipo | Reglas |
|---|---|---|
| `email` | string | Obligatorio, formato de email. Sale del parámetro `email` de la URL |
| `token` | string | Obligatorio. Sale del parámetro `token` de la URL (64 caracteres hexadecimales) |
| `newPassword` | string | Obligatorio, **entre 6 y 50 caracteres** |

**Respuesta `201`**

```json
{
  "message": "Password updated successfully"
}
```

**Errores**

| Código | `message` | Cuándo | Qué mostrar |
|---|---|---|---|
| `400` | `"Invalid or expired token"` | El link venció (más de 30 min), ya se usó, fue reemplazado por un pedido más nuevo, o el token/email no coinciden | "El enlace no es válido o ya venció. Solicita uno nuevo." + botón a la pantalla "Olvidé mi contraseña" |
| `400` | Array de mensajes de validación | `newPassword` con menos de 6 o más de 50 caracteres, email inválido, falta un campo o hay campos extra | Mostrar el error en el formulario. **Validar el largo también en el front** para no llegar a este caso |

---

## Pantalla "Restablecer contraseña" (`/reset-password`)

El link que llega en el correo tiene esta forma:

```
https://<url-del-panel>/reset-password?token=3f9a1c...e07b&email=user%40gmail.com
```

Al montar la pantalla:

1. Leer `token` y `email` de los query params. El `email` viene codificado (`%40` = `@`). Con `URLSearchParams` o el router se obtiene ya decodificado.
2. **Borrarlos de inmediato de la barra de direcciones** con `history.replaceState`, guardándolos solo en memoria. Ver [Proteger el token](#proteger-el-token-obligatorio).
3. Si falta alguno de los dos → mostrar "Enlace inválido" con un botón para pedir uno nuevo. No mostrar el formulario.
4. Mostrar el formulario con:
   - **Nueva contraseña** (mín. 6, máx. 50 caracteres)
   - **Confirmar contraseña**: solo se valida en el front, no se manda al backend.
5. Al enviar, mandar `{ email, token, newPassword }` a `POST /api/auth/reset-password`.

Ejemplo:

```ts
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const email = params.get('email');

// sacar el token de la URL apenas se lee (queda solo en memoria)
window.history.replaceState(null, '', '/reset-password');

if (!token || !email) {
  // mostrar "Enlace inválido" + botón "Solicitar nuevo enlace"
}

const res = await fetch(`${API_URL}/api/auth/reset-password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, token, newPassword }),
});

if (res.ok) {
  // redirigir a /login con mensaje "Contraseña actualizada, inicia sesión"
} else {
  const error = await res.json();
  // error.message puede ser string ("Invalid or expired token") o array (validación)
}
```

**Recomendaciones:**
- La pantalla tiene que ser **pública**: no debe exigir sesión ni redirigir al login si no hay token guardado.
- El link se puede usar **una sola vez**. Si el usuario vuelve atrás y reenvía el formulario, va a recibir `"Invalid or expired token"`.

### Proteger el token (obligatorio)

El token del link funciona como una contraseña temporal: quien lo tenga puede cambiar la contraseña del usuario durante 30 minutos. Como viaja en la URL, la página tiene que evitar que se filtre:

1. **No mandar la URL a otros sitios.** Si la página carga scripts, fuentes o imágenes externas (analytics, Google Fonts, CDNs), el navegador les envía la URL completa en el header `Referer`, **con el token incluido**. Para evitarlo, agregar en esta página:
   ```html
   <meta name="referrer" content="no-referrer" />
   ```
   O configurar el header `Referrer-Policy: no-referrer` para la ruta `/reset-password`.
2. **Sacar el token de la barra de direcciones** apenas se lee, con `window.history.replaceState(null, '', '/reset-password')`, como en el ejemplo de arriba. Así no queda en el historial del navegador, en marcadores ni en capturas de pantalla.
3. **No guardar el token** en `localStorage`, `sessionStorage` ni cookies, y no mandarlo a analytics, Sentry ni logs. Mantenerlo solo en el estado del componente.
4. **Ojo con las herramientas de analytics** (Google Analytics, Hotjar, etc.) que registran la URL de cada página: no deben capturar `/reset-password` con sus parámetros. Si se borran con el paso 2 antes de que cargue el analytics, alcanza.

---

## Qué pasa después de cambiar la contraseña

- **Se cierran todas las sesiones de ese usuario.** Cualquier navegador o dispositivo donde estuviera logueado empieza a recibir `401` con el mensaje:
  ```
  "Session expired. You are logged in on another device."
  ```
  Es el mismo error que ya existe cuando alguien inicia sesión en otro dispositivo. Si el front ya lo maneja (redirigir al login), no hay que hacer nada nuevo.
- El backend **no** devuelve un token nuevo: después del éxito, el usuario tiene que hacer login normal con la contraseña nueva (`POST /api/auth/login`).
- Si el usuario tenía **2FA activo**, lo sigue teniendo: el login le va a pedir el código de Google Authenticator. Ver [2fa-google-authenticator.md](2fa-google-authenticator.md).

---

## Formato de errores

Es el formato estándar de NestJS.

Error de negocio (`message` es un string):

```json
{
  "statusCode": 400,
  "message": "Invalid or expired token",
  "error": "Bad Request"
}
```

Error de validación (`message` es un **array**):

```json
{
  "statusCode": 400,
  "message": [
    "newPassword must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

> El backend rechaza campos que no estén documentados (por ejemplo, mandar `confirmPassword` devuelve `400 "property confirmPassword should not exist"`). Manden solo los campos de las tablas.

---

## Datos útiles

| Dato | Valor |
|---|---|
| Duración del link | 30 minutos |
| Usos por link | 1 |
| Links válidos a la vez por usuario | 1 (el último pedido) |
| Largo de contraseña | 6 a 50 caracteres |
| Asunto del correo | "Recuperación de contraseña" |
| Remitente | El mismo de los correos de confirmación de pago |

---

## Checklist de pruebas (front + back)

- [ ] Pedir recuperación con un email registrado → llega el correo con el botón.
- [ ] Pedir recuperación con un email **no** registrado → la pantalla muestra el mismo mensaje neutro y no llega ningún correo.
- [ ] Abrir el link → se abre `/reset-password` sin pedir login, con el formulario.
- [ ] Contraseñas que no coinciden o de menos de 6 caracteres → el front lo bloquea antes de llamar al backend.
- [ ] Cambiar la contraseña → mensaje de éxito y redirección al login.
- [ ] Login con la contraseña nueva → funciona. Con la vieja → falla.
- [ ] Una sesión abierta en otra pestaña o dispositivo → recibe `401` y vuelve al login.
- [ ] Volver a usar el mismo link → "El enlace no es válido o ya venció".
- [ ] Pedir dos correos seguidos y usar el **primero** → falla. El segundo funciona.
- [ ] Abrir `/reset-password` sin `token` o sin `email` → "Enlace inválido".
- [ ] Al abrir el link, la barra de direcciones queda en `/reset-password`, sin `?token=...`.
- [ ] En DevTools → Network, ningún request a un dominio externo lleva el token en el header `Referer`.
