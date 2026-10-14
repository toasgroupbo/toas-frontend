# 2FA obligatorio para editar usuarios y cambiar contraseñas (panel web)

Para **editar el perfil de un usuario** o **cambiarle la contraseña**, el usuario logueado que hace la acción tiene que tener activada la verificación en dos pasos (2FA). Si no la tiene, el backend responde `403` con `error: "TWO_FACTOR_REQUIRED"`.

> **Se revisa el 2FA de quien hace la acción, no el del usuario editado.** Un super-admin con 2FA puede editar a un cajero que no lo tiene. Un super-admin sin 2FA no puede editar a nadie, **ni a sí mismo**.
>
> El login, la activación del 2FA y "Olvidé mi contraseña" **no cambian**. Ver [2fa-google-authenticator.md](2fa-google-authenticator.md).

> ⚠️ **Actualización:** estos endpoints ahora también piden `currentPassword` (la contraseña de quien edita) y hay endpoints nuevos `/users/me` con la misma regla del 2FA. Donde este documento dice que el body no cambia, ya no es así. Ver [editar-perfil-y-contrasena.md](editar-perfil-y-contrasena.md).

---

## Resumen de lo que tiene que hacer el front

| # | Dónde | Qué |
|---|---|---|
| 1 | **Pantallas de edición de usuarios y de cambio de contraseña** | Si `user.isTwoFactorEnabled` es `false`, avisar antes de que el usuario llene el formulario e invitarlo a activar el 2FA. |
| 2 | **Llamadas a los 3 endpoints** | Manejar el `403` con `error: "TWO_FACTOR_REQUIRED"`: mostrar el mensaje y llevar a la sección de 2FA del perfil. **No** cerrar la sesión. |
| 3 | **Después de activar el 2FA** | Actualizar `isTwoFactorEnabled = true` en el estado. El cambio es inmediato, no hace falta volver a iniciar sesión. |

---

## 1. Endpoints afectados

Los tres ya existían. El body y la respuesta exitosa **no cambian**. Solo se agrega la condición del 2FA.

| Endpoint | Para qué se usa | Quién lo usa hoy |
|---|---|---|
| `PATCH /api/users/:id` | Editar un usuario (email, nombre, CI, teléfono, rol) | Super-admin, también para editar **su propio** perfil |
| `PATCH /api/users/cashiers/:id` | Editar un cajero de la empresa | Super-admin y admin de empresa |
| `PUT /api/users/:id` | Cambiar la contraseña de un usuario | Super-admin, también para cambiar **su propia** contraseña |

**No cambian:** `PATCH /api/users/:id/2fa/reset` (restablecer el 2FA de otro usuario), `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` ni ningún otro endpoint.

---

## 2. Error cuando el usuario no tiene 2FA

Status **`403 Forbidden`**:

```json
{
  "statusCode": 403,
  "error": "TWO_FACTOR_REQUIRED",
  "message": "You must enable two-factor authentication to perform this action"
}
```

- **Identificarlo por `error === "TWO_FACTOR_REQUIRED"`**, no por el texto de `message`. Los demás `403` (por ejemplo, falta de permisos) vienen con `error: "Forbidden"`.
- **No es un error de sesión.** El token sigue siendo válido, así que no hay que mandar al login.
- El backend revisa el 2FA **después** de revisar los permisos. Un usuario sin permiso recibe el `403` de permisos de siempre, aunque tampoco tenga 2FA.

Ejemplo de manejo:

```ts
try {
  await api.patch(`/users/${id}`, body);
} catch (err) {
  const data = err.response?.data;

  if (err.response?.status === 403 && data?.error === 'TWO_FACTOR_REQUIRED') {
    showModal({
      title: 'Activa la verificación en dos pasos',
      text: 'Para editar usuarios o cambiar contraseñas necesitas tener activada la verificación en dos pasos.',
      confirmText: 'Activar ahora',
      onConfirm: () => router.push('/perfil#2fa'),
    });
    return;
  }

  throw err;
}
```

---

## 3. Aviso preventivo (recomendado)

`user.isTwoFactorEnabled` ya viene en la respuesta del login (`POST /api/auth/login` y `POST /api/auth/login/2fa`). Se puede usar para avisar **antes** de que el usuario llene el formulario:

- En los botones **Editar** y **Cambiar contraseña**: si `isTwoFactorEnabled` es `false`, mostrarlos deshabilitados con un tooltip como "Activa la verificación en dos pasos para editar usuarios", o mostrar un banner arriba del formulario con un enlace al perfil.
- Esto **solo mejora la experiencia de usuario**. El backend valida de todas formas, así que el manejo del `403` del punto 2 sigue siendo necesario. Por ejemplo, el 2FA pudo haberse desactivado desde otra pestaña, o un admin pudo habérselo restablecido.

---

## 4. Después de activar o perder el 2FA

- **Activa el 2FA** (`POST /api/auth/2fa/enable` responde `200`): el backend lo toma en cuenta **en el siguiente request**, sin volver a iniciar sesión. El front solo tiene que poner `isTwoFactorEnabled = true` en su estado (ya lo indica la sección 2 de [2fa-google-authenticator.md](2fa-google-authenticator.md)).
- **Desactiva el 2FA** (`POST /api/auth/2fa/disable`) o **un admin se lo restablece** (`PATCH /api/users/:id/2fa/reset`): desde ese momento recibe el `403 TWO_FACTOR_REQUIRED` en los 3 endpoints. Conviene avisarlo en la confirmación de "Desactivar", por ejemplo: "Si la desactivas, no podrás editar usuarios ni cambiar contraseñas".

---

## Checklist de pruebas (front + back)

- [ ] Super-admin **sin** 2FA → `PATCH /api/users/:id` (a otro usuario) → `403 TWO_FACTOR_REQUIRED`; el front muestra el aviso y **no** cierra la sesión.
- [ ] Super-admin **sin** 2FA → `PATCH /api/users/:id` con **su propio** id → `403 TWO_FACTOR_REQUIRED`.
- [ ] Super-admin **sin** 2FA → `PUT /api/users/:id` → `403 TWO_FACTOR_REQUIRED`; la contraseña **no** cambia.
- [ ] Admin de empresa **sin** 2FA → `PATCH /api/users/cashiers/:id` → `403 TWO_FACTOR_REQUIRED`.
- [ ] Activar el 2FA desde el perfil y, sin volver a iniciar sesión, repetir los casos anteriores → `200`.
- [ ] Usuario **con** 2FA editando a un usuario **sin** 2FA → `200` (solo se revisa el 2FA de quien edita).
- [ ] Usuario **sin** permiso `UPDATE` sobre usuarios → sigue recibiendo el `403` de permisos (`error: "Forbidden"`), no el de 2FA.
- [ ] Desactivar el 2FA → los 3 endpoints vuelven a responder `403 TWO_FACTOR_REQUIRED`.
- [ ] "Olvidé mi contraseña" sigue funcionando para usuarios sin 2FA.
