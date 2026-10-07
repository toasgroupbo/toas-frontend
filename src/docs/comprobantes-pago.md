# Comprobantes de pago: datos del beneficiario

## El problema que se corrigió

Hasta ahora, el comprobante de un viaje pagado se armaba con `travel.bus.owner.bankAccount`. Esa es la cuenta bancaria **actual** del dueño del bus, no la que se usó al momento del pago. Por eso, si alguien editaba la cuenta, o cambiaba el nombre del dueño o el dueño del bus, **todos los comprobantes viejos cambiaban** y mostraban datos que no eran los del pago real.

Ahora cada pago guarda una **foto** del beneficiario (dueño + cuenta) tal como estaba cuando se le mandó al banco. Esa foto no cambia nunca.

---

## Qué tiene que cambiar en el front

| Caso | De dónde sacar el beneficiario |
|---|---|
| **Viaje pagado** (`travel.isPaid === true`): comprobante | **`travel.transaction.beneficiarySnapshot`** (nuevo) |
| **Viaje no pagado**: a quién se le va a pagar | **`travel.owner.bankAccount`** (nuevo; antes era `travel.bus.owner.bankAccount`) |

> ⚠️ Ninguna de las dos pantallas debe usar más `travel.bus.owner.bankAccount`: es la cuenta del dueño **actual** del bus, que puede no ser el dueño del viaje. Ver [historicos-tickets-viajes.md](historicos-tickets-viajes.md#1-dueño-del-viaje-travelowner).

---

## El campo nuevo

Endpoint: `GET /api/transactions/travels` (sin cambios en parámetros). Cada viaje trae `transaction` como antes, con un campo más:

```json
{
  "id": 152,
  "isPaid": true,
  "paidAt": "2026-09-30T14:22:10.000Z",
  "transaction": {
    "id": 88,
    "status": "COMPLETED",
    "totalAmount": "1250.00",
    "...": "resto de campos igual que antes",
    "beneficiarySnapshot": {
      "ownerId": 7,
      "ownerName": "Juan Pérez",
      "bankCode": "1016",
      "account": "1234567890",
      "titularName": "Juan Pérez Gómez",
      "documentType": "Q",
      "documentNumber": "6543210",
      "documentExtension": "SC",
      "branchOfficeId": 701
    }
  },
  "owner": {
    "name": "Juan Pérez",
    "bankAccount": { "...": "cuenta ACTUAL del dueño del viaje: usar solo en viajes NO pagados" }
  }
}
```

El campo también aparece en todas las respuestas que devuelven la `transaction`: `POST /api/transactions/process/:travelId`, `POST /api/transactions/verify/:transactionId` y el listado de viajes del cajero.

### Campos

Los códigos son **los mismos** que ya usa `bankAccount`, así que se pueden reutilizar los mapeos que ya tenga el front (código de banco → nombre, tipo de documento, departamento).

| Campo | Tipo | Equivale a | Puede ser `null` |
|---|---|---|---|
| `ownerId` | number | `bus.owner.id` | Sí, en pagos históricos |
| `ownerName` | string | `bus.owner.name` | Sí, en pagos históricos (raro) |
| `bankCode` | string | `bankAccount.bankCode` (ej. `"1005"` = BCP) | Sí, en pagos históricos (raro) |
| `account` | string | `bankAccount.account` | No |
| `titularName` | string | `bankAccount.titularName` | Sí, en pagos históricos a cuentas **BCP** |
| `documentType` | string | `bankAccount.documentType` | No |
| `documentNumber` | string | `bankAccount.documentNumber` | No |
| `documentExtension` | string | `bankAccount.documentExtension` | No |
| `branchOfficeId` | number | `bankAccount.branchOfficeId` | Sí, en pagos históricos a cuentas **BCP** |

**Pagos nuevos:** todos los campos vienen completos.

**Pagos históricos** (anteriores a este cambio): se reconstruyeron desde lo que realmente se le mandó al banco. Ese envío no incluía todos los datos, así que algunos campos pueden venir en `null`. Mostrar `—` en esos casos.

---

## Cuándo `beneficiarySnapshot` viene `null` entero

Solo en pagos viejos que fallaron antes de llegar al banco. En la práctica, **un viaje pagado siempre debería tenerlo**. Si llega `null`:

- **Recomendado:** mostrar el comprobante sin el bloque de la cuenta, con el texto "Datos de la cuenta no disponibles para este pago".
- **No** completarlo con `bus.owner.bankAccount`: es justamente el dato que puede estar mal.

---

## Ejemplo

```ts
interface BeneficiarySnapshot {
  ownerId: number | null;
  ownerName: string | null;
  bankCode: string | null;
  account: string;
  titularName: string | null;
  documentType: string;
  documentNumber: string;
  documentExtension: string;
  branchOfficeId: number | null;
}

function getReceiptBeneficiary(travel: Travel): BeneficiarySnapshot | null {
  if (!travel.isPaid) return null; // no hay comprobante
  return travel.transaction?.beneficiarySnapshot ?? null;
}

// En el comprobante:
const b = getReceiptBeneficiary(travel);
if (b) {
  render({
    beneficiario: b.ownerName ?? '—',
    banco: b.bankCode ? bankName(b.bankCode) : '—', // mismo mapeo que hoy
    cuenta: b.account,
    titular: b.titularName ?? '—',
    documento: `${b.documentNumber} ${b.documentExtension}`.trim(),
  });
} else {
  renderSinDatosDeCuenta();
}
```

---

## Checklist de pruebas

- [ ] Abrir el comprobante de un viaje pagado → muestra los datos de `transaction.beneficiarySnapshot`.
- [ ] Editar la cuenta bancaria del dueño (cambiar número o titular) → el comprobante de ese viaje pagado **no cambia**.
- [ ] Cambiar el nombre del dueño → el comprobante **no cambia**.
- [ ] Un viaje **no pagado** del mismo dueño → sí muestra la cuenta **nueva** (es a la que se le va a pagar), leída de `travel.owner.bankAccount`.
- [ ] Hacer un pago nuevo → su comprobante muestra todos los campos completos.
- [ ] Un pago histórico a cuenta BCP → titular y departamento se muestran como `—`, sin romper la vista.
