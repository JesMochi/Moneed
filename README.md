# MonedaRed

Sistema de circulación económica local — HackaTec 2026 · TecNM

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend / DB:** Supabase (Auth + PostgreSQL)
- **QR:** qrcode + html5-qrcode
- **Mapa:** Leaflet.js + OpenStreetMap
- **Deploy:** Vercel + Supabase (gratuito)

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno y rellenar con tus datos de Supabase
# Editar .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Ejecutar el schema en Supabase SQL Editor
# Archivo: supabase/schema.sql

# 4. Correr en desarrollo
npm run dev
```

## Estructura

```
app/
├── (auth)/login        → Login
├── (auth)/register     → Registro
└── (dashboard)/
    ├── home            → Wallet + saldo
    ├── transfer        → Escanear QR y pagar
    ├── receive         → Generar QR de cobro
    ├── history         → Historial de movimientos
    └── map             → Mapa de negocios
```

## Equipo HackaTec 2026
