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

-- 3. Datos demo para el mapa (coordenadas de Monterrey, NL)
-- Ajusta lat/lng a la ciudad del evento si es necesario
INSERT INTO profiles (id, name, role, category, lat, lng, supply_radius_km, balance)
VALUES
  (gen_random_uuid(), 'Rancho San Miguel',       'producer_farm',     'Miel orgánica',      25.6750, -100.3180, 15, 500),
  (gen_random_uuid(), 'Cooperativa Maíz Criollo','producer_farm',     'Maíz y granos',      25.6800, -100.3050, 20, 350),
  (gen_random_uuid(), 'Taller Barro Negro',       'producer_artisan',  'Cerámica artesanal', 25.6640, -100.3220, 10, 200),
  (gen_random_uuid(), 'Bordados Doña Rosa',       'producer_artisan',  'Textiles bordados',  25.6710, -100.2980, 8,  180),
  (gen_random_uuid(), 'Cafetería El Buen Sabor',  'business',          'Cafetería',          25.6691, -100.3098, 10, 300),
  (gen_random_uuid(), 'Panadería La Aurora',      'business',          'Panadería',          25.6720, -100.3150, 12, 420)
ON CONFLICT DO NOTHING;
