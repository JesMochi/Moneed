import { NextResponse } from 'next/server'

// La protección de rutas la maneja cada página con supabase.auth.getUser()
// El middleware de servidor no puede leer la sesión de localStorage del cliente
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
