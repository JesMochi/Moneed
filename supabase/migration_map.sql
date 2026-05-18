-- ============================================================
-- MonedaRed - Migración para el mapa inteligente
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- 1. Agregar columna supply_radius_km si no existe
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supply_radius_km numeric DEFAULT 10;

-- 2. Ampliar el constraint de roles para incluir productores
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('consumer', 'business', 'producer_farm', 'producer_artisan'));

-- NOTA: No se insertan datos demo aquí porque profiles.id requiere
-- un usuario real en auth.users. Los datos demo están integrados
-- directamente en el componente BusinessMap como fallback visual.
