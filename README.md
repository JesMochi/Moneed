# MonedaRed

> Sistema de circulación económica local — HackaTec 2026 · TecNM  
> Reto 1: Ecosistemas de Desarrollo · Temática: Economía Social y Regional

MonedaRed **no es una fintech ni un banco digital**. Es la infraestructura que hace que el dinero no se vaya de tu comunidad.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend / DB | Supabase (Auth + PostgreSQL) |
| QR generación | `qrcode` |
| QR lectura | `html5-qrcode` |
| Mapa | Leaflet.js + OpenStreetMap |
| Deploy | Vercel + Supabase (100% gratuito) |

---

## Setup local

### 1. Clonar e instalar

```bash
git clone <url-del-repo>
cd monedared
npm install
```

### 2. Variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

Encuentra estos valores en tu proyecto Supabase → **Settings → API**.

### 3. Configurar Supabase

En el **SQL Editor** de Supabase, ejecuta en este orden:

1. `supabase/schema.sql` — tablas, RLS y función RPC de transferencias
2. `supabase/rpc_stats.sql` — función de estadísticas comunitarias

En **Authentication → Settings**, desactiva **"Enable email confirmations"** para que el registro funcione sin confirmar email en la demo.

### 4. Correr en desarrollo

```bash
npm run dev
# Abre http://localhost:3000
```

---

## Funcionalidades del MVP

- **Autenticación** — Registro e inicio de sesión (email + contraseña)
- **Wallet personal** — Saldo en NodoCoins (1 NC = 1 peso), caducidad visual a 30 días
- **Transferencia por QR** — El negocio genera un QR con monto; el consumidor lo escanea y confirma
- **Historial** — Movimientos enviados (rojo ↑) y recibidos (verde ↓)
- **Mapa de negocios** — Leaflet + OpenStreetMap, pines rojos con popup
- **Dashboard de impacto** — "X% del valor circuló localmente" con animación

---

## Estructura del proyecto

```
monedared/
├── app/
│   ├── (auth)/
│   │   ├── login/          → Inicio de sesión
│   │   └── register/       → Registro (consumidor o negocio)
│   └── (dashboard)/
│       ├── layout.tsx       → Navbar inferior
│       ├── home/            → Wallet + acciones + dashboard de impacto
│       ├── transfer/        → Escanear QR y pagar
│       ├── receive/         → Generar QR de cobro (solo negocios)
│       ├── history/         → Historial de movimientos
│       └── map/             → Mapa de negocios aceptantes
├── components/
│   ├── WalletCard.tsx       → Tarjeta de saldo con caducidad visual
│   ├── QRGenerator.tsx      → Genera QR de cobro con monto
│   ├── QRScanner.tsx        → Escanea QR y ejecuta transferencia
│   ├── TransactionList.tsx  → Lista de movimientos
│   ├── BusinessMap.tsx      → Mapa Leaflet con negocios
│   └── ImpactDashboard.tsx  → Métrica de circulación local
├── lib/
│   ├── supabase.ts          → Cliente Supabase + tipos
│   └── utils.ts             → formatNC, formatDate, diasParaVencer
└── supabase/
    ├── schema.sql            → Tablas + RLS + RPC transfer_nocoins + trigger
    └── rpc_stats.sql         → RPC get_community_stats
```

---

## Roles de usuario

| Rol | Puede hacer |
|-----|------------|
| **Consumidor** | Ver saldo, escanear QR, pagar, ver historial, ver mapa |
| **Negocio** | Todo lo anterior + generar QR de cobro con monto personalizado |

---

## Equipo HackaTec 2026 · TecNM
